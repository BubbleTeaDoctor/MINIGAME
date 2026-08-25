import io, math, json
from urllib.parse import urlencode
import requests
import pandas as pd
import numpy as np
from datetime import time

TICKERS=['QQQ','NVDA','MU','VRT','MRVL','CRCL','AAOI']
STOCKS=['NVDA','MU','VRT','MRVL','CRCL','AAOI']
START='2025-06-05 09:30:00'; END='2026-08-07 16:00:00'
PAPER_FEE_PER_SHARE=0.0005

def fetch_one(asset,ticker):
    p={'timeframe':'1min','adjustment':'adj_split','start':START,'end':END,'order':'asc','limit':500000,'format':'csv'}
    u=f'https://www.hfmarketdata.io/v1/bars/{asset}/{ticker}?'+urlencode(p)
    r=requests.get(u,timeout=180); print('HTTP',ticker,r.status_code,'bytes',len(r.content)); r.raise_for_status()
    d=pd.read_csv(io.StringIO(r.text))
    if 'ticker' not in [c.lower() for c in d.columns]: d['ticker']=ticker
    return d

def load():
    parts=[fetch_one('stock',t) for t in STOCKS]
    parts.append(fetch_one('etf','QQQ'))
    d=pd.concat(parts,ignore_index=True)
    d.columns=[c.lower() for c in d.columns]
    d['ticker']=d['ticker'].astype(str).str.upper()
    d['datetime']=pd.to_datetime(d['datetime']); d=d.sort_values(['ticker','datetime'])
    tm=d.datetime.dt.time; d=d[(tm>=time(9,30))&(tm<time(16,0))].copy()
    d['date']=d.datetime.dt.date
    return d

def daily_vwap(g):
    tp=(g.high+g.low+g.close)/3.0
    return (tp*g.volume).cumsum()/g.volume.cumsum()

def run_day(g,variant='original',rt_bps=0.0):
    g=g.sort_values('datetime').reset_index(drop=True).copy(); g['svwap']=daily_vwap(g)
    eq=1.0; side=0; trades=0; flips=0
    def tx(cur,new,px,eqv):
        nonlocal trades,flips
        legs=abs(new-cur)
        if legs==0:return eqv
        if cur!=0 and new!=0 and cur!=new: flips+=1
        if new!=0 and cur!=new: trades+=1
        c=legs*(PAPER_FEE_PER_SHARE/px + (rt_bps/20000.0))
        return eqv*(1-c)
    for i in range(len(g)-1):
        row=g.iloc[i]; nxt=g.iloc[i+1]; nt=nxt.datetime.time()
        if side!=0: eq *= (1 + side*(nxt.open/row.open-1))
        force_flat=False
        if variant in ('timefilter','deadband') and nt>=time(12,0) and nt<time(15,0): force_flat=True
        desired=side
        if force_flat: desired=0
        else:
            upper=row.svwap; lower=row.svwap
            if variant=='deadband': upper*=1.001; lower*=0.999
            if row.close>upper: desired=1
            elif row.close<lower: desired=-1
            elif side==0: desired=0
        if desired!=side:
            eq=tx(side,desired,float(nxt.open),eq); side=desired
    last=g.iloc[-1]
    if side!=0:
        eq *= (1 + side*(last.close/last.open-1))
        eq=tx(side,0,float(last.close),eq)
    return eq-1,trades,flips

def summarize(df,variant,rt_bps):
    rows=[]
    for tick,g0 in df.groupby('ticker'):
        dr=[]; tr=fl=0
        for dt,g in g0.groupby('date'):
            if len(g)<350: continue
            r,n,f=run_day(g,variant,rt_bps); dr.append((dt,r)); tr+=n; fl+=f
        if not dr: continue
        s=pd.Series([x[1] for x in dr],index=[x[0] for x in dr])
        eq=(1+s).cumprod(); dd=eq/eq.cummax()-1
        ann=(eq.iloc[-1]**(252/len(s))-1) if eq.iloc[-1]>0 else -1
        sharpe=(s.mean()/s.std(ddof=1)*np.sqrt(252)) if s.std(ddof=1)>0 else np.nan
        rows.append({'ticker':tick,'variant':variant,'rt_bps_extra':rt_bps,'days':len(s),'total_return_pct':round((eq.iloc[-1]-1)*100,2),'ann_return_pct':round(ann*100,2),'sharpe':round(sharpe,3),'max_dd_pct':round(dd.min()*100,2),'positive_days_pct':round((s>0).mean()*100,2),'entries':tr,'flips':fl,'flips_per_day':round(fl/len(s),2),'avg_daily_bps':round(s.mean()*10000,2)})
    return rows

df=load(); print('COVERAGE',df.groupby('ticker').agg(bars=('close','size'),days=('date','nunique'),first=('datetime','min'),last=('datetime','max')).to_json(orient='index'))
allr=[]
for v in ['original','timefilter','deadband']:
    for c in [0.0,1.0,2.0]: allr += summarize(df,v,c)
print('RESULTS_BEGIN'); print(json.dumps(allr,indent=2)); print('RESULTS_END')
