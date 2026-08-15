# Agenda o seed juris todos os dias às 01:00 (PC ligado, sessão do usuário).
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-juris.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && npx tsx scripts/seed-juris-diario.ts >> `"$repo\scripts\seed-juris-diario.log`" 2>&1"

schtasks /Create /F /TN "FACTO-seed-juris-01h" /SC DAILY /ST 01:00 /RL LIMITED /TR $tr
Write-Host "Tarefa FACTO-seed-juris-01h criada (diária 01:00)."
Write-Host "O PC precisa estar ligado. Log: scripts\seed-juris-diario.log"
Write-Host "Confira o pool: o script imprime quantas contas estão em KEY + KEYS (sem mostrar tokens)."
