[CmdletBinding()]
param(
    [string]$ProjectRef = "lvmyjtzfohlorocrjvcx",
    [switch]$ConfirmStaging
)

$ErrorActionPreference = "Stop"
$expectedProjectRef = "lvmyjtzfohlorocrjvcx"

if (-not $ConfirmStaging) {
    throw "Safety stop: jalankan dengan -ConfirmStaging setelah memastikan ini project Supabase STAGING Ginabo."
}

if ($ProjectRef -ne $expectedProjectRef) {
    throw "ProjectRef ditolak. Script ini hanya boleh untuk Ginabo staging: $expectedProjectRef"
}

 $supabase = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabase) {
    $supabaseCommand = @("supabase")
} else {
    $npx = Get-Command npx -ErrorAction SilentlyContinue
    if (-not $npx) {
        throw "Supabase CLI dan npx tidak ditemukan. Install Node.js atau Supabase CLI terlebih dahulu."
    }
    Write-Host "Supabase CLI global tidak ditemukan; memakai npx supabase." -ForegroundColor Yellow
    $supabaseCommand = @("npx", "--yes", "supabase")
}

function Invoke-Supabase([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments) {
    if ($supabaseCommand.Count -gt 1) {
        & $supabaseCommand[0] $supabaseCommand[1..($supabaseCommand.Count - 1)] @Arguments
    } else {
        & $supabaseCommand[0] @Arguments
    }
    if ($LASTEXITCODE -ne 0) { throw "Supabase command gagal dengan exit code $LASTEXITCODE" }
}

Write-Host "Target staging: $ProjectRef" -ForegroundColor Cyan
Invoke-Supabase --version

Write-Host "Login/link ke project staging. Password database akan diminta secara interaktif; tidak disimpan oleh script." -ForegroundColor Yellow
Invoke-Supabase link --project-ref $ProjectRef

Write-Host "Migration yang akan diterapkan: 007, 008, 009, 010" -ForegroundColor Cyan
Invoke-Supabase migration list --linked

$answer = Read-Host "Ketik APPLY-STAGING untuk menerapkan migration ke $ProjectRef"
if ($answer -cne "APPLY-STAGING") {
    throw "Dibatalkan. Tidak ada perubahan remote."
}

Invoke-Supabase db push --include-all

Write-Host "Status migration setelah push:" -ForegroundColor Green
Invoke-Supabase migration list --linked

Write-Host "Migration staging selesai. Lanjutkan verifikasi schema/RPC/RLS melalui SQL Editor." -ForegroundColor Green
