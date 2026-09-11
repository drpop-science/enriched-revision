@echo off
setlocal
title Dr Pop - Prepare Self-Contained Convection Applet
cd /d "%~dp0"

if not exist "vendor" mkdir "vendor"

echo.
echo ==================================================
echo  Preparing complete local Three.js bundle - V15.3.1
echo ==================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$files=@(" ^
  "  @{Name='three.module.min.js'; URLs=@('https://raw.githubusercontent.com/mrdoob/three.js/r185/build/three.module.min.js','https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js')}," ^
  "  @{Name='three.core.min.js'; URLs=@('https://raw.githubusercontent.com/mrdoob/three.js/r185/build/three.core.min.js','https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.core.min.js')}" ^
  ");" ^
  "foreach($f in $files){" ^
  "  $out=Join-Path $PWD ('vendor\' + $f.Name);" ^
  "  if((Test-Path $out) -and (Get-Item $out).Length -gt 300000){Write-Host ($f.Name + ' already ready'); continue};" ^
  "  $ok=$false;" ^
  "  foreach($u in $f.URLs){" ^
  "    try{" ^
  "      Write-Host ('Downloading ' + $f.Name + ' from ' + $u);" ^
  "      Invoke-WebRequest -UseBasicParsing -Uri $u -OutFile $out -TimeoutSec 45;" ^
  "      if((Get-Item $out).Length -gt 300000){$ok=$true; break}" ^
  "    }catch{Write-Warning $_.Exception.Message}" ^
  "  };" ^
  "  if(-not $ok){if(Test-Path $out){Remove-Item $out -Force}; throw ('Could not obtain ' + $f.Name)}" ^
  "};" ^
  "Write-Host 'Both local Three.js files are ready.'"

if errorlevel 1 (
  echo.
  echo Preparation failed. Please check the internet connection and try again.
  echo.
  pause
  exit /b 1
)

echo.
echo Complete local Three.js bundle is ready.
echo You can now use the applet without any runtime CDN dependency.
echo.
pause
exit /b 0
