 = Get-Content 'E:\minigame\antigravity\arena_studio_v110\game.js' -Raw 
 = .Replace('scale: 1.16, footOffset: 42,', 'scale: 1.05, footOffset: 20,') 
[System.IO.File]::WriteAllText('E:\minigame\antigravity\arena_studio_v110\game.js', , [System.Text.Encoding]::UTF8) 
