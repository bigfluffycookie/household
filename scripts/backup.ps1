$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not $env:DATABASE_BACKUP_PATH -and (Test-Path .env)) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*DATABASE_BACKUP_PATH\s*=\s*(.+)$') {
            $env:DATABASE_BACKUP_PATH = $Matches[1].Trim()
        }
    }
}

$dir = $env:DATABASE_BACKUP_PATH
if (-not $dir) {
    throw "DATABASE_BACKUP_PATH is not set (add it to .env)"
}
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$stamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$out = Join-Path $dir "household-$stamp.sql"

docker compose exec -T db pg_dump -U household -d household | Set-Content -Path $out -Encoding utf8

Write-Host "wrote $out"
