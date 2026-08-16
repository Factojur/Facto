# Agenda o seed juris todos os dias às 01:00 (PC ligado, sessão do usuário).
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-juris.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && npx --yes tsx scripts/seed-juris-diario.ts >> `"$repo\scripts\seed-juris-diario.log`" 2>&1"

schtasks /Create /F /TN "FACTO-seed-juris-01h" /SC DAILY /ST 01:00 /RL LIMITED /TR $tr
Write-Host "Tarefa FACTO-seed-juris-01h criada (diária 01:00)."
Write-Host "O PC precisa estar ligado (sem dormir). Log: scripts\seed-juris-diario.log"
Write-Host "Pool: JURISPRUDENCIAS_AI_API_KEY + JURISPRUDENCIAS_AI_API_KEYS (7 contas)."
Write-Host "Defina vencimento em scripts\seed-juris-estado.json para pausar 7 dias antes."
