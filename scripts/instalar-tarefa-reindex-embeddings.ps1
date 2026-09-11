# Agenda reindex de embeddings (só sem vetor) todos os dias às 23:00.
# Garante ≥1 passagem/dia mesmo se o reindex pós-seed (01h/02h/04h) tomar ^C ou 429.
# Só GEMINI_API_KEY_SEED (free) — nunca paygo.
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-reindex-embeddings.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && npx --yes tsx scripts/reindex-embeddings.ts >> `"$repo\scripts\reindex-embeddings-diario.log`" 2>&1"

# Remove nome antigo (05h), se existir.
schtasks /Delete /F /TN "FACTO-reindex-embeddings-05h" 2>$null

schtasks /Create /F /TN "FACTO-reindex-embeddings-23h" /SC DAILY /ST 23:00 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-reindex-embeddings-23h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-reindex-embeddings-23h" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-reindex-embeddings-23h criada (diaria 23:00)."
Write-Host "PC ligado (sem dormir). Log: scripts\reindex-embeddings-diario.log"
Write-Host "Manual: npm run reindex:embeddings"
Write-Host "Nunca use reindex:embeddings:paygo-catchup no diario."
