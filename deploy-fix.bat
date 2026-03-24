@echo off
echo.
echo ========================================
echo   Deploy Fix for 404 Error
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

REM Check for changes
git status --short > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git command failed
    pause
    exit /b 1
)

REM Show status
git status --short

echo.
echo [INFO] Adding all changes...
git add .

echo [INFO] Committing changes...
git commit -m "Fix 404 error on shared meeting links - Add Vercel routing config"

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
    echo Next steps:
    echo 1. Go to your Vercel dashboard
    echo 2. Wait for deployment to complete (1-2 minutes^)
    echo 3. Test a direct room link
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
