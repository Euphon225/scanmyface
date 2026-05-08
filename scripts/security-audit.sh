#!/bin/bash
# Security Audit Script — FC26 CRANIUM
# Checks for hardcoded secrets and configuration issues

set -e

echo "🔐 Running Security Audit..."
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ─────────────────────────────────────────────────────────────
# Check 1: No MongoDB URIs in JavaScript
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 1: Looking for hardcoded MongoDB URIs..."
if grep -r "mongodb://" --include="*.js" . 2>/dev/null | grep -v node_modules; then
    echo -e "${RED}✗ FAIL: Found hardcoded mongodb:// URIs${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: No mongodb:// URIs found${NC}"
fi

# ─────────────────────────────────────────────────────────────
# Check 2: No MongoDB Atlas URIs hardcoded
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 2: Looking for hardcoded MongoDB Atlas URIs..."
if grep -r "mongodb+srv://" --include="*.js" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v "process.env" | grep -v "DOPPLER_SECRET" | grep -v "YOUR_"; then
    echo -e "${RED}✗ FAIL: Found hardcoded mongodb+srv:// URIs${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: No mongodb+srv:// URIs found${NC}"
fi

# ─────────────────────────────────────────────────────────────
# Check 3: All process.env calls are in Azure Function
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 3: Verifying process.env usage..."
if grep -r "process.env" app/ --include="*.js" | grep -v "VITE_"; then
    echo -e "${YELLOW}⚠ WARNING: process.env used in client-side code (should use VITE_ prefix)${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ PASS: process.env usage correct${NC}"
fi

# ─────────────────────────────────────────────────────────────
# Check 4: CONFIG object exists and uses env vars
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 4: Verifying CONFIG object in app/script.js..."
if grep -q "const CONFIG = {" app/script.js; then
    echo -e "${GREEN}✓ PASS: CONFIG object found${NC}"
else
    echo -e "${RED}✗ FAIL: CONFIG object not found in app/script.js${NC}"
    ((ERRORS++))
fi

# ─────────────────────────────────────────────────────────────
# Check 5: CONFIG uses VITE_ environment variables
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 5: Verifying CONFIG uses environment variables..."
if grep -q "process.env.VITE_" app/script.js || grep -q "window.__" app/script.js; then
    echo -e "${GREEN}✓ PASS: CONFIG uses VITE_ environment variables${NC}"
else
    echo -e "${RED}✗ FAIL: CONFIG not using environment variables${NC}"
    ((ERRORS++))
fi

# ─────────────────────────────────────────────────────────────
# Check 6: matchFace.js uses process.env for MongoDB
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 6: Verifying matchFace.js uses process.env..."
if grep -q "process.env.MONGODB_URI" src/functions/matchFace.js; then
    echo -e "${GREEN}✓ PASS: matchFace.js uses process.env.MONGODB_URI${NC}"
else
    echo -e "${RED}✗ FAIL: matchFace.js not using process.env.MONGODB_URI${NC}"
    ((ERRORS++))
fi

# ─────────────────────────────────────────────────────────────
# Check 7: No secrets in .env.local or local.settings.json
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 7: Checking local settings files..."
if [ -f .env.local ]; then
    if grep -q "mongodb+srv://" .env.local | grep -v "YOUR_" | grep -v "DOPPLER_SECRET"; then
        echo -e "${RED}✗ FAIL: Found secrets in .env.local${NC}"
        ((ERRORS++))
    fi
fi

if [ -f local.settings.json ]; then
    if grep -q "mongodb+srv://" local.settings.json | grep -v "YOUR_" | grep -v "DOPPLER_SECRET"; then
        echo -e "${RED}✗ FAIL: Found secrets in local.settings.json${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ PASS: local.settings.json has no hardcoded secrets${NC}"
    fi
fi

# ─────────────────────────────────────────────────────────────
# Check 8: .gitignore covers sensitive files
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 8: Verifying .gitignore..."
if grep -q ".env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓ PASS: .gitignore includes .env files${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: .env files might not be in .gitignore${NC}"
    ((WARNINGS++))
fi

# ─────────────────────────────────────────────────────────────
# Check 9: Doppler configuration exists
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 9: Verifying Doppler configuration..."
if [ -f .doppler.yaml ]; then
    echo -e "${GREEN}✓ PASS: .doppler.yaml found${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: .doppler.yaml not found (see DOPPLER_SETUP.md)${NC}"
    ((WARNINGS++))
fi

# ─────────────────────────────────────────────────────────────
# Check 10: JavaScript syntax validation
# ─────────────────────────────────────────────────────────────
echo -e "\n📋 Check 10: Validating JavaScript syntax..."
if node -c app/script.js 2>&1 | grep -q "SyntaxError"; then
    echo -e "${RED}✗ FAIL: Syntax error in app/script.js${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: app/script.js syntax OK${NC}"
fi

if node -c src/functions/matchFace.js 2>&1 | grep -q "SyntaxError"; then
    echo -e "${RED}✗ FAIL: Syntax error in matchFace.js${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: matchFace.js syntax OK${NC}"
fi

# ─────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────
echo -e "\n================================"
echo -e "🔐 Audit Complete"
echo -e "================================"
echo -e "Errors:   ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}✅ Security audit PASSED${NC}"
    echo -e "All checks passed. Code is ready for deployment."
    exit 0
else
    echo -e "\n${RED}❌ Security audit FAILED${NC}"
    echo -e "Please fix the errors above before deploying."
    exit 1
fi
