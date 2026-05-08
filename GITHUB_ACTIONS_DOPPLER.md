# GitHub Actions Deployment with Doppler

This guide explains how to set up GitHub Actions CI/CD workflows to deploy FC26 CRANIUM using Doppler for secrets management.

## 1️⃣ Prerequisites

- Doppler account with `scanmyface-fc26` project set up
- Doppler Service Token (CLI token or API token)
- GitHub repository secrets configured
- Azure Function App and GitHub Pages enabled

## 2️⃣ Add Doppler Token to GitHub Secrets

1. Go to **Settings → Secrets and Variables → Actions**
2. Click **New repository secret**
3. Add:
   - **Name:** `DOPPLER_TOKEN`
   - **Value:** (Your Doppler Service Token from https://dashboard.doppler.com)

To create a Service Token:
```bash
doppler cli tokens create github-actions --scope <environment>
```

## 3️⃣ Example Workflows

### Deploy Azure Functions

Create `.github/workflows/deploy-functions.yml`:

```yaml
name: Deploy Azure Functions

on:
  push:
    branches: [main]
    paths: ['src/functions/**', 'package.json']

env:
  DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Load secrets from Doppler production environment
      - name: Install dependencies
        run: |
          eval "$(doppler secrets download -c production --format sh)"
          npm install
      
      - name: Deploy to Azure
        run: |
          doppler run -c production -- func azure functionapp publish scanmyface-engine
```

### Deploy Frontend (Static Site)

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['app/**', 'index.html', 'package.json']

env:
  DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Build frontend with production secrets
      - name: Build
        run: |
          eval "$(doppler secrets download -c production --format sh)"
          npm run build || npm run build:frontend
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Full CI/CD Pipeline

Create `.github/workflows/deploy-all.yml`:

```yaml
name: Full Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Lint JavaScript
        run: node -c app/script.js && node -c src/functions/matchFace.js
      
      - name: Check for hardcoded secrets
        run: |
          ! grep -rE "mongodb://|mongodb\+srv://" --include="*.js" --include="*.json" .
          echo "✅ No hardcoded MongoDB URIs found"

  deploy-staging:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Deploy Functions to Staging
        run: |
          doppler run -c staging -- func azure functionapp publish scanmyface-engine-staging
      
      - name: Notify Slack
        run: echo "Staging deployment complete"

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Deploy Functions to Production
        run: |
          doppler run -c production -- func azure functionapp publish scanmyface-engine
      
      - name: Build & Deploy Frontend
        run: |
          eval "$(doppler secrets download -c production --format sh)"
          npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 4️⃣ Security Best Practices in Workflows

✅ **DO:**
- Use `doppler run -c <environment>` to inject secrets
- Separate CI (test), staging, and production jobs
- Require review before production deployment
- Log only non-sensitive outputs

❌ **DON'T:**
- Print secret values to logs
- Use hardcoded credentials
- Skip lint checks
- Deploy directly without staging

## 5️⃣ Verify Deployment

### Check Azure Function Logs
```bash
az functionapp logs streaming --name scanmyface-engine --resource-group <rg>
```

### Check Frontend Config
```bash
# After deploy, open browser console and run:
console.log(CONFIG);
```

## 6️⃣ Troubleshooting

### Error: `DOPPLER_TOKEN not found`
- Verify secret is added to GitHub Secrets
- Check: Settings → Secrets and Variables → Actions

### Error: `Authentication failed to Azure`
- Ensure Azure CLI is logged in locally first
- Use Azure Service Principal in GitHub:
  ```bash
  az ad sp create-for-rbac --name github-actions
  ```

### Error: `Secrets not loading in workflow`
- Verify Doppler token has access to the environment
- Test locally: `doppler run -c production -- env | grep MONGODB`

## 📚 References

- Doppler GitHub Actions: https://docs.doppler.com/docs/github-actions
- Azure Functions Deploy: https://docs.doppler.com/docs/azure-functions
- GitHub Actions: https://github.com/features/actions

---

**Last Updated:** May 8, 2026
