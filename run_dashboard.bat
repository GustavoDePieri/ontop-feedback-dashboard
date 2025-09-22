@echo off
echo 🚀 Starting Ontop Feedback Analysis Dashboard...
echo.
echo Checking Python installation...
py --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Python found!
echo.

echo Checking if CSV file exists...
if not exist "clientsFeedbacks.csv" (
    echo ❌ clientsFeedbacks.csv not found in current directory!
    echo Please ensure the CSV file is in the same folder as this script.
    pause
    exit /b 1
)
echo ✅ CSV file found!

echo.
echo Installing/updating dependencies...
py -m pip install -r requirements.txt --quiet

echo.
echo 🔧 Checking CSV encoding...
py fix_csv_encoding.py

echo.
echo 🧠 Running comprehensive feedback analysis...
py analyze_feedback.py

echo.
echo 📊 Launching dashboard...
echo The dashboard will open in your default web browser.
echo Press Ctrl+C to stop the dashboard when you're done.
echo.
py -m streamlit run dashboard.py

pause
