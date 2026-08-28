@echo off
cd /d "%~dp0.."
echo. >> scripts\smoke-areas-lastro.log
echo ===== SMOKE %date% %time% ===== >> scripts\smoke-areas-lastro.log
call npm run test:smoke-areas-lastro >> scripts\smoke-areas-lastro.log 2>&1
