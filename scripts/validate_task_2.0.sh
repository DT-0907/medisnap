#!/bin/bash

echo "==================================================================="
echo "          Dev 2 Task 2.0: Environment Setup Validation"
echo "==================================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation failures
FAILED=0

# Function to print success
print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
  echo -e "${RED}✗${NC} $1"
  FAILED=$((FAILED + 1))
}

# Function to print warning
print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# ===================================================================
# 1. Environment Verification
# ===================================================================
echo "=== 1. Environment Verification ==="
echo ""

# Check Node.js version
echo -n "Node.js version: "
NODE_VERSION=$(node --version 2>&1)
if [ $? -eq 0 ]; then
  if echo "$NODE_VERSION" | grep -E "^v(18|20|22)\." > /dev/null; then
    print_success "$NODE_VERSION (compatible)"
  else
    print_warning "$NODE_VERSION (expected v18, v20, or v22, but should work)"
  fi
else
  print_error "Node.js not installed"
fi

# Check Git version
echo -n "Git version: "
GIT_VERSION=$(git --version 2>&1)
if [ $? -eq 0 ]; then
  print_success "$GIT_VERSION"
else
  print_error "Git not installed"
fi

# Check Git configuration
echo -n "Git user name: "
GIT_NAME=$(git config user.name 2>&1)
if [ -n "$GIT_NAME" ]; then
  print_success "$GIT_NAME"
else
  print_error "Git user.name not configured"
fi

echo -n "Git user email: "
GIT_EMAIL=$(git config user.email 2>&1)
if [ -n "$GIT_EMAIL" ]; then
  print_success "$GIT_EMAIL"
else
  print_error "Git user.email not configured"
fi

# Check Git branch
echo -n "Current branch: "
CURRENT_BRANCH=$(git branch --show-current 2>&1)
if [ "$CURRENT_BRANCH" = "dev-2-clinical" ]; then
  print_success "dev-2-clinical"
else
  print_error "Expected 'dev-2-clinical', got '$CURRENT_BRANCH'"
fi

echo ""

# ===================================================================
# 2. Directory Structure
# ===================================================================
echo "=== 2. Directory Structure ==="
echo ""

required_dirs=(
  "backend/src/routes"
  "backend/src/services"
  "backend/src/middleware"
  "backend/tests/unit"
  "backend/tests/integration"
  "lens-studio/Public/Scripts"
  "lens-studio/Public/Scripts/clinical"
  "lens-studio/Public/Scripts/ui"
  "lens-studio/Public/Textures"
  "lens-studio/Public/Fonts"
  "lens-studio/Resources"
  "config"
  "scripts"
  "docs"
)

for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    print_success "Directory exists: $dir"
  else
    print_error "Missing directory: $dir"
  fi
done

echo ""

# ===================================================================
# 3. NPM Packages
# ===================================================================
echo "=== 3. NPM Packages ==="
echo ""

cd backend

# Check if package.json exists
if [ -f "package.json" ]; then
  print_success "package.json exists"
else
  print_error "package.json not found"
  cd ..
  exit 1
fi

# Check required dependencies
required_deps=("express" "dotenv" "cors")
for dep in "${required_deps[@]}"; do
  if grep -q "\"$dep\"" package.json; then
    print_success "Dependency installed: $dep"
  else
    print_error "Missing dependency: $dep"
  fi
done

# Check required dev dependencies
required_dev_deps=("jest" "@types/jest" "supertest" "@types/supertest")
for dep in "${required_dev_deps[@]}"; do
  if grep -q "\"$dep\"" package.json; then
    print_success "Dev dependency installed: $dep"
  else
    print_error "Missing dev dependency: $dep"
  fi
done

# Check if node_modules exists
if [ -d "node_modules" ]; then
  print_success "node_modules directory exists"
else
  print_error "node_modules not found - run 'npm install'"
fi

echo ""

# ===================================================================
# 4. Jest Configuration
# ===================================================================
echo "=== 4. Jest Configuration ==="
echo ""

if [ -f "jest.config.js" ]; then
  print_success "jest.config.js exists"

  # Check for key configurations
  if grep -q "testEnvironment.*node" jest.config.js; then
    print_success "Test environment set to 'node'"
  else
    print_warning "Test environment may not be configured correctly"
  fi

  if grep -q "coverageThreshold" jest.config.js; then
    print_success "Coverage threshold configured"
  else
    print_warning "Coverage threshold not configured"
  fi
else
  print_error "jest.config.js not found"
fi

echo ""

# ===================================================================
# 5. Tests Execution
# ===================================================================
echo "=== 5. Running Tests ==="
echo ""

TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  # Count passing tests
  PASSING_TESTS=$(echo "$TEST_OUTPUT" | grep -oE "Tests:.*[0-9]+ passed" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")

  if [ -n "$PASSING_TESTS" ]; then
    print_success "All tests passing ($PASSING_TESTS tests)"
  else
    print_success "Tests passed"
  fi

  # Check for expected number of tests
  if [ "$PASSING_TESTS" = "13" ]; then
    print_success "Expected test count: 13 (3 setup + 10 demoMode)"
  elif [ -n "$PASSING_TESTS" ]; then
    print_warning "Unexpected test count: $PASSING_TESTS (expected 13)"
  fi
else
  print_error "Tests failed"
  echo ""
  echo "Test output:"
  echo "$TEST_OUTPUT"
fi

cd ..

echo ""

# ===================================================================
# 6. Demo Mode Configuration
# ===================================================================
echo "=== 6. Demo Mode Configuration ==="
echo ""

# Check .env file
if [ -f "backend/.env" ]; then
  print_success "backend/.env exists"

  # Check for required env vars
  if grep -q "DEMO_MODE=true" backend/.env; then
    print_success "DEMO_MODE=true set"
  else
    print_warning "DEMO_MODE not set to true"
  fi

  if grep -q "DEMO_PATIENT_DATA_PATH" backend/.env; then
    print_success "DEMO_PATIENT_DATA_PATH configured"
  else
    print_error "DEMO_PATIENT_DATA_PATH not configured"
  fi

  if grep -q "DEMO_API_RESPONSES_PATH" backend/.env; then
    print_success "DEMO_API_RESPONSES_PATH configured"
  else
    print_error "DEMO_API_RESPONSES_PATH not configured"
  fi
else
  print_error "backend/.env not found"
fi

# Check demo patient data
if [ -f "config/demo_patient_data.json" ]; then
  print_success "config/demo_patient_data.json exists"

  # Check for Sarah Chen
  if grep -q "sarah_chen" config/demo_patient_data.json; then
    print_success "Sarah Chen patient data found"
  else
    print_error "Sarah Chen patient data missing"
  fi

  # Check for Warfarin (drug interaction demo)
  if grep -q "Warfarin" config/demo_patient_data.json; then
    print_success "Warfarin medication found (for drug interaction demo)"
  else
    print_warning "Warfarin not found in patient data"
  fi
else
  print_error "config/demo_patient_data.json not found"
fi

# Check demo API responses
if [ -f "config/demo_api_responses.json" ]; then
  print_success "config/demo_api_responses.json exists"

  # Check for drug interaction response
  if grep -q "prescription_warfarin_interaction" config/demo_api_responses.json; then
    print_success "Warfarin interaction response found"
  else
    print_error "Warfarin interaction response missing"
  fi
else
  print_error "config/demo_api_responses.json not found"
fi

# Check demo mode middleware
if [ -f "backend/src/middleware/demoMode.js" ]; then
  print_success "backend/src/middleware/demoMode.js exists"
else
  print_error "backend/src/middleware/demoMode.js not found"
fi

echo ""

# ===================================================================
# 7. Lens Studio Scripts
# ===================================================================
echo "=== 7. Lens Studio Scripts ==="
echo ""

lens_scripts=(
  "lens-studio/Public/Scripts/config.js"
  "lens-studio/Public/Scripts/clinical/modeManager.js"
  "lens-studio/Public/Scripts/ui/patientCardRenderer.js"
  "lens-studio/Public/Scripts/clinical/clinicalMode.js"
  "lens-studio/Public/Scripts/ui/prescriptionUI.js"
)

for script in "${lens_scripts[@]}"; do
  if [ -f "$script" ]; then
    print_success "Script exists: $script"
  else
    print_error "Missing script: $script"
  fi
done

# Check config.js for key constants
if [ -f "lens-studio/Public/Scripts/config.js" ]; then
  if grep -q "AR_COLORS" lens-studio/Public/Scripts/config.js; then
    print_success "config.js contains AR_COLORS"
  else
    print_warning "AR_COLORS not found in config.js"
  fi

  if grep -q "TIMEOUTS" lens-studio/Public/Scripts/config.js; then
    print_success "config.js contains TIMEOUTS"
  else
    print_warning "TIMEOUTS not found in config.js"
  fi

  if grep -q "CLINICAL_STATE" lens-studio/Public/Scripts/config.js; then
    print_success "config.js contains CLINICAL_STATE"
  else
    print_warning "CLINICAL_STATE not found in config.js"
  fi
fi

echo ""

# ===================================================================
# 8. Documentation
# ===================================================================
echo "=== 8. Documentation ==="
echo ""

docs=(
  "CLAUDE.md"
  "docs/Dev2_Task_2.0_Implementation_Guide.md"
  "docs/Dev2_Clinical_Mode_Requirements.md"
  "docs/Lens_Studio_Manual_Setup_Guide.md"
  "docs/Lens_Studio_API_Reference.md"
  "docs/Full_Lens_API_Comprehensive.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    print_success "Documentation exists: $doc"
  else
    print_error "Missing documentation: $doc"
  fi
done

echo ""

# ===================================================================
# 9. Git Commits
# ===================================================================
echo "=== 9. Git Commits ==="
echo ""

# Check for commits on dev-2-clinical branch
COMMIT_COUNT=$(git rev-list --count dev-2-clinical 2>&1)
if [ $? -eq 0 ]; then
  if [ "$COMMIT_COUNT" -gt 0 ]; then
    print_success "$COMMIT_COUNT commits on dev-2-clinical branch"

    # Show recent commits
    echo ""
    echo "Recent commits:"
    git log --oneline -5 --color=always
  else
    print_error "No commits on dev-2-clinical branch"
  fi
else
  print_warning "Could not check commit count"
fi

echo ""

# ===================================================================
# 10. Optional Checks
# ===================================================================
echo "=== 10. Optional Checks ==="
echo ""

# Check if Lens Studio project exists
if [ -f "lens-studio/MedSnap.lsproj" ]; then
  print_success "Lens Studio project exists: MedSnap.lsproj"
else
  print_warning "Lens Studio project not found (create manually per guide)"
fi

# Check for Spectacles-Sample repo
if [ -d "Spectacles-Sample" ]; then
  print_success "Spectacles-Sample repository cloned"
else
  print_warning "Spectacles-Sample not found (optional reference)"
fi

echo ""
echo "==================================================================="

# ===================================================================
# Final Summary
# ===================================================================
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Task 2.0 Validation PASSED${NC}"
  echo "==================================================================="
  echo ""
  echo "All checks passed! Task 2.0 (Environment Setup) is complete."
  echo ""
  echo "Next Steps:"
  echo "  1. Follow Lens Studio Manual Setup Guide (if not done yet):"
  echo "     docs/Lens_Studio_Manual_Setup_Guide.md"
  echo ""
  echo "  2. Review CLAUDE.md for Task 2.1 guidance"
  echo ""
  echo "  3. Start Task 2.1 at Hour 6 (Mode Manager TDD):"
  echo "     - Write tests first (TDD)"
  echo "     - Implement mode switching logic"
  echo "     - Integrate with Dev 1's voice router at Hour 12"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Task 2.0 Validation FAILED${NC}"
  echo "==================================================================="
  echo ""
  echo -e "${RED}$FAILED checks failed.${NC}"
  echo ""
  echo "Please review the errors above and fix them before proceeding."
  echo ""
  echo "Common fixes:"
  echo "  - Run 'npm install' in backend/ directory"
  echo "  - Verify you're on dev-2-clinical branch"
  echo "  - Check that all files exist in correct locations"
  echo "  - Run 'npm test' to see detailed test errors"
  echo ""
  exit 1
fi
