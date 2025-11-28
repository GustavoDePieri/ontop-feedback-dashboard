@echo off
echo ========================================
echo Vercel Deployment Speed Fix
echo ========================================
echo.
echo This will exclude Python files from Vercel
echo to reduce deployment time from 5min to 1min
echo.

cd /d "c:\Users\gusta\Documents\Ontop\feedbackAnalysis"

echo Current .vercelignore:
type .vercelignore
echo.
echo.

echo Adding Python exclusions to .vercelignore...
echo. >> .vercelignore
echo # Exclude Python files - not needed for Vercel deployment >> .vercelignore
echo *.py >> .vercelignore
echo requirements.txt >> .vercelignore
echo **/__pycache__/ >> .vercelignore
echo *.pyc >> .vercelignore
echo.

echo Updated .vercelignore:
type .vercelignore
echo.
echo.

echo Staging changes...
git add .vercelignore
echo.

echo Current status:
git status --short
echo.

echo Committing...
git commit -m "chore: exclude Python files from Vercel to reduce deployment time"
echo.

echo Pushing to remote...
git push origin fix/report-stats
echo.

echo ========================================
echo Done!
echo ========================================
echo.
echo Next Vercel deployment should complete in ~1 minute
echo instead of 5 minutes (80%% faster!)
echo.
pause
