---
description: Steps to commit and push changes to the production (main) branch
---

Follow these steps to safely push your regional or feature changes to the production repository.

### 1. Check your status
Before anything, see what files you have modified:
```bash
git status
```

### 2. Stage your changes
To add all modified files to the "staging area":
```bash
git add .
```
> [!TIP]
> If you only want to add a specific file, use `git add path/to/file`.

### 3. Commit with a message
Save your changes locally with a descriptive message explaining what you did:
// turbo
```bash
git commit -m "Your descriptive message here (e.g., 'fix: update logo colors')"
```

### 4. Pull latest changes
Always pull the latest code from the server to avoid conflicts:
```bash
git pull origin main --rebase
```

### 5. Push to Production
Finally, send your local commits to GitHub:
// turbo
```bash
git push origin main
```

> [!WARNING]
> If you get an error saying "rejected", it means someone else updated the code. Run step 4 again.
