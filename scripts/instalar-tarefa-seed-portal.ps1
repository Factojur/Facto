# Agenda seed de juris por portal (TSE/TRE/TNU) as 02:00 — gaps fora do Jurisprudencias.ai.
# Usa so GEMINI_API_KEY_SEED (free) no reindex; nunca paygo.
# Execute uma vez no PowerShell, na pasta do repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-portal.ps1
#
# Pre-requisito: scripts\seed-juris-portal-diario.ts (P0 TSE) — ja no repo.

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $repo "scripts\seed-juris-portal-diario.ts"
if (-not (Test-Path $script)) {
  Write-Host "AVISO: $script ainda nao existe (P0 TSE pendente). Tarefa sera criada mesmo assim."
}

# PLAYWRIGHT_BROWSERS_PATH no perfil do usuário (evita cache vazio do Cursor/sandbox).
$browsers = Join-Path $env:LOCALAPPDATA "ms-playwright"
$tr = "cmd.exe /c cd /d `"$repo`" && set PLAYWRIGHT_BROWSERS_PATH=$browsers&& npx --yes tsx scripts/seed-juris-portal-diario.ts >> `"$repo\scripts\seed-juris-portal-diario.log`" 2>&1"

schtasks /Create /F /TN "FACTO-seed-portal-02h" /SC DAILY /ST 02:00 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-seed-portal-02h").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-seed-portal-02h" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-seed-portal-02h criada (diaria 02:00)."
Write-Host "PC ligado (sem dormir). Log: scripts\seed-juris-portal-diario.log"
Write-Host "Gemini: apenas GEMINI_API_KEY_SEED (free) - paygo bloqueado no script."
