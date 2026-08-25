import io, json, math
from urllib.parse import urlencode
import requests
import numpy as np
import pandas as pd
from datetime import time

TICKERS=['QQQ','NVDA','MU','VRT','MRVL','CRCL','AAOI']
START='2025-06-05 09:30:00'
END='2026-08-08 00:00:00'
COMMISSION_PER_SHARE=0.0005
SLIPPAGE_BPS_CASES=[0.0,1.0]

params={'tickers':','.join(TICKERS),'timeframe':'1min','adjustment':'adj_split','start':START,'end':END,'order':'asc','limit':2000000,'format':'csv'}
url='https://www.hfmarketdata.io/v1/bars/stock?'+urlencode(params)
print('DATA_URL',url)
r=requests.get(url,timeout=180); print('HTTP',r.status_code,'BYTES',len(r.content)); r.raise_for_status()
df=pd.read_csv(io.StringIO(r.text)); df.columns=[c.lower().strip() for c in df.columns]
df['datetime']=pd.to_datetime(df['datetime']); df['ticker']=df['ticker'].astype(str).str.upper()
for c in ['open','high','low','close','volume']: df[c]=pd.to_numeric(df[c],errors='coerce')
df=df.dropna(subset=['datetime','open','high','low','close','volume']).drop_duplicates(['ticker','datetime'],keep='last')
# True RTH minute bars: 09:30 through 15:59 (390 minutes); exclude 16:00 post/auction-labelled minute.
tm=df.datetime.dt.time
df=df[(tm>=time(9,30))&(tm<time(16,0))].sort_values(['ticker','datetime']).copy()
df['date']=df.datetime.dt.date
# paper Eq.1: cumulative HLC3*volume / volume, reset each session
tp=(df.high+df.low+df.close)/3.0
df['pv']=tp*df.volume
df['cum_pv']=df.groupby(['ticker','date']).pv.cumsum(); df['cum_vol']=df.groupby(['ticker','date']).volume.cumsum(); df['vwap']=df.cum_pv/df.cum_vol

def allowed_at(dt, variant):
    t=dt.time()
    if variant=='paper': return time(9,31)<=t<time(16,0)
    # paper-inspired time-of-day filter: exposed 09:31-12:00 and 15:00-16:00 only
    return (time(9,31)<=t<time(12,0)) or (time(15,0)<=t<time(16,0))

def desired_signal(d, i, variant):
    # signal observed at close of bar i, executable at next bar's open
    s=1 if d.iloc[i].close>d.iloc[i].vwap else -1 if d.iloc[i].close<d.iloc[i].vwap else 0
    if variant!='confirm2_time': return s
    if i<1: return 0
    s0=1 if d.iloc[i-1].close>d.iloc[i-1].vwap else -1 if d.iloc[i-1].close<d.iloc[i-1].vwap else 0
    return s if s==s0 else 0

def simulate_ticker(g,variant,slip_bps):
    equity=25000.0; peak=equity; maxdd=0.0; trades=[]; daily=[]; executions=0
    for day,d in g.groupby('date',sort=True):
        d=d.sort_values('datetime').reset_index(drop=True)
        if len(d)<300: continue
        day_start_equity=equity
        pos=0; shares=0.0; entry_px=None; entry_eq=None; entry_time=None
        # iterate signal bar i; execution at next bar open
        for i in range(len(d)-1):
            nxt=d.iloc[i+1]; exec_time=nxt.datetime
            allow=allowed_at(exec_time,variant)
            sig=desired_signal(d,i,variant)
            target=sig if allow and sig!=0 else (pos if allow and variant=='confirm2_time' and sig==0 else 0)
            # midday flat: target 0 outside allowed windows
            if target==pos: continue
            px=float(nxt.open)
            # close old position first
            if pos!=0:
                pnl=shares*pos*(px-entry_px)
                equity += pnl
                commission=COMMISSION_PER_SHARE*shares
                slip=shares*px*(slip_bps/10000.0)
                equity -= commission+slip; executions+=1
                ret=(equity-entry_eq)/entry_eq
                trades.append({'date':str(day),'dir':pos,'entry_time':str(entry_time),'exit_time':str(exec_time),'ret':ret})
                pos=0; shares=0; entry_px=None
            if target!=0:
                # 100% current equity notional, no leverage
                shares=equity/px
                commission=COMMISSION_PER_SHARE*shares
                slip=shares*px*(slip_bps/10000.0)
                equity -= commission+slip; executions+=1
                entry_eq=equity; entry_px=px; entry_time=exec_time; pos=target
        # flatten at 15:59 close (paper: no overnight)
        if pos!=0:
            px=float(d.iloc[-1].close); et=d.iloc[-1].datetime
            pnl=shares*pos*(px-entry_px); equity+=pnl
            commission=COMMISSION_PER_SHARE*shares; slip=shares*px*(slip_bps/10000.0); equity-=commission+slip; executions+=1
            ret=(equity-entry_eq)/entry_eq
            trades.append({'date':str(day),'dir':pos,'entry_time':str(entry_time),'exit_time':str(et),'ret':ret})
        dret=equity/day_start_equity-1; daily.append((str(day),dret,equity))
        peak=max(peak,equity); maxdd=min(maxdd,equity/peak-1)
    tr=pd.DataFrame(trades); dy=pd.DataFrame(daily,columns=['date','ret','equity'])
    if len(dy):
        vol=dy.ret.std(ddof=1)*np.sqrt(252) if len(dy)>1 else np.nan
        ann=(dy.ret.mean()*252)
        sharpe=ann/vol if vol and vol>0 else np.nan
    else: vol=ann=sharpe=np.nan
    if len(tr):
        wins=tr[tr.ret>0].ret; losses=tr[tr.ret<0].ret
        pf=wins.sum()/abs(losses.sum()) if len(losses) and losses.sum()!=0 else np.inf
        hit=(tr.ret>0).mean(); gainloss=wins.mean()/abs(losses.mean()) if len(wins) and len(losses) else np.nan
    else: pf=hit=gainloss=np.nan
    return {'days':len(dy),'trades':len(tr),'executions':executions,'hit_pct':hit*100 if pd.notna(hit) else None,'gain_loss':gainloss,'profit_factor':pf,'total_return_pct':(equity/25000-1)*100,'ann_mean_return_pct':ann*100 if pd.notna(ann) else None,'ann_vol_pct':vol*100 if pd.notna(vol) else None,'sharpe':sharpe,'maxdd_pct':maxdd*100,'daily':dy,'trades_df':tr}

coverage=[]; results=[]; robustness=[]
for t in TICKERS:
    g=df[df.ticker==t]
    coverage.append({'ticker':t,'bars':len(g),'days':g.date.nunique(),'first':str(g.datetime.min()),'last':str(g.datetime.max())})
    for variant in ['paper','time_filter','confirm2_time']:
        for slip in SLIPPAGE_BPS_CASES:
            x=simulate_ticker(g,variant,slip)
            results.append({'ticker':t,'variant':variant,'slip_bps_per_execution':slip,**{k:v for k,v in x.items() if k not in ['daily','trades_df']}})
        # robustness only base paper commission / zero slippage: split dates 70/30 by calendar observations
        dates=sorted(g.date.unique()); cut=dates[int(len(dates)*0.7)] if dates else None
        if cut:
            for label,gg in [('first70',g[g.date<cut]),('last30',g[g.date>=cut])]:
                x=simulate_ticker(gg,variant,0.0)
                robustness.append({'ticker':t,'variant':variant,'segment':label,'cutoff':str(cut),**{k:v for k,v in x.items() if k not in ['daily','trades_df']}})

# normalize floats for JSON
def clean(o):
    if isinstance(o,(np.integer,)): return int(o)
    if isinstance(o,(np.floating,)): return None if not np.isfinite(o) else round(float(o),4)
    if isinstance(o,float): return None if not math.isfinite(o) else round(o,4)
    if isinstance(o,dict): return {k:clean(v) for k,v in o.items()}
    if isinstance(o,list): return [clean(v) for v in o]
    return o
print('PAPER_1M_RESULTS_BEGIN')
print(json.dumps(clean({'coverage':coverage,'results':results,'robustness':robustness}),indent=2))
print('PAPER_1M_RESULTS_END')
