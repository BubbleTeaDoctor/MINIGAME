@echo off
setlocal

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "PORT=8765"
set "URL=http://127.0.0.1:%PORT%/game.html"
set "SERVER_SCRIPT=%ROOT%\serve_local.ps1"
set "SERVER_LOG=%ROOT%\serve_local.log"
set "SERVER_ERR=%ROOT%\serve_local.err.log"

call :check_server
if errorlevel 1 (
  echo Starting local server on port %PORT%...
  powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command ^
    "Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File','%SERVER_SCRIPT%','-Root','%ROOT%','-Port','%PORT%' -RedirectStandardOutput '%SERVER_LOG%' -RedirectStandardError '%SERVER_ERR%'"

  set "READY="
  for /L %%I in (1,1,30) do (
    timeout /t 1 /nobreak >nul
    call :check_server
    if not errorlevel 1 (
      set "READY=1"
      goto :open_game
    )
  )

  echo.
  echo Failed to start the local server.
  echo See:
  echo   %SERVER_LOG%
  echo   %SERVER_ERR%
  exit /b 1
)

:open_game
start "" "%URL%"
exit /b 0

:check_server
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $r = Invoke-WebRequest '%URL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
exit /b %errorlevel%
