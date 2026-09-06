import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type AssetType = "EQUITY" | "INDEX" | "GSEC";
export type Status = "LIVE" | "DELAYED" | "STALE" | "DEMO" | "ERROR";
export type HistoryPoint = { timestamp: string; close: number; volume: number };
export type Security = {
  id: string; symbol: string; name: string; exchange: string; assetType: AssetType;
  price: number; bid: number; ask: number; volume: number; baseVolume: number;
  timestamp: string; status: Status; sector?: string; history: HistoryPoint[];
};
export type Snapshot = {
  id: string; userId: string; watchlistId: string; timestamp: string;
  prices: Record<string, number>; volumes: Record<string, number>; bids: Record<string, number>;
  asks: Record<string, number>; benchmarkValue: number;
};
export type Alert = { id:string; symbol:string; metric:"price"|"return1d"|"attention"|"volumeRatio"; operator:">"|"<"|">="|"<="; threshold:number; active:boolean; createdAt:string; triggeredAt?:string };
export type Watchlist = { id:string; name:string; items:string[]; snapshot?:Snapshot; updatedAt:string };
export type State = { securities:Security[]; watchlists:Watchlist[]; alerts:Alert[]; movementVersion:number; reviewed:boolean; updatedAt:string };

const stateFile = path.resolve(process.env.FINTRACE_STATE_FILE || "backend/data/state.json");
const now = () => new Date().toISOString();

const seeds = [
  ["s1","RELIANCE","Reliance Industries Ltd","EQUITY",1479.64,"Energy"],
  ["s2","TCS","Tata Consultancy Services Ltd","EQUITY",3720.20,"IT Services"],
  ["s3","INFY","Infosys Ltd","EQUITY",1728.90,"IT Services"],
  ["s4","HDFCBANK","HDFC Bank Ltd","EQUITY",1664.20,"Banking"],
  ["s5","ICICIBANK","ICICI Bank Ltd","EQUITY",1298.30,"Banking"],
  ["s6","SBIN","State Bank of India","EQUITY",834.10,"Banking"],
  ["s7","ITC","ITC Ltd","EQUITY",512.40,"Consumer"],
  ["s8","BHARTIARTL","Bharti Airtel Ltd","EQUITY",1918.70,"Telecom"],
  ["s9","LT","Larsen & Toubro Ltd","EQUITY",3832.10,"Industrials"],
  ["s10","AXISBANK","Axis Bank Ltd","EQUITY",1187.50,"Banking"],
  ["s11","NIFTY50","NIFTY 50","INDEX",24850,"Benchmark"],
  ["s12","NIFTYBANK","NIFTY BANK","INDEX",54820,"Benchmark"],
  ["s13","GSEC5Y","GSEC 5Y","GSEC",6.76,"Sovereign"],
  ["s14","GSEC10Y","GSEC 10Y","GSEC",6.91,"Sovereign"]
] as const;

function history(base:number, seed:number):HistoryPoint[]{
  const out:HistoryPoint[]=[];
  for(let i=0;i<252;i++){
    const t = new Date(Date.now() - (251-i)*86400000);
    const cyc = Math.sin((i+seed)*0.31)*0.009 + Math.sin((i+seed)*0.071)*0.015;
    const drift = (i/251)*0.10;
    const close = base*(1-drift+cyc);
    const volume = 450000 + ((i*seed*7919)%950000);
    out.push({timestamp:t.toISOString(),close,volume});
  }
  out[out.length-1] = {timestamp:now(),close:base,volume:900000+seed*10000};
  return out;
}

export function defaultState():State{
  const timestamp=now();
  const securities:Security[]=seeds.map(([id,symbol,name,assetType,price,sector],i)=>{
    const isRate=assetType==="GSEC";
    const spread=isRate?0.01:Math.max(0.02,price*0.0002);
    const volume=isRate?0:900000+i*70000;
    return {id,symbol,name,exchange:assetType==="GSEC"?"RBI":"NSE",assetType,price,bid:price-spread/2,ask:price+spread/2,volume,baseVolume:Math.max(1,volume*0.7),timestamp,status:"DEMO",sector,history:history(price,i+3)};
  });
  return {securities,watchlists:[{id:"w1",name:"My Market",items:["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s13","s14"],updatedAt:timestamp}],alerts:[],movementVersion:0,reviewed:false,updatedAt:timestamp};
}

export function readState():State{
  try{return JSON.parse(fs.readFileSync(stateFile,"utf8")) as State}catch{const s=defaultState();writeState(s);return s;}
}
export function writeState(s:State){fs.mkdirSync(path.dirname(stateFile),{recursive:true});s.updatedAt=now();fs.writeFileSync(stateFile,JSON.stringify(s,null,2));}
export function resetState(){writeState(defaultState());}

export function markReviewed(watchlistId="w1"){
  const s=readState();const w=s.watchlists.find(x=>x.id===watchlistId);if(!w)throw new Error("Watchlist not found");
  const bench=s.securities.find(x=>x.id==="s11")!;
  const snap:Snapshot={id:crypto.randomUUID(),userId:"demo",watchlistId:w.id,timestamp:now(),
    prices:Object.fromEntries(w.items.map(id=>[id,s.securities.find(x=>x.id===id)?.price??0])),
    volumes:Object.fromEntries(w.items.map(id=>[id,s.securities.find(x=>x.id===id)?.volume??0])),
    bids:Object.fromEntries(w.items.map(id=>[id,s.securities.find(x=>x.id===id)?.bid??0])),
    asks:Object.fromEntries(w.items.map(id=>[id,s.securities.find(x=>x.id===id)?.ask??0])),benchmarkValue:bench.price};
  w.snapshot=snap;w.updatedAt=now();s.reviewed=true;writeState(s);return s;
}

export function simulate(){
  const s=readState();
  const multipliers:Record<string,number>={s1:1.042,s2:.979,s3:1.017,s4:1.008,s5:1.012,s6:.993,s7:1.006,s8:1.021,s9:1.014,s10:.986,s11:1.011,s12:1.006,s13:1.002,s14:1.007};
  s.securities=s.securities.map(sec=>{const m=multipliers[sec.id]??1;const price=sec.price*m;const oldSpread=sec.ask-sec.bid;const vol=sec.volume?(sec.volume*(sec.id==="s1"?1.8:sec.id==="s2"?1.45:1.12)):0;return {...sec,price,bid:price-oldSpread/2,ask:price+oldSpread/2,volume:vol,timestamp:now(),history:[...sec.history,{timestamp:now(),close:price,volume:vol}]};});
  s.movementVersion+=1;s.reviewed=false;writeState(s);return s;
}

export function addAlert(input:Omit<Alert,"id"|"createdAt"|"active">){const s=readState();const a:Alert={...input,id:crypto.randomUUID(),createdAt:now(),active:true};s.alerts.push(a);writeState(s);return a;}
export function deleteAlert(id:string){const s=readState();s.alerts=s.alerts.filter(a=>a.id!==id);writeState(s);}
