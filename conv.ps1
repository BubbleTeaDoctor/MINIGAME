 = Get-ChildItem 'E:\minigame\antigravity\arena_studio_v110' -Include *.js, *.json -Recurse  
foreach( in ){  
   = [System.IO.File]::ReadAllText(.FullName, [System.Text.Encoding]::GetEncoding('gbk'))  
  [System.IO.File]::WriteAllText(.FullName, , [System.Text.Encoding]::UTF8)  
  Write-Host " Converted " .Name  
} 
