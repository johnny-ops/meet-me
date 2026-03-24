#!/bin/bash

# Deploy Fix for 404 Error
echo "🚀 Deploying fix for 404 error on shared links..."
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run this script from your project root"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found changes to commit..."
    
    # Show what will be committed
    echo ""
    echo "Files to be committed:"
    git status -s
    echo ""
    
    # Add all changes
    git add .
    
    # Commit
    git commit -m "Fix 404 error on shared meeting links - Add Vercel routing config"
    
    echo "✅ Changes committed"
else
    echo "ℹ️  No changes to commit"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Vercel will now automatically deploy your changes"
    echo ""
    echo "Next steps:"
    echo "1. Go to your Vercel dashboard"
    echo "2. Wait for deployment to complete (1-2 minutes)"
    echo "3. Test a direct room link: https://yourdomain.vercel.app/room/test123"
    echo ""
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "Please check your git configuration and try again"
    exit 1
fi
