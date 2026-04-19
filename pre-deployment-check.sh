#!/bin/bash

# Pre-Deployment Health Check
# This script verifies that everything is ready for deployment

echo "🔍 Running Pre-Deployment Health Check..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_TOTAL=0

# Function to check
check() {
    local description=$1
    local condition=$2
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    if eval "$condition"; then
        echo -e "${GREEN}✅${NC} $description"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌${NC} $description"
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    check "$description" "[ -f '$file' ]"
}

# Function to check directory exists
check_dir() {
    local dir=$1
    local description=$2
    check "$description" "[ -d '$dir' ]"
}

echo "📁 Checking directory structure..."
check_dir "backend" "Backend directory exists"
check_dir "frontend" "Frontend directory exists"
check_dir ".git" "Git repository initialized"
check_dir ".secrets" "Secrets folder exists"

echo ""
echo "📄 Checking configuration files..."
check_file "backend/.env" "Backend .env exists"
check_file "frontend/.env" "Frontend .env exists"
check_file "railway.json" "railway.json exists"
check_file "vercel.json" "vercel.json exists"
check_file ".gitignore" ".gitignore exists"

echo ""
echo "📚 Checking documentation..."
check_file "CLAUDE_CODE_INSTRUCTIONS.md" "Claude Code instructions exist"
check_file "IMPLEMENTATION_GUIDE.md" "Implementation guide exists"
check_file "DEPLOYMENT_GUIDE.md" "Deployment guide exists"
check_file "CREDENTIALS_NEEDED.md" "Credentials guide exists"
check_file "DEPLOYMENT_CHECKLIST.md" "Deployment checklist exists"

echo ""
echo "🔐 Checking security..."
check_file ".secrets/.gitignore" "Secrets .gitignore exists"
check "Secrets folder in .gitignore" "grep -q '.secrets' .gitignore"
check "Environment files in .gitignore" "grep -q '.env' .gitignore"

echo ""
echo "📦 Checking dependencies..."
check_file "backend/package.json" "Backend package.json exists"
check_file "frontend/package.json" "Frontend package.json exists"
check_dir "backend/node_modules" "Backend dependencies installed"
check_dir "frontend/node_modules" "Frontend dependencies installed"

echo ""
echo "🔧 Checking backend configuration..."
check "NODE_ENV configured" "grep -q 'NODE_ENV=' backend/.env"
check "JWT_SECRET configured" "grep -q 'JWT_SECRET=' backend/.env"
check "ENCRYPTION_KEY configured" "grep -q 'ENCRYPTION_KEY=' backend/.env"

echo ""
echo "🎨 Checking frontend configuration..."
check "VITE_API_URL configured" "grep -q 'VITE_API_URL=' frontend/.env"
check "VITE_API_TIMEOUT configured" "grep -q 'VITE_API_TIMEOUT=' frontend/.env"

echo ""
echo "📝 Checking build files..."
check_file "backend/server.js" "Backend entry point exists"
check_file "backend/src/app.js" "Backend app setup exists"
check_file "frontend/src/App.tsx" "Frontend App component exists"

echo ""
echo "================================"
echo "📊 Health Check Results"
echo "================================"
echo "Passed: $CHECKS_PASSED/$CHECKS_TOTAL checks"
echo ""

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $CHECKS_PASSED -ge $((CHECKS_TOTAL - 2)) ]; then
    echo -e "${YELLOW}⚠️  Most checks passed. Review any failures above.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Fix issues above before deploying.${NC}"
    exit 1
fi
