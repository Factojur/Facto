# Agenda seed P2b TJs (e-SAJ) a cada 3 horas.
# 1 TJ · 2 temas · ~3 anos · reindex paygo só tj*-portal.
# Execute uma vez:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-tj-portal.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && set PLAYWRIGHT_BROWSERS_PATH=%LOCALAPPDATA%\ms-playwright&& npx --yes tsx scripts/seed-juris-tj-portal-diario.ts >> `"$repo\scripts\seed-juris-tj-portal-diario.log`" 2>&1"

schtasks /Create /F /TN "FACTO-seed-tj-portal-3h" /SC HOURLY /MO 3 /ST 00:30 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-seed-tj-portal-3h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-seed-tj-portal-3h" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-seed-tj-portal-3h criada (a cada 3 horas, a partir de 00:30)."
Write-Host "PC ligado. Log: scripts\seed-juris-tj-portal-diario.log"
Write-Host "Estado: scripts\seed-juris-tj-portal-estado.json"
Write-Host "Manual: npm run seed:juris-tj-portal-diario"
Write-Host "Paygo: so embeddings fonte tj*-portal (GEMINI_API_KEY)."
