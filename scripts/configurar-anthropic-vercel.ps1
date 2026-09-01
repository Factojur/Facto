# Configura Anthropic (Sonnet) no FACTO — local + Vercel (Non-sensitive)
# Uso: .\scripts\configurar-anthropic-vercel.ps1
# Não commita chaves — só grava .env.local (gitignored) e Vercel env.

param(
  [Parameter(Mandatory = $true)]
  [string]$AnthropicApiKey,
  [string]$Modelo = "claude-sonnet-4-5"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Set-EnvLine($path, $name, $value) {
  $lines = @()
  if (Test-Path $path) {
    $lines = Get-Content $path
    $lines = $lines | Where-Object { $_ -notmatch "^$name=" }
  }
  $lines += "$name=$value"
  $lines | Set-Content $path -Encoding utf8
}

Set-EnvLine ".env.local" "ANTHROPIC_API_KEY" $AnthropicApiKey
Set-EnvLine ".env.local" "ANTHROPIC_MODELO_REDACAO" $Modelo
Write-Host "OK .env.local (ANTHROPIC_*)"

$env:ANTHROPIC_API_KEY = $AnthropicApiKey
$env:ANTHROPIC_MODELO_REDACAO = $Modelo

Write-Host "Enviando para Vercel (Non-sensitive)..."
# --no-sensitive: Vercel CLI marca API keys como Sensitive por padrao; FACTO precisa legivel no painel.
$AnthropicApiKey | vercel env add ANTHROPIC_API_KEY production --force --no-sensitive
$AnthropicApiKey | vercel env add ANTHROPIC_API_KEY preview --force --no-sensitive
$Modelo | vercel env add ANTHROPIC_MODELO_REDACAO production --force --no-sensitive
$Modelo | vercel env add ANTHROPIC_MODELO_REDACAO preview --force --no-sensitive

Write-Host "Feito. Rode: vercel --prod (ou redeploy no painel)."
