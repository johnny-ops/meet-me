# How to Push This Project to GitHub

Follow these steps to push your Meet Clone project to the existing GitHub repository: https://github.com/johnny-ops/meet-me.git

## Prerequisites

1. Git must be installed on your computer
2. You must have access to the GitHub repository (johnny-ops/meet-me)
3. You should be logged into Git with your GitHub credentials

## Step-by-Step Instructions

### Step 1: Initialize Git Repository (if not already initialized)

Open your terminal in the project root directory and run:

```bash
git init
```

### Step 2: Add the Remote Repository

Link your local project to the GitHub repository:

```bash
git remote add origin https://github.com/johnny-ops/meet-me.git
```

If you get an error saying "remote origin already exists", remove it first:

```bash
git remote remove origin
git remote add origin https://github.com/johnny-ops/meet-me.git
```

### Step 3: Check Remote Connection

Verify the remote repository is correctly set:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/johnny-ops/meet-me.git (fetch)
origin  https://github.com/johnny-ops/meet-me.git (push)
```

### Step 4: Pull Existing Content (if any)

If the repository already has content, pull it first to avoid conflicts:

```bash
git pull origin main
```

If you get an error about "refusing to merge unrelated histories", use:

```bash
git pull origin main --allow-unrelated-histories
```

If the default branch is "master" instead of "main", use:

```bash
git pull origin master --allow-unrelated-histories
```

### Step 5: Stage All Files

Add all your project files to the staging area:

```bash
git add .
```

### Step 6: Commit Your Changes

Create a commit with a descriptive message:

```bash
git commit -m "Initial commit: Meet Clone - Lightweight video conferencing app"
```

### Step 7: Push to GitHub

Push your code to the main branch:

```bash
git push -u origin main
```

If your default branch is "master", use:

```bash
git push -u origin master
```

If you encounter authentication issues, you may need to use a Personal Access Token (PAT) instead of your password.

### Step 8: Verify on GitHub

1. Open your browser and go to: https://github.com/johnny-ops/meet-me
2. Refresh the page
3. You should see all your project files uploaded

## Alternative: Force Push (Use with Caution)

If you want to completely replace the existing repository content with your new project:

```bash
git push -u origin main --force
```

⚠️ **WARNING**: This will delete all existing content in the repository. Only use this if you're sure you want to replace everything.

## Troubleshooting

### Issue: Authentication Failed

**Solution 1: Use Personal Access Token (PAT)**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with "repo" permissions
3. Copy the token
4. When pushing, use the token as your password

**Solution 2: Use SSH instead of HTTPS**

```bash
git remote set-url origin git@github.com:johnny-ops/meet-me.git
git push -u origin main
```

### Issue: Permission Denied

Make sure you have write access to the repository. If it's not your repository, you may need to fork it first.

### Issue: Branch Name Mismatch

Check your current branch name:

```bash
git branch
```

If it shows "master" instead of "main", either:

1. Rename your branch:
```bash
git branch -M main
git push -u origin main
```

2. Or push to master:
```bash
git push -u origin master
```

### Issue: Large Files

If you have large files (>100MB), you may need to use Git LFS:

```bash
git lfs install
git lfs track "*.webm"
git add .gitattributes
git commit -m "Add Git LFS tracking"
git push -u origin main
```

## Quick Command Summary

For a fresh push to an empty repository:

```bash
# Initialize and configure
git init
git remote add origin https://github.com/johnny-ops/meet-me.git

# Stage, commit, and push
git add .
git commit -m "Initial commit: Meet Clone application"
git push -u origin main
```

## After Pushing

Once your code is on GitHub, you can:

1. **Enable GitHub Pages** (if you want to host the frontend)
2. **Add collaborators** (Settings → Collaborators)
3. **Set up CI/CD** (GitHub Actions)
4. **Add branch protection rules**
5. **Create issues and project boards**

## Keeping Your Repository Updated

After the initial push, use these commands for future updates:

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push changes
git push
```

## Need Help?

If you encounter any issues:

1. Check the error message carefully
2. Search for the error on Google or Stack Overflow
3. Check GitHub's documentation: https://docs.github.com
4. Verify your Git configuration: `git config --list`

