export const PORT = Number(process.env.PORT || 4000);
export const DATA_MODE = process.env.DATA_MODE || "DEMO";
export const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",").map(x => x.trim()).filter(Boolean);
export const DATABASE_URL = process.env.DATABASE_URL || "";
