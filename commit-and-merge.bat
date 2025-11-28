@echo off
echo ========================================
echo Git Commit and Merge Script
echo ========================================
echo.

cd /d "c:\Users\gusta\Documents\Ontop\feedbackAnalysis"

echo Current directory:
cd
echo.

echo Checking current branch...
git branch
echo.

echo Staging all changes...
git add -A
echo.

echo Current status:
git status
echo.

echo Committing changes...
git commit -m "fix: optimize transcript loading and enhance sentiment analysis UI - Fix database timeout by reducing initial load to 10k transcripts - Exclude transcript_text from list queries for 95%% data reduction - Add lazy loading for transcript text on view - Fix timezone handling bug in transcript_sentiment_aggregator.py - Enhance sentiment modal with new AI analysis fields - Add comprehensive performance documentation"
echo.

echo Pushing to fix/report-stats...
git push origin fix/report-stats
echo.

echo Switching to main branch...
git checkout main
echo.

echo Pulling latest main...
git pull origin main
echo.

echo Merging fix/report-stats into main...
git merge fix/report-stats
echo.

echo Pushing to main...
git push origin main
echo.

echo ========================================
echo Merge complete! 
echo ========================================
echo.
echo Do you want to delete old branches? (Y/N)
set /p DELETE_BRANCHES=

if /i "%DELETE_BRANCHES%"=="Y" (
    echo Deleting local branches...
    git branch -d fix/report-stats
    git branch -d transcript-sentiment
    
    echo Deleting remote branches...
    git push origin --delete fix/report-stats
    git push origin --delete transcript-sentiment
    
    echo Branches deleted!
) else (
    echo Branches kept. You can delete them later with:
    echo   git branch -d fix/report-stats transcript-sentiment
    echo   git push origin --delete fix/report-stats transcript-sentiment
)

echo.
echo All done!
pause
