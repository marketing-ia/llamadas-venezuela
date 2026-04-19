#!/bin/bash

# Deployment Validation Script for Llamadas Venezuela
# This script checks if all necessary files are in place before deployment

echo "🔍 Validando configuración de deployment..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
TOTAL=0
PASSED=0

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    TOTAL=$((TOTAL + 1))

    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description: $file"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} $description MISSING: $file"
    fi
}

# Function to check environment variable in file
check_env_var() {
    local file=$1
    local var=$2
    local description=$3
    TOTAL=$((TOTAL + 1))

    if grep -q "^$var=" "$file"; then
        local value=$(grep "^$var=" "$file" | cut -d= -f2)

        # Check if value is not a placeholder
        if [[ "$value" != *"YOUR"* ]] && [[ "$value" != *"your"* ]] && [[ ! -z "$value" ]]; then
            echo -e "${GREEN}✅${NC} $description: $var is configured"
            PASSED=$((PASSED + 1))
        else
            echo -e "${YELLOW}⚠️${NC}  $description: $var needs to be configured (currently: $value)"
        fi
    else
        echo -e "${RED}❌${NC} $description MISSING: $var not found in $file"
    fi
}

echo "📁 Checking files..."
check_file "backend/.env" "Backend environment file"
check_file "frontend/.env" "Frontend environment file"
check_file "railway.json" "Railway configuration"
check_file "vercel.json" "Vercel configuration"
check_file "backend/server.js" "Backend entry point"
check_file "backend/package.json" "Backend package.json"
check_file "frontend/package.json" "Frontend package.json"

echo ""
echo "⚙️  Checking backend/.env variables..."
check_env_var "backend/.env" "NODE_ENV" "Node environment"
check_env_var "backend/.env" "DATABASE_URL" "Database URL"
check_env_var "backend/.env" "JWT_SECRET" "JWT Secret"
check_env_var "backend/.env" "ENCRYPTION_KEY" "Encryption key"
check_env_var "backend/.env" "TWILIO_ACCOUNT_SID" "Twilio Account SID"
check_env_var "backend/.env" "TWILIO_AUTH_TOKEN" "Twilio Auth Token"

echo ""
echo "⚙️  Checking frontend/.env variables..."
check_env_var "frontend/.env" "VITE_API_URL" "API URL"
check_env_var "frontend/.env" "VITE_API_TIMEOUT" "API Timeout"

echo ""
echo "📦 Checking dependencies..."
TOTAL=$((TOTAL + 1))
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅${NC} Backend dependencies installed"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️${NC}  Backend dependencies not installed (run: cd backend && npm install)"
fi

TOTAL=$((TOTAL + 1))
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅${NC} Frontend dependencies installed"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️${NC}  Frontend dependencies not installed (run: cd frontend && npm install)"
fi

echo ""
echo "🔒 Checking .gitignore..."
TOTAL=$((TOTAL + 1))
if grep -q "\.env" ".gitignore" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} .env files are ignored in git"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌${NC} .env files might not be properly ignored!"
fi

echo ""
echo "================================"
echo "📊 Validation Results: $PASSED/$TOTAL checks passed"
echo "================================"

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 All checks passed! You're ready for deployment.${NC}"
    exit 0
elif [ $PASSED -ge $((TOTAL - 2)) ]; then
    echo -e "${YELLOW}⚠️  Most checks passed, but review warnings above${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Fix issues above before deploying.${NC}"
    exit 1
fi
