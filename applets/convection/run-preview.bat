@echo off
setlocal
title Dr Pop - Convection Applet Preview
cd /d "%~dp0"

set NEEDPREP=0
if not exist "vendor\three.module.min.js" set NEEDPREP=1
if not exist "vendor\three.core.min.js" set NEEDPREP=1

if "%NEEDPREP%"=="1" (
  echo Complete local Three.js bundle is not present yet.
  call "prepare-self-contained.bat"
  if errorlevel 1 exit /b 1
)

for %%A in ("vendor\three.module.min.js") do if %%~zA LSS 300000 set NEEDPREP=1
for %%A in ("vendor\three.core.min.js") do if %%~zA LSS 300000 set NEEDPREP=1

if "%NEEDPREP%"=="1" (
  echo Local Three.js files look incomplete.
  call "prepare-self-contained.bat"
  if errorlevel 1 exit /b 1
)

for /f %%P in ('powershell -NoProfile -Command "$l=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0);$l.Start();$p=$l.LocalEndpoint.Port;$l.Stop();Write-Output $p"') do set PORT=%%P

echo.
echo ============================================
echo   Dr Pop - Convection Applet Local Preview
echo ============================================
echo.
echo Runtime assets: LOCAL ONLY
echo Preview URL: http://127.0.0.1:%PORT%
echo.
echo Keep this window open while testing.
echo Close it when you are finished.
echo.

start "" "http://127.0.0.1:%PORT%"

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT% --bind 127.0.0.1
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT% --bind 127.0.0.1
  exit /b
)

echo Python was not found on this computer.
pause
