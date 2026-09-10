# Agenda smoke de lastro (20 áreas) todos os dias às 03:00 — após seed portal gaps (02h) / juris (01h).
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-smoke-lastro.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runner = Join-Path $repo "scripts\rodar-smoke-lastro.cmd"
$tr = "cmd.exe /c `"$runner`""

schtasks /Create /F /TN "FACTO-smoke-lastro-03h" /SC DAILY /ST 03:00 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-smoke-lastro-03h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-smoke-lastro-03h" -Settings $settings | Out-Null
# Remove nome antigo (06h), se existir.
schtasks /Delete /F /TN "FACTO-smoke-lastro-06h" 2>$null
Write-Host "Tarefa FACTO-smoke-lastro-03h criada (diária 03:00)."
Write-Host "PC ligado (sem dormir). Log: scripts\smoke-areas-lastro.log"
Write-Host "Comando manual: npm run test:smoke-areas-lastro"
