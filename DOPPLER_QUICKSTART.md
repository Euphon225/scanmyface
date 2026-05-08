# 🚀 Quick Start — Doppler & Deployment

This document provides a quick reference for developers to get started with FC26 CRANIUM using Doppler for secrets management.

## 📚 Full Documentation

For comprehensive guides, see:
- **[DOPPLER_SETUP.md](./DOPPLER_SETUP.md)** — Complete Doppler configuration
- **[SECURITY.md](./SECURITY.md)** — Security policies and best practices
- **[GITHUB_ACTIONS_DOPPLER.md](./GITHUB_ACTIONS_DOPPLER.md)** — CI/CD workflows

## ⚡ 5-Minute Setup

### 1. Install Doppler CLI

```bash
# macOS
brew install doppler

# Linux/Windows
curl -fsSL https://packages.doppler.com/public/cli/install.sh | sh
```

### 2. Login to Doppler

```bash
doppler login
```

### 3. Link Project

```bash
cd /Users/loriekeita/Desktop/fc26
doppler projects link
# Select: scanmyface-fc26
# Environment: dev
```

### 4. Run Locally with Secrets

```bash
# Option A: Run functions with secrets
doppler run -- npm start

# Option B: Run with specific environment
doppler run -c staging -- npm start

# Option C: Load secrets into shell
eval "$(doppler secrets download --format sh)"
npm start
```

## 🔐 Verify Secrets Are Loaded

```bash
# View current secrets (redacted)
doppler secrets list

# Get a specific secret
doppler secrets get MONGODB_URI

# Test frontend config (open browser console)
console.log(CONFIG);
```

## 🛠️ Common Tasks

### Deploy Azure Functions (Staging)

```bash
doppler run -c staging -- func azure functionapp publish scanmyface-engine-staging
```

### Deploy Azure Functions (Production)

```bash
doppler run -c production -- func azure functionapp publish scanmyface-engine
```

### Seed MongoDB

```bash
doppler run -c dev -- node scripts/seed_db.js
```

### Security Audit

```bash
bash scripts/security-audit.sh
```

## 📋 Environment Variables

### Backend (app/src/functions/matchFace.js)

```bash
doppler secrets list | grep MONGODB
```

Output:
- `MONGODB_URI` — MongoDB connection (secret)
- `MONGODB_DB` — Database name
- `MONGODB_COLLECTION` — Collection name

### Frontend (app/script.js)

```bash
doppler secrets list | grep VITE_
```

Output:
- `VITE_AZURE_FUNCTION_ENDPOINT` — Azure Function URL
- `VITE_APPWRITE_ENDPOINT` — Appwrite endpoint

## 🚨 Troubleshooting

### Issue: `DOPPLER_TOKEN not found`

```bash
# Check if logged in
doppler login status

# If not logged in
doppler login
```

### Issue: `Project not linked`

```bash
doppler projects link
# Select: scanmyface-fc26
```

### Issue: `Secrets not loading`

```bash
# Verify environment
doppler run -c dev -- env | grep MONGODB_URI

# If empty, check Doppler dashboard:
# https://dashboard.doppler.com/scanmyface-fc26
```

## 📞 Support

- **Doppler Docs:** https://docs.doppler.com
- **Doppler CLI:** `doppler --help`
- **GitHub Issues:** Create an issue in the repo

## ✅ Deployment Checklist

Before deploying to production:

```bash
# 1. Run security audit
bash scripts/security-audit.sh

# 2. Verify secrets are set
doppler run -c production -- env | grep MONGODB_URI

# 3. Test Azure Function locally
doppler run -c staging -- func start

# 4. Verify CONFIG loads in browser
console.log(CONFIG);

# 5. Deploy
doppler run -c production -- func azure functionapp publish scanmyface-engine
```

---

**Need help?** See [DOPPLER_SETUP.md](./DOPPLER_SETUP.md) for detailed instructions.
