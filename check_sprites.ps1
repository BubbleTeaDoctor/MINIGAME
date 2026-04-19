Add-Type -AssemblyName System.Drawing
$dir = "E:\minigame\antigravity\arena_studio_v110\assets\sprites\blue-witch"
Get-ChildItem "$dir\*.png" | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $name = $_.Name
    $w = $img.Width
    $h = $img.Height
    Write-Host "$name : $w x $h"
    $img.Dispose()
}
