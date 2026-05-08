# 🔐 Doppler Configuration Guide — FC26 CRANIUM

## Overview

This application uses **Doppler** for secure environment variable management. All sensitive credentials (MongoDB URI, API endpoints) are injected at deploy-time, never hardcoded in source code.

---

## 1️⃣ Prerequisites

- Install Doppler CLI: https://docs.doppler.com/docs/install
- Create a Doppler account & project: https://dashboard.doppler.com
- Have Azure Function App and MongoDB Atlas credentials ready

---

## 2️⃣ Doppler Project Setup

### Create a Project in Doppler Dashboard

1. Go to **https://dashboard.doppler.com**
2. Click **+ New Project**
3. Name it: `scanmyface-fc26`
4. Create 3 environments:
   - **dev** (local development)
   - **staging** (test Azure Functions)
   - **production** (live Azure Functions)

### Initialize Doppler CLI Locally

```bash
cd /Users/loriekeita/Desktop/fc26
doppler login
doppler projects create scanmyface-fc26
doppler projects link
```

---

## 3️⃣ Secrets to Add in Doppler Dashboard

For **each environment** (dev, staging, production), add these secrets:

### Backend (Azure Functions)
```
MONGODB_URI                    = mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?appName=ScanMyFace-Cluster
MONGODB_DB                     = scanmyface
MONGODB_COLLECTION             = presets
```

### Frontend (Client-Side URLs)
```
VITE_AZURE_FUNCTION_ENDPOINT   = https://scanmyface-engine-XXXX.germanywestcentral-01.azurewebsites.net/api/matchFace
VITE_APPWRITE_ENDPOINT         = https://69f56e82003365eb237a.fra.appwrite.run
```

---

## 4️⃣ Local Development with Doppler

### Option A: Run with Doppler (Recommended)

```bash
# Load secrets from 'dev' environment
doppler run -- npm start

# Or with func CLI
doppler run -- func start
```

### Option B: Load Secrets into Shell

```bash
# Export all dev secrets to current shell
eval "$(doppler secrets download --format sh)"
npm start
```

---

## 5️⃣ Azure Function App Configuration

### Connect Azure App Settings to Doppler

1. In Azure Portal → Your Function App → Configuration → Application settings
2. Add these settings (can be left as `@doppler` references if using Azure Key Vault):
   ```
   MONGODB_URI                    = @doppler:MONGODB_URI
   MONGODB_DB                     = scanmyface
   MONGODB_COLLECTION             = presets
   ```

### Using Doppler CLI to Push to Azure

```bash
# Export dev environment to Azure Function App
doppler secrets download --format env-file > .env
# Then manually sync to Azure, or use:
func azure functionapp publish <FUNCTION_APP_NAME> --build-remote
```

---

## 6️⃣ Frontend Build with Doppler

### For Static Site (app/script.js)

The `CONFIG` object in `app/script.js` reads from:
1. Environment variables: `process.env.VITE_*`
2. Window globals: `window.__AZURE_FUNCTION_ENDPOINT__`
3. Fallback hardcoded URLs (for dev only)

### Build for Production

```bash
# Load production secrets and build
doppler run -c production -- npm run build

# Or manually:
eval "$(doppler secrets download -c production --format sh)"
npm run build
```

---

## 7️⃣ Deployment Workflow

### Deploy Azure Functions with Doppler

```bash
# Stage in staging environment
doppler run -c staging -- func azure functionapp publish scanmyface-engine

# Deploy to production
doppler run -c production -- func azure functionapp publish scanmyface-engine
```

### Deploy Frontend (GitHub Pages / Static Site)

```bash
# Build with production secrets
doppler run -c production -- npm run build

# Deploy (e.g., to GitHub Pages)
git add dist/
git commit -m "Build with production config"
git push
```

---

## 8️⃣ Security Best Practices

✅ **DO:**
- Store all secrets in Doppler (never in git)
- Use different secrets per environment
- Rotate MongoDB password quarterly
- Audit Doppler access logs

❌ **DON'T:**
- Commit `.env` files
- Hardcode URLs or credentials in source
- Share Doppler tokens in messages
- Use same secrets for dev & prod

---

## 9️⃣ Verification

### Check Active Configuration

```bash
# View current environment secrets (redacted)
doppler secrets list

# Verify specific secret
doppler secrets get MONGODB_URI
```

### Test Azure Function

```bash
doppler run -- curl -X POST https://scanmyface-engine-XXX.azurewebsites.net/api/matchFace \
  -H "Content-Type: application/json" \
  -d '{"ratios": {...}, "skinTone": "skin.tone.medium"}'
```

### Verify Frontend Config

Open browser console:
```javascript
console.log(CONFIG);
// Should show:
// {
//   AZURE_FUNCTION_ENDPOINT: "https://scanmyface-engine-XXX...",
//   APPWRITE_ENDPOINT: "https://69f56e82..."
// }
```

---

## 🔟 Troubleshooting

### Issue: `MONGODB_URI is undefined`
- Check: `doppler secrets list` includes MONGODB_URI
- Verify Azure Function app settings have MONGODB_URI
- Run locally: `doppler run -- node -e "console.log(process.env.MONGODB_URI)"`

### Issue: Fetch fails with 404 to Azure Function
- Check: CONFIG.AZURE_FUNCTION_ENDPOINT is correct
- Verify: Azure Function App is running
- Test endpoint in Postman with staging secrets

### Issue: Doppler secrets not loading in GitHub Actions
- Add Doppler token to GitHub Secrets
- Use: `doppler run -- <command>` in workflow
- See: https://docs.doppler.com/docs/github-actions

---

## 📚 References

- Doppler Docs: https://docs.doppler.com
- Doppler CLI: https://docs.doppler.com/docs/cli
- Azure Functions Env: https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings
- MongoDB Connection: https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/

---

## 📞 Quick Reference

```bash
# Login
doppler login

# List available projects
doppler projects list

# Select environment
doppler run -c production -- <command>

# View secrets (redacted)
doppler secrets list

# Get single secret value
doppler secrets get MONGODB_URI

# Download as .env file
doppler secrets download --format env-file > .env

# Export to shell
eval "$(doppler secrets download --format sh)"

# Run development server with secrets
doppler run -- npm start

# Run Azure Functions locally with secrets
doppler run -- func start
```

---

**Last Updated:** May 8, 2026  
**Status:** Production-Ready ✅
