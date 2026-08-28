# Agenda smoke de lastro (20 áreas) todos os dias às 06:00 — após seed juris (01h).
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-smoke-lastro.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runner = Join-Path $repo "scripts\rodar-smoke-lastro.cmd"
$tr = "cmd.exe /c `"$runner`""

schtasks /Create /F /TN "FACTO-smoke-lastro-06h" /SC DAILY /ST 06:00 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-smoke-lastro-06h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-smoke-lastro-06h" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-smoke-lastro-06h criada (diária 06:00)."
Write-Host "PC ligado (sem dormir). Log: scripts\smoke-areas-lastro.log"
Write-Host "Comando manual: npm run test:smoke-areas-lastro"
