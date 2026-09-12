# Rede de segurança pós-compra MP (quando webhook atrasa).
# A cada 15 min: sync preapprovals + e-mails/convite/ntfy.
# Execute uma vez:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-sincronizar-compras.ps1

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tr = "cmd.exe /c cd /d `"$repo`" && npx --yes tsx scripts/sincronizar-compras-diario.ts >> `"$repo\scripts\sincronizar-compras-diario.log`" 2>&1"

schtasks /Create /F /TN "FACTO-sincronizar-compras-15m" /SC MINUTE /MO 15 /ST 00:05 /RL LIMITED /TR $tr
$settings = (Get-ScheduledTask -TaskName "FACTO-sincronizar-compras-15m").Settings
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false
Set-ScheduledTask -TaskName "FACTO-sincronizar-compras-15m" -Settings $settings | Out-Null
Write-Host "Tarefa FACTO-sincronizar-compras-15m criada (a cada 15 min)."
Write-Host "PC ligado. Log: scripts\sincronizar-compras-diario.log"
Write-Host "Manual: npx tsx scripts/sincronizar-compras-diario.ts"
Write-Host "Requer .env.local: MP token, Resend, NTFY_TOPIC."
