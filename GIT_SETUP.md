# Git Repository Setup Instructions

Follow these steps to initialize and push your repository to GitHub.

## 📋 Prerequisites

1. **GitHub Account**: Create one at https://github.com if you don't have one
2. **Git Installed**: Verify with `git --version`
3. **GitHub CLI (Optional)**: For easier repository creation

## 🚀 Step-by-Step Guide

### Step 1: Initialize Local Repository

Open PowerShell in the project directory and run:

```powershell
# Initialize git repository
git init

# Check git status
git status
```

### Step 2: Stage All Files

```powershell
# Add all files to staging
git add .

# Verify what will be committed
git status
```

### Step 3: Create Initial Commit

```powershell
# Create first commit
git commit -m "Initial commit: FPR Emarat Testing Framework v1.0.0

- Multi-company support (ACAL, ANLI, TURC)
- Excel comparison with 99.02% match rate
- Comprehensive reporting and mapping diagrams
- Full documentation and setup guides"
```

### Step 4: Create GitHub Repository

#### Option A: Using GitHub Website

1. Go to https://github.com
2. Click the "+" icon → "New repository"
3. Repository name: `FPR_Emarat`
4. Description: "Automated testing framework for Financial Position Reports with multi-company validation"
5. Choose Public or Private
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

#### Option B: Using GitHub CLI

```powershell
# Install GitHub CLI (if not installed)
# Download from: https://cli.github.com/

# Authenticate
gh auth login

# Create repository
gh repo create FPR_Emarat --public --description "Automated testing framework for Financial Position Reports with multi-company validation"
```

### Step 5: Add Remote and Push

After creating the GitHub repository, you'll see instructions. Use these commands:

```powershell
# Add remote repository (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/FPR_Emarat.git

# Verify remote
git remote -v

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 6: Verify Upload

1. Go to your GitHub repository: `https://github.com/YOUR-USERNAME/FPR_Emarat`
2. You should see all files uploaded
3. README.md should be displayed automatically

## 📁 What Gets Uploaded

The following files will be included:

✅ **Source Code**
- tests/ (all test files)
- playwright.config.ts
- package.json

✅ **Documentation**
- README.md
- DOCUMENTATION.md
- QUICKSTART.md
- CONTRIBUTING.md
- CHANGELOG.md
- LICENSE

✅ **Configuration**
- .gitignore
- .github/workflows/ (CI/CD)

✅ **Data**
- data/tmp49D6.xlsx (expected results)

❌ **Excluded** (via .gitignore)
- node_modules/
- test-results/
- playwright-report/
- Generated comparison files
- Mapping diagrams (can be regenerated)

## 🔒 Security Considerations

### Before Pushing:

1. **Remove Sensitive Data**:
   ```powershell
   # Check for credentials in files
   git grep -i "password"
   git grep -i "username"
   ```

2. **Update Credentials**: Replace actual credentials with placeholders:
   ```typescript
   credentials: {
     username: 'your-username',  // Placeholder
     password: 'your-password'   // Placeholder
   }
   ```

3. **Use Environment Variables**: For production, use:
   ```typescript
   credentials: {
     username: process.env.EMARAT_USERNAME,
     password: process.env.EMARAT_PASSWORD
   }
   ```

4. **Add .env to .gitignore**: Already included

## 📊 Setting Up GitHub Actions (CI/CD)

The repository includes a GitHub Actions workflow that will:
- Run tests on every push
- Run tests on pull requests
- Run tests daily at 2 AM UTC
- Upload test reports as artifacts

### Enable Actions:

1. Go to your repository → "Actions" tab
2. Click "I understand my workflows, go ahead and enable them"
3. Actions will run automatically on next push

### Disable Actions (if not needed):

1. Go to Settings → Actions → General
2. Select "Disable actions"

## 🏷️ Creating a Release

### Tag the Initial Release:

```powershell
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial release with multi-company support"

# Push tag to GitHub
git push origin v1.0.0
```

### Create GitHub Release:

1. Go to repository → "Releases"
2. Click "Create a new release"
3. Choose tag: v1.0.0
4. Release title: "v1.0.0 - Initial Release"
5. Description: Copy from CHANGELOG.md
6. Click "Publish release"

## 🔄 Future Updates

### Making Changes:

```powershell
# Make your changes to files

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

### Creating Branches:

```powershell
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push -u origin feature/new-feature

# Create pull request on GitHub
```

## 📝 Repository Settings

### Recommended Settings:

1. **Branch Protection** (Settings → Branches):
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

2. **Collaborators** (Settings → Collaborators):
   - Add team members with appropriate permissions

3. **Topics** (Repository main page):
   - Add tags: `playwright`, `testing`, `financial-reports`, `excel`, `typescript`

## ✅ Verification Checklist

After setup, verify:

- [ ] Repository created on GitHub
- [ ] All files uploaded
- [ ] README.md displays correctly
- [ ] No sensitive data exposed
- [ ] GitHub Actions enabled (if desired)
- [ ] Repository settings configured
- [ ] Collaborators added
- [ ] Release tag created

## 🆘 Common Issues

### Issue: "Permission denied (publickey)"

**Solution**: Set up SSH keys or use HTTPS with token
```powershell
# Use HTTPS instead
git remote set-url origin https://github.com/YOUR-USERNAME/FPR_Emarat.git
```

### Issue: "Updates were rejected"

**Solution**: Pull remote changes first
```powershell
git pull origin main --allow-unrelated-histories
git push origin main
```

### Issue: Large files rejected

**Solution**: Check .gitignore and remove large files
```powershell
# Remove from staging
git rm --cached path/to/large/file

# Update .gitignore
echo "path/to/large/file" >> .gitignore

# Commit and push
git commit -m "Remove large file"
git push origin main
```

## 🎉 You're Done!

Your repository is now on GitHub and ready to share!

### Quick Links:

- Repository: `https://github.com/YOUR-USERNAME/FPR_Emarat`
- Actions: `https://github.com/YOUR-USERNAME/FPR_Emarat/actions`
- Releases: `https://github.com/YOUR-USERNAME/FPR_Emarat/releases`

### Next Steps:

1. Share repository URL with team
2. Set up local development for team members
3. Configure CI/CD if needed
4. Start contributing!

---

**Need Help?** Check GitHub's documentation at https://docs.github.com
