# PowerShell script to run BART analysis with environment variables
# This ensures .env variables are loaded properly

Write-Host "🔧 Loading environment variables from .env file..." -ForegroundColor Cyan

# Read .env file and set environment variables
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  ✓ Loaded: $name" -ForegroundColor Green
        }
    }
    Write-Host ""
} else {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    exit 1
}

# Run the script
Write-Host "🚀 Running BART Analysis Script..." -ForegroundColor Cyan
Write-Host ""
npx tsx scripts/run-bart-analysis.ts
