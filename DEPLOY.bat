@echo off
echo.
echo ========================================
echo   MeetMe - Deploy to GitHub
echo ========================================
echo.

REM Check if we're in a git repository
if not exist .git (
    echo [ERROR] Not a git repository
    echo Please run this script from your project root
    pause
    exit /b 1
)

echo [INFO] Checking for changes...
echo.

REM Show status
git status --short

echo.
echo [INFO] Adding all changes...
git add .

echo.
echo [INFO] Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "

if "%commit_message%"=="" (
    set commit_message=Update: Added new features - Raise hand, Fullscreen, UI improvements
)

git commit -m "%commit_message%"

if %errorlevel% neq 0 (
    echo [WARNING] Nothing to commit or commit failed
)

echo.
echo [INFO] Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo Changes pushed to GitHub successfully!
    echo.
    echo Vercel will now automatically deploy your changes.
    echo.
    echo New Features Added:
    echo - Raise Hand feature
    echo - Fullscreen mode
    echo - Improved UI animations
    echo - Better mobile responsiveness
    echo - Enhanced screen sharing
    echo.
    echo Next steps:
    echo 1. Go to your Vercel dashboard
    echo 2. Wait for deployment to complete (1-2 minutes^)
    echo 3. Test the new features!
    echo.
) else (
    echo.
    echo [ERROR] Failed to push to GitHub
    echo Please check your git configuration and try again
    echo.
    pause
    exit /b 1
)

pause
