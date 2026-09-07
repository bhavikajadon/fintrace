import express from "express";
import cors from "cors";
import {
  addAlert,
  deleteAlert,
  markReviewed,
  readState,
  resetState,
  simulate,
  writeState,
} from "./store.js";
import { attention, change, ret, spread, spreadBps } from "./analytics.js";
import { corsOrigins, DATA_MODE } from "./config.js";

export const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        corsOrigins.includes("*") ||
        corsOrigins.includes(origin)
      ) {
        return cb(null, true);
      }

      return cb(new Error("CORS blocked"));
    },
  }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) =>
  res.json({
    name: "FINTRACE API",
    version: "1.0.0",
    mode: DATA_MODE,
    status: "ready",
  }),
);

app.get("/health", (_req, res) =>
  res.json({
    status: "healthy",
    mode: DATA_MODE,
    timestamp: new Date().toISOString(),
  }),
);

app.get("/api/status", (_req, res) =>
  res.json({
    mode: DATA_MODE,
    timestamp: new Date().toISOString(),
    movementVersion: readState().movementVersion,
  }),
);

app.get("/api/securities", (req, res) => {
  const s = readState();
  const q = String(req.query.q || "").toLowerCase();

  const list = s.securities.filter(
    (x) =>
      !q ||
      x.symbol.toLowerCase().includes(q) ||
      x.name.toLowerCase().includes(q),
  );

  res.json(list);
});

app.get("/api/securities/:id", (req, res) => {
  const s = readState();
  const sec = s.securities.find((x) => x.id === req.params.id);

  if (!sec) {
    return res.status(404).json({ error: "Security not found" });
  }

  const bench = s.securities.find((x) => x.id === "s11")!;
  const w = s.watchlists[0];
  const a = attention(sec, w.snapshot, bench);

  res.json({
    ...sec,
    spread: spread(sec.bid, sec.ask),
    spreadBps: spreadBps(sec.bid, sec.ask),
    attention: a,
    returns: {
      d1: ret(sec.price, sec.history.at(-2)?.close ?? sec.price),
      d5: ret(sec.price, sec.history.at(-6)?.close ?? sec.price),
      m1: ret(sec.price, sec.history.at(-22)?.close ?? sec.price),
      y1: ret(sec.price, sec.history[0]?.close ?? sec.price),
    },
  });
});

app.get("/api/securities/:id/history", (req, res) => {
  const sec = readState().securities.find((x) => x.id === req.params.id);

  if (!sec) {
    return res.status(404).json({ error: "Security not found" });
  }

  res.json(sec.history);
});

app.get("/api/watchlists", (_req, res) => {
  const s = readState();
  const w = s.watchlists[0];
  const bench = s.securities.find((x) => x.id === "s11")!;

  const items = w.items.map((id) => {
    const sec = s.securities.find((x) => x.id === id)!;
    const c = change(sec, w.snapshot, bench);

    return {
      ...sec,
      attention: c,
      spread: spread(sec.bid, sec.ask),
      spreadBps: spreadBps(sec.bid, sec.ask),
    };
  });

  const changes = items
    .filter((x) => x.attention.meaningful)
    .sort((a, b) => b.attention.score - a.attention.score);

  res.json({
    ...w,
    items,
    changes,
  });
});

app.post("/api/watchlists/:id/items", (req, res) => {
  const s = readState();
  const w = s.watchlists.find((x) => x.id === req.params.id);
  const id = String(req.body?.securityId || "");

  if (!w) {
    return res.status(404).json({ error: "Watchlist not found" });
  }

  if (!s.securities.some((x) => x.id === id)) {
    return res.status(400).json({ error: "Security not found" });
  }

  if (!w.items.includes(id)) {
    w.items.push(id);
  }

  w.updatedAt = new Date().toISOString();
  writeState(s);

  res.json(w);
});

app.delete("/api/watchlists/:id/items/:securityId", (req, res) => {
  const s = readState();
  const w = s.watchlists.find((x) => x.id === req.params.id);

  if (!w) {
    return res.status(404).json({ error: "Watchlist not found" });
  }

  w.items = w.items.filter((x) => x !== req.params.securityId);

  writeState(s);
  res.json(w);
});

app.put("/api/watchlists/:id/items/reorder", (req, res) => {
  const s = readState();
  const w = s.watchlists.find((x) => x.id === req.params.id);
  const items = req.body?.items;

  if (!w || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid reorder request" });
  }

  const allowed = new Set(s.securities.map((x) => x.id));

  w.items = items.filter((id: string) => allowed.has(id));

  writeState(s);
  res.json(w);
});

app.post("/api/watchlists/:id/snapshot", (req, res) => {
  try {
    res.json(markReviewed(req.params.id).watchlists[0]);
  } catch (e) {
    res.status(404).json({ error: String(e) });
  }
});

app.post("/api/demo/simulate", (_req, res) => {
  res.json(simulate());
});

app.post("/api/demo/reset", (_req, res) => {
  resetState();
  res.json(readState());
});

app.get("/api/rrg", (_req, res) => {
  const s = readState();
  const bench = s.securities.find((x) => x.id === "s11")!;
  const eq = s.securities.filter((x) => x.assetType === "EQUITY");

  const rsRaw = eq.map((sec) => (sec.price / bench.price) * 100);

  const mean =
    rsRaw.reduce((a, b) => a + b, 0) / Math.max(1, rsRaw.length);

  const sd = Math.sqrt(
    rsRaw.reduce((a, b) => a + (b - mean) ** 2, 0) /
      Math.max(1, rsRaw.length),
  );

  const points = eq.map((sec, i) => {
    const rs = rsRaw[i];

    const prevSec = sec.history.at(-2)?.close ?? sec.price;
    const prevBench = bench.history.at(-2)?.close ?? bench.price;

    const prev = (prevSec / prevBench) * 100;

    const momentum = (rs / prev - 1) * 10000;

    const x = 100 + ((rs - mean) / Math.max(sd, 0.01)) * 2;
    const y = 100 + momentum / 20;

    const quadrant =
      x >= 100 && y >= 100
        ? "LEADING"
        : x >= 100
          ? "WEAKENING"
          : y >= 100
            ? "IMPROVING"
            : "LAGGING";

    return {
      symbol: sec.symbol,
      x,
      y,
      quadrant,
      relativeStrength: rs,
      momentum,
    };
  });

  res.json(points);
});

app.get("/api/fixed-income", (_req, res) => {
  const s = readState();

  const five = s.securities.find((x) => x.id === "s13")!;
  const ten = s.securities.find((x) => x.id === "s14")!;

  res.json({
    five,
    ten,
    spread: (ten.price - five.price) * 100,
    status: five.status,
  });
});

app.get("/api/alerts", (_req, res) => {
  res.json(readState().alerts);
});

app.post("/api/alerts", (req, res) => {
  try {
    const state = readState();
    const security = state.securities.find(
      (item) => item.id === String(req.body.securityId)
    );

    if (!security) {
      return res.status(400).json({ error: "Security not found" });
    }

    const a = addAlert({
      symbol: security.symbol,
      metric: req.body.metric,
      operator: req.body.operator,
      threshold: Number(req.body.threshold),
    });

    res.status(201).json(a);
  } catch {
    res.status(400).json({ error: "Invalid alert" });
  }
});

app.delete("/api/alerts/:id", (req, res) => {
  deleteAlert(req.params.id);
  res.status(204).send();
});

app.get("/api/export/demo.json", (_req, res) => {
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=fintrace-demo-state.json",
  );

  res.json(readState());
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});


