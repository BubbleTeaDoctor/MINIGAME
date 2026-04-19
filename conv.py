import os  
for r,d,fs in os.walk('E:/minigame/antigravity/arena_studio_v110'):  
  for f in fs:  
    if f.endswith(('.js', '.json', '.html', '.css')):  
      p=os.path.join(r,f)  
      try:  
        with open(p,'rb') as fp: raw=fp.read()  
        try: raw.decode('utf-8'); continue  
        except: pass  
        text=raw.decode('gbk')  
        with open(p,'w',encoding='utf-8') as fp: fp.write(text)  
        print('Converted '+p)  
      except Exception as e: print('Err '+p, e) 
