import type { Security, Snapshot } from "./store.js";
export const ret=(current:number,start:number)=>start?((current/start)-1)*100:0;
export const spread=(bid:number,ask:number)=>ask-bid;
export const mid=(bid:number,ask:number)=>(bid+ask)/2;
export const spreadBps=(bid:number,ask:number)=>{const m=mid(bid,ask);return m?((ask-bid)/m)*10000:0};
export const level=(s:number)=>s>=80?"CRITICAL":s>=60?"HIGH":s>=30?"MODERATE":"LOW";
export function attention(sec:Security,snap:Snapshot|undefined,benchmark:Security){
  if(!snap||snap.prices[sec.id]===undefined)return {score:0,level:"LOW",relative:0,volumeRatio:sec.baseVolume?sec.volume/sec.baseVolume:0,priceChange:0};
  const priceChange=ret(sec.price,snap.prices[sec.id]);
  const benchChange=ret(benchmark.price,snap.benchmarkValue);
  const relative=priceChange-benchChange;
  const volumeRatio=sec.volume/Math.max(1,snap.volumes[sec.id]||sec.baseVolume);
  const priceComp=Math.min(100,Math.abs(priceChange)*18);
  const relComp=Math.min(100,Math.abs(relative)*14);
  const volumeComp=Math.min(100,Math.max(0,(volumeRatio-1)*70));
  const volatilityComp=Math.min(100,Math.abs(priceChange)*12);
  const microComp=Math.min(100,Math.abs(spreadBps(sec.bid,sec.ask))*3);
  const raw=.35*priceComp+.25*relComp+.20*volumeComp+.10*volatilityComp+.10*microComp;
  const score=Math.round(Math.max(0,Math.min(100,raw)));
  return {score,level:level(score),relative,volumeRatio,priceChange};
}
export function explain(sec:Security,a:ReturnType<typeof attention>){
  if(a.score===0)return "No snapshot exists yet. Mark the watchlist reviewed to establish a baseline.";
  const parts:string[]=[];
  if(Math.abs(a.priceChange)>=1)parts.push(`price moved ${a.priceChange>=0?"up":"down"} ${Math.abs(a.priceChange).toFixed(2)}%`);
  if(Math.abs(a.relative)>=0.5)parts.push(`relative performance versus NIFTY 50 is ${a.relative>=0?"positive":"negative"} by ${Math.abs(a.relative).toFixed(2)} percentage points`);
  if(a.volumeRatio>=1.25)parts.push(`volume is ${a.volumeRatio.toFixed(1)}× the snapshot level`);
  return parts.length?`${sec.symbol}: ${parts.join("; ")}.`:`${sec.symbol}: no material change detected from the available snapshot fields.`;
}
export function change(sec:Security,snap:Snapshot|undefined,benchmark:Security){const a=attention(sec,snap,benchmark);return {...a,yieldChange:sec.assetType==="GSEC"&&snap?sec.price-(snap.prices[sec.id]??sec.price):0,meaningful:a.score>=30,why:explain(sec,a)};}
