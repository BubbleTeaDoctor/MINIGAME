param(
  [string]$Root = "E:\minigame\antigravity",
  [int]$Port = 8765
)

$ErrorActionPreference = "Stop"

function Get-ContentType([string]$Path) {
  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css"  { return "text/css; charset=utf-8" }
    ".js"   { return "text/javascript; charset=utf-8" }
    ".mjs"  { return "text/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".wasm" { return "application/wasm" }
    ".png"  { return "image/png" }
    ".jpg"  { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".gif"  { return "image/gif" }
    ".svg"  { return "image/svg+xml" }
    ".ico"  { return "image/x-icon" }
    ".txt"  { return "text/plain; charset=utf-8" }
    ".mp3"  { return "audio/mpeg" }
    ".wav"  { return "audio/wav" }
    default { return "application/octet-stream" }
  }
}

function Get-CardArtManifestBytes([string]$RootPath) {
  $artRoot = Join-Path $RootPath "assets\card_art"
  $images = @()
  if (Test-Path -LiteralPath $artRoot) {
    $images = Get-ChildItem -LiteralPath $artRoot -File |
      Where-Object {
        $_.Name -ne "manifest.json" -and
        @(".png", ".jpg", ".jpeg", ".webp", ".gif") -contains $_.Extension.ToLowerInvariant()
      } |
      Sort-Object Name |
      ForEach-Object {
        [pscustomobject]@{
          name = [IO.Path]::GetFileNameWithoutExtension($_.Name)
          label = [IO.Path]::GetFileNameWithoutExtension($_.Name)
          file = $_.Name
          path = "assets/card_art/$($_.Name)"
        }
      }
  }
  $manifest = [pscustomobject]@{
    images = @($images)
    count = @($images).Count
    generatedAt = (Get-Date).ToString("o")
  }
  $json = $manifest | ConvertTo-Json -Depth 5
  return [Text.Encoding]::UTF8.GetBytes($json)
}

$rootPath = [IO.Path]::GetFullPath($Root)
$listener = [Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
      }

      if ($requestPath -ieq "assets/card_art/manifest.json") {
        $bytes = Get-CardArtManifestBytes $rootPath
        $context.Response.StatusCode = 200
        $context.Response.ContentType = "application/json; charset=utf-8"
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate")
        $context.Response.AddHeader("Access-Control-Allow-Origin", "*")
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
        continue
      }

      $candidate = [IO.Path]::GetFullPath((Join-Path $rootPath $requestPath))
      if (-not $candidate.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)) {
        $context.Response.StatusCode = 403
        $context.Response.Close()
        continue
      }

      if ((Test-Path -LiteralPath $candidate) -and (Get-Item -LiteralPath $candidate).PSIsContainer) {
        $candidate = Join-Path $candidate "index.html"
      }

      if (-not (Test-Path -LiteralPath $candidate)) {
        $context.Response.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
        $context.Response.ContentType = "text/plain; charset=utf-8"
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
        continue
      }

      $bytes = [IO.File]::ReadAllBytes($candidate)
      $context.Response.StatusCode = 200
      $context.Response.ContentType = Get-ContentType $candidate
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate")
      $context.Response.AddHeader("Access-Control-Allow-Origin", "*")
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
    } catch {
      try {
        $context.Response.StatusCode = 500
        $bytes = [Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
        $context.Response.ContentType = "text/plain; charset=utf-8"
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
      } catch {}
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
