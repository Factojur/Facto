# Agenda testes de peça (scaffold) todos os dias às 22:00.
# Sem Gemini no modo scaffold — libera a madrugada para juris (01h) e súmulas (04h).
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-testes-pecas.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && npx --yes tsx scripts/testar-pecas-diario.ts >> `"$repo\scripts\testes-pecas-diario.log`" 2>&1"

# Remove nome antigo (04h), se existir.
schtasks /Delete /F /TN "FACTO-testes-pecas-04h" 2>$null

schtasks /Create /F /TN "FACTO-testes-pecas-22h" /SC DAILY /ST 22:00 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-testes-pecas-22h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-testes-pecas-22h" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-testes-pecas-22h criada (diária 22:00)."
Write-Host "PC ligado (sem dormir). Log: scripts\testes-pecas-diario.log"
Write-Host "Estado: scripts\testes-pecas-estado.json (modo scaffold, 40/dia)."
Write-Host "Saída: tmp\testes-pecas-scaffold\<data>\ (PDF forense)"
Write-Host "Para rodar agora: npm run test:pecas-diario"
