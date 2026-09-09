@echo off
setlocal
cd /d "%~dp0"
title Refraction 3D - Local Preview

echo.
echo ================================================
echo   Dr Pop's Enriched Revision - Refraction 3D
echo   Local preview server
echo ================================================
echo.

if not exist "vendor\three.module.min.js" (
  echo ERROR: vendor\three.module.min.js is missing.
  echo Copy the vendor folder from the convection applet first,
  echo or run prepare-self-contained.bat.
  echo.
  pause
  exit /b 1
)

if not exist "vendor\three.core.min.js" (
  echo ERROR: vendor\three.core.min.js is missing.
  echo Copy the matching vendor folder from the convection applet first,
  echo or run prepare-self-contained.bat.
  echo.
  pause
  exit /b 1
)

set "PYTHON_CMD="
where py >nul 2>&1
if %errorlevel%==0 set "PYTHON_CMD=py -3"
if not defined PYTHON_CMD (
  where python >nul 2>&1
  if %errorlevel%==0 set "PYTHON_CMD=python"
)

if not defined PYTHON_CMD (
  echo ERROR: Python was not found on this computer.
  echo Install Python, or use another local HTTP server.
  echo Do not open index.html directly because ES modules require HTTP.
  echo.
  pause
  exit /b 1
)

echo Opening http://127.0.0.1:8000/
echo Close this window or press Ctrl+C to stop the preview server.
echo.

start "" cmd /c "timeout /t 1 /nobreak ^>nul ^& start \"\" http://127.0.0.1:8000/"
%PYTHON_CMD% -m http.server 8000 --bind 127.0.0.1

endlocal
