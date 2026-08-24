# Agenda o seed de súmulas/OJs/PNs todos os dias às 03:00 (PC ligado).
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-sumulas.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && npx --yes tsx scripts/seed-sumulas-diario.ts >> `"$repo\scripts\seed-sumulas-diario.log`" 2>&1"

schtasks /Create /F /TN "FACTO-seed-sumulas-03h" /SC DAILY /ST 03:00 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-seed-sumulas-03h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-seed-sumulas-03h" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-seed-sumulas-03h criada (diária 03:00)."
Write-Host "PC ligado (sem dormir). Log: scripts\seed-sumulas-diario.log"
Write-Host "Estado: scripts\seed-sumulas-estado.json"
Write-Host "Fontes: scripts\sumulas-fonte\"
Write-Host "Para rodar agora: npm run seed:sumulas-diario"
