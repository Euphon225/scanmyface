# 🔐 Security Configuration — FC26 CRANIUM

## Executive Summary

FC26 CRANIUM uses **Doppler** for enterprise-grade secrets management. All sensitive data (MongoDB credentials, API endpoints) is:
- ✅ Never committed to Git
- ✅ Injected at deploy-time from Doppler
- ✅ Separated by environment (dev/staging/prod)
- ✅ Audited and rotated regularly

---

## Secret Categories

### 1️⃣ Backend Secrets (Azure Functions)

These are **server-side only** and must never be exposed:

| Secret | Purpose | Managed By | Sensitivity |
|--------|---------|-----------|-------------|
| `MONGODB_URI` | Database connection | Doppler | 🔴 **CRITICAL** |
| `MONGODB_DB` | Database name | Doppler | 🟡 Moderate |
| `MONGODB_COLLECTION` | Collection name | Doppler | 🟡 Moderate |

**Injection Point:** `src/functions/matchFace.js`
- Reads: `process.env.MONGODB_URI`
- Uses: MongoDB Node.js driver with SSL/TLS

### 2️⃣ Frontend Configuration (Client-Side)

These are **public** and safe to expose (no credentials):

| Variable | Purpose | Managed By | Exposure |
|----------|---------|-----------|----------|
| `VITE_AZURE_FUNCTION_ENDPOINT` | Azure API URL | Doppler | 🟢 Public |
| `VITE_APPWRITE_ENDPOINT` | Appwrite endpoint | Doppler | 🟢 Public |

**Injection Point:** `app/script.js` → `CONFIG` object
- Reads: `process.env.VITE_*`
- Used: HTTP fetch calls (client-side)
- **NOTE:** These are public URLs, not secrets!

---

## Code Security Audit

### ✅ Verified Safe Patterns

```javascript
// ✅ GOOD: Environment variable injection
const uri = process.env.MONGODB_URI;

// ✅ GOOD: CONFIG object with public URLs
const CONFIG = {
  AZURE_FUNCTION_ENDPOINT: process.env.VITE_AZURE_FUNCTION_ENDPOINT || '...'
};

// ✅ GOOD: Using CONFIG in fetch calls
const response = await fetch(CONFIG.AZURE_FUNCTION_ENDPOINT);
```

### ❌ Anti-Patterns to Avoid

```javascript
// ❌ BAD: Hardcoded secrets
const uri = 'mongodb+srv://user:password@cluster.mongodb.net';

// ❌ BAD: Checking in secrets as fallback
const endpoint = 'https://my-secret-api-key@function.com';

// ❌ BAD: Logging sensitive data
console.log('MONGODB_URI:', process.env.MONGODB_URI);
```

---

## Deployment Security Checklist

### Before Deploying to Production

- [ ] All secrets are in Doppler Dashboard (not in `.env` files)
- [ ] No secrets appear in Git history:
  ```bash
  git log -p --all -S "mongodb+srv://" -- src/functions/
  ```
- [ ] Syntax validation passed:
  ```bash
  node -c app/script.js && node -c src/functions/matchFace.js
  ```
- [ ] No hardcoded URLs in source:
  ```bash
  grep -r "https://" --include="*.js" src/functions/ | grep -v fetch
  ```
- [ ] Doppler token is in GitHub Secrets (not in repo)
- [ ] Azure Function App configuration is linked to Doppler

### During Deployment

- [ ] Using `doppler run -c production --` for all commands
- [ ] Secrets are injected at runtime (not build-time)
- [ ] Deployment logs don't expose secrets:
  ```bash
  # ✅ GOOD: Logs show success
  ✅ Function deployed successfully
  
  # ❌ BAD: Logs expose secrets
  ❌ Connected to mongodb+srv://user:PASSWORD@cluster.mongodb.net
  ```

### After Deployment

- [ ] Function responds to API calls
- [ ] MongoDB connection is active
- [ ] Monitor logs for errors (no secret leaks)
- [ ] Verify frontend can reach Azure Function

---

## Environment-Specific Configuration

### Development (dev)

```yaml
DOPPLER_PROJECT: scanmyface-fc26
DOPPLER_CONFIG: dev
MONGODB_URI: mongodb+srv://dev-user:dev-pass@dev-cluster.mongodb.net
VITE_AZURE_FUNCTION_ENDPOINT: http://localhost:7071/api/matchFace
```

**Run locally:**
```bash
doppler run -c dev -- npm start
```

### Staging (staging)

```yaml
DOPPLER_CONFIG: staging
MONGODB_URI: mongodb+srv://staging-user:staging-pass@staging-cluster.mongodb.net
VITE_AZURE_FUNCTION_ENDPOINT: https://scanmyface-engine-staging.azurewebsites.net/api/matchFace
```

**Deploy:**
```bash
doppler run -c staging -- func azure functionapp publish scanmyface-engine-staging
```

### Production (production)

```yaml
DOPPLER_CONFIG: production
MONGODB_URI: mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net
VITE_AZURE_FUNCTION_ENDPOINT: https://scanmyface-engine.azurewebsites.net/api/matchFace
```

**Deploy:**
```bash
doppler run -c production -- func azure functionapp publish scanmyface-engine
```

---

## Secret Rotation Policy

### MongoDB Credentials

**Frequency:** Quarterly (every 3 months)

**Process:**
1. Generate new password in MongoDB Atlas
2. Update `MONGODB_URI` in Doppler production environment
3. Test in staging first
4. Deploy to production
5. Revoke old password after 24 hours

```bash
# 1. Generate new password
# (MongoDB Atlas UI)

# 2. Update Doppler
doppler secrets set MONGODB_URI "mongodb+srv://user:NEW_PASSWORD@cluster...."

# 3. Trigger deployment
git commit --allow-empty -m "Rotate MongoDB credentials"
git push  # GitHub Actions will deploy with new creds
```

### Doppler Service Tokens

**Frequency:** Annually

**Process:**
1. Create new token in Doppler
2. Update GitHub Secrets (`DOPPLER_TOKEN`)
3. Revoke old token
4. Monitor for any failed deployments

---

## Incident Response

### If MongoDB URI is Exposed

1. **Immediate:** Revoke the exposed password in MongoDB Atlas
2. **Urgent:** Generate new password
3. **Update:** Change `MONGODB_URI` in all Doppler environments
4. **Verify:** Confirm new credentials work in staging
5. **Deploy:** Push to production with new credentials
6. **Monitor:** Check logs for any failed connections using old credentials
7. **Document:** Add to incident log

### If Doppler Token is Exposed

1. **Immediate:** Revoke token in Doppler Dashboard
2. **Urgent:** Generate new token
3. **Update:** Change `DOPPLER_TOKEN` in GitHub Secrets
4. **Verify:** Test that deployments still work
5. **Audit:** Check Doppler access logs for unauthorized access
6. **Document:** Add to incident log

---

## Audit & Monitoring

### View Doppler Access Logs

```bash
doppler activity
```

### Check Azure Function Logs

```bash
az functionapp logs streaming \
  --name scanmyface-engine \
  --resource-group <resource-group>
```

### Monitor for Exposed Secrets

```bash
# Check Git history for secrets
git log -p --all -S "mongodb+srv://" -- .

# Check GitHub Actions logs
gh run list --branch main --status completed
```

### Verify No Hardcoded Credentials

```bash
# Search for secret patterns
grep -r "mongodb://" .
grep -r "https://.*:.*@" .
grep -r "password" . --include="*.js" --include="*.json"

# Should return nothing!
```

---

## References

- Doppler Docs: https://docs.doppler.com
- OWASP Secrets Management: https://owasp.org/www-community/Sensitive_Data_Exposure
- MongoDB Security: https://www.mongodb.com/docs/manual/security/
- Azure Secrets: https://learn.microsoft.com/en-us/azure/key-vault/

---

## Contact & Escalation

For security concerns:
1. **Critical issues:** Contact security@example.com
2. **Doppler support:** https://support.doppler.com
3. **MongoDB support:** https://support.mongodb.com
4. **Azure support:** https://support.microsoft.com

---

**Last Updated:** May 8, 2026  
**Status:** Production-Ready ✅  
**Next Review:** August 8, 2026
