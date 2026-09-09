@echo off
setlocal
cd /d "%~dp0"
title Refraction 3D - Prepare Self-Contained Build

echo.
echo ================================================
echo   Refraction 3D - Prepare self-contained build
echo ================================================
echo.

if not exist "vendor" mkdir "vendor"

if exist "vendor\three.module.min.js" if exist "vendor\three.core.min.js" goto :ready

set "SOURCE="
if exist "..\convection\vendor\three.module.min.js" if exist "..\convection\vendor\three.core.min.js" set "SOURCE=..\convection\vendor"
if not defined SOURCE if exist "..\..\convection\vendor\three.module.min.js" if exist "..\..\convection\vendor\three.core.min.js" set "SOURCE=..\..\convection\vendor"

if defined SOURCE (
  echo Found an existing convection vendor folder:
  echo   %SOURCE%
  echo.
  copy /Y "%SOURCE%\three.module.min.js" "vendor\three.module.min.js" >nul
  copy /Y "%SOURCE%\three.core.min.js" "vendor\three.core.min.js" >nul
)

if not exist "vendor\three.module.min.js" goto :missing
if not exist "vendor\three.core.min.js" goto :missing

:ready
echo READY.
echo.
echo vendor\ now contains:
echo   three.module.min.js
echo   three.core.min.js
echo.
echo The applet is self-contained and does not require a Three.js CDN.
echo You can now double-click run-preview.bat.
echo.
pause
exit /b 0

:missing
echo The two Three.js files were not found automatically.
echo.
echo Copy the vendor folder from your convection applet into this folder,
echo then run this preparation file again.
echo.
echo Required final structure:
echo   vendor\three.module.min.js
echo   vendor\three.core.min.js
echo.
pause
exit /b 1
