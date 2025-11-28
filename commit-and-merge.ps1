# Git Commit and Merge Script
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Git Commit and Merge Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "c:\Users\gusta\Documents\Ontop\feedbackAnalysis"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking current branch..." -ForegroundColor Green
git branch
Write-Host ""

Write-Host "Staging all changes..." -ForegroundColor Green
git add -A
Write-Host ""

Write-Host "Current status:" -ForegroundColor Green
git status
Write-Host ""

Write-Host "Committing changes..." -ForegroundColor Green
$commitMessage = @"
fix: optimize transcript loading and enhance sentiment analysis UI

- Fix database timeout by reducing initial load to 10k transcripts
- Exclude transcript_text from list queries for 95% data reduction
- Add lazy loading for transcript text on view
- Fix timezone handling bug in transcript_sentiment_aggregator.py
- Enhance sentiment modal with new AI analysis fields
- Add comprehensive performance documentation
"@

git commit -m $commitMessage
Write-Host ""

Write-Host "Pushing to fix/report-stats..." -ForegroundColor Green
git push origin fix/report-stats
Write-Host ""

Write-Host "Switching to main branch..." -ForegroundColor Green
git checkout main
Write-Host ""

Write-Host "Pulling latest main..." -ForegroundColor Green
git pull origin main
Write-Host ""

Write-Host "Merging fix/report-stats into main..." -ForegroundColor Green
git merge fix/report-stats
Write-Host ""

Write-Host "Pushing to main..." -ForegroundColor Green
git push origin main
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Merge complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$deleteChoice = Read-Host "Do you want to delete old branches? (Y/N)"

if ($deleteChoice -eq 'Y' -or $deleteChoice -eq 'y') {
    Write-Host "Deleting local branches..." -ForegroundColor Yellow
    git branch -d fix/report-stats
    git branch -d transcript-sentiment
    
    Write-Host "Deleting remote branches..." -ForegroundColor Yellow
    git push origin --delete fix/report-stats
    git push origin --delete transcript-sentiment
    
    Write-Host "Branches deleted!" -ForegroundColor Green
} else {
    Write-Host "Branches kept. You can delete them later with:" -ForegroundColor Yellow
    Write-Host "  git branch -d fix/report-stats transcript-sentiment" -ForegroundColor Gray
    Write-Host "  git push origin --delete fix/report-stats transcript-sentiment" -ForegroundColor Gray
}

Write-Host ""
Write-Host "All done!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
