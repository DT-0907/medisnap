#!/bin/bash

echo "==================================================================="
echo "        Dev 2 Task 2.2: Patient Card Renderer Validation"
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
# 1. Prerequisites Check
# ===================================================================
echo "=== 1. Prerequisites (Task 2.0 & 2.1) ==="
echo ""

# Check Git branch
echo -n "Current branch: "
CURRENT_BRANCH=$(git branch --show-current 2>&1)
if [ "$CURRENT_BRANCH" = "dev-2-clinical" ]; then
  print_success "dev-2-clinical"
else
  print_error "Expected 'dev-2-clinical', got '$CURRENT_BRANCH'"
fi

# Check that Task 2.1 files exist
if [ -f "backend/lens-studio-mock/modeManager.js" ]; then
  print_success "Task 2.1 mode manager mock exists"
else
  print_error "Task 2.1 not completed - modeManager.js missing"
fi

echo ""

# ===================================================================
# 2. Test Files
# ===================================================================
echo "=== 2. Test Files ==="
echo ""

if [ -f "backend/tests/unit/patientCardRenderer.test.js" ]; then
  print_success "patientCardRenderer.test.js exists"

  # Count test cases
  TEST_COUNT=$(grep -c "test('.*Should" backend/tests/unit/patientCardRenderer.test.js)
  if [ "$TEST_COUNT" -ge 16 ]; then
    print_success "$TEST_COUNT test cases (expected ≥16)"
  else
    print_error "Only $TEST_COUNT test cases (expected ≥16)"
  fi

  # Check for key test cases
  if grep -q "Should display patient name, age, and sex" backend/tests/unit/patientCardRenderer.test.js; then
    print_success "Test 1: Display patient info"
  else
    print_error "Missing Test 1: Display patient info"
  fi

  if grep -q "Should display allergies prominently in RED" backend/tests/unit/patientCardRenderer.test.js; then
    print_success "Test 2: Allergies in RED"
  else
    print_error "Missing Test 2: Allergies in RED"
  fi

  if grep -q "Should auto-hide card after 10 seconds" backend/tests/unit/patientCardRenderer.test.js; then
    print_success "Test 14: Auto-hide timer"
  else
    print_error "Missing Test 14: Auto-hide timer"
  fi
else
  print_error "patientCardRenderer.test.js not found"
fi

echo ""

# ===================================================================
# 3. Implementation Files
# ===================================================================
echo "=== 3. Implementation Files ==="
echo ""

# Node.js Mock
if [ -f "backend/lens-studio-mock/patientCardRenderer.js" ]; then
  print_success "Node.js mock: patientCardRenderer.js exists"

  # Check for key methods
  if grep -q "renderPatientCard" backend/lens-studio-mock/patientCardRenderer.js; then
    print_success "Mock has renderPatientCard method"
  else
    print_error "Mock missing renderPatientCard method"
  fi

  if grep -q "updateCardField" backend/lens-studio-mock/patientCardRenderer.js; then
    print_success "Mock has updateCardField method"
  else
    print_error "Mock missing updateCardField method"
  fi

  if grep -q "showAllergies" backend/lens-studio-mock/patientCardRenderer.js; then
    print_success "Mock has showAllergies method"
  else
    print_error "Mock missing showAllergies method"
  fi
else
  print_error "Node.js mock not found"
fi

# Lens Studio Implementation
if [ -f "lens-studio/Public/Scripts/ui/patientCardRenderer.js" ]; then
  print_success "Lens Studio: patientCardRenderer.js exists"

  # Check for key functions
  if grep -q "function renderPatientCard" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Has renderPatientCard function"
  else
    print_error "Missing renderPatientCard function"
  fi

  if grep -q "function updateCardField" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Has updateCardField function"
  else
    print_error "Missing updateCardField function"
  fi

  if grep -q "function showPatientHistory" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Has showPatientHistory function"
  else
    print_error "Missing showPatientHistory function"
  fi

  if grep -q "function showMedications" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Has showMedications function"
  else
    print_error "Missing showMedications function"
  fi

  if grep -q "function showAllergies" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Has showAllergies function"
  else
    print_error "Missing showAllergies function"
  fi

  # Check for AR_COLORS usage
  if grep -q "AR_COLORS.ALLERGY_TEXT" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Uses AR_COLORS.ALLERGY_TEXT (FR AR-1)"
  else
    print_error "Not using AR_COLORS.ALLERGY_TEXT"
  fi

  # Check for auto-hide timer
  if grep -q "PATIENT_CARD_AUTO_HIDE" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Uses PATIENT_CARD_AUTO_HIDE timeout (FR-13)"
  else
    print_error "Not using PATIENT_CARD_AUTO_HIDE timeout"
  fi

  # Check for DelayedCallbackEvent
  if grep -q "DelayedCallbackEvent" lens-studio/Public/Scripts/ui/patientCardRenderer.js; then
    print_success "Uses DelayedCallbackEvent for auto-hide"
  else
    print_warning "Not using DelayedCallbackEvent (may use alternative timer)"
  fi
else
  print_error "Lens Studio implementation not found"
fi

echo ""

# ===================================================================
# 4. Run Tests
# ===================================================================
echo "=== 4. Running Tests ==="
echo ""

cd backend

TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  # Count passing tests
  PASSING_TESTS=$(echo "$TEST_OUTPUT" | grep -oE "Tests:.*[0-9]+ passed" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")

  if [ -n "$PASSING_TESTS" ]; then
    print_success "All tests passing ($PASSING_TESTS tests)"

    # Check for expected number of tests (31 from Task 2.0/2.1 + 16 from Task 2.2 = 47)
    if [ "$PASSING_TESTS" = "47" ]; then
      print_success "Expected test count: 47 (31 from Tasks 2.0/2.1 + 16 from Task 2.2)"
    elif [ "$PASSING_TESTS" -ge 47 ]; then
      print_success "Test count: $PASSING_TESTS (≥47 expected)"
    else
      print_warning "Unexpected test count: $PASSING_TESTS (expected 47)"
    fi

    # Check for patient card renderer tests specifically
    PATIENT_CARD_TESTS=$(echo "$TEST_OUTPUT" | grep -oE "Patient Card Renderer.*[0-9]+" | wc -l)
    if [ "$PATIENT_CARD_TESTS" -gt 0 ]; then
      print_success "Patient Card Renderer test suite running"
    else
      print_warning "Patient Card Renderer test suite not detected in output"
    fi
  else
    print_success "Tests passed"
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
# 5. Requirements Coverage
# ===================================================================
echo "=== 5. Requirements Coverage ==="
echo ""

# FR-13: Patient card display
if [ -f "backend/lens-studio-mock/patientCardRenderer.js" ]; then
  if grep -q "patientName" backend/lens-studio-mock/patientCardRenderer.js && \
     grep -q "allergies" backend/lens-studio-mock/patientCardRenderer.js && \
     grep -q "medications" backend/lens-studio-mock/patientCardRenderer.js && \
     grep -q "vitals" backend/lens-studio-mock/patientCardRenderer.js; then
    print_success "FR-13: Patient card displays all required fields"
  else
    print_error "FR-13: Missing required patient card fields"
  fi
fi

# AR-1: Color coding (RED for allergies)
if grep -q "ALLERGY_TEXT.*1.*0.*0.*1" lens-studio/Public/Scripts/config.js; then
  print_success "AR-1: ALLERGY_TEXT is RED (1, 0, 0, 1)"
else
  print_error "AR-1: ALLERGY_TEXT not configured as RED"
fi

# AR-3: Layout positioning (top 1/3 center)
if grep -q "0.5.*0.9" docs/Lens_Studio_AI_Assistant_Instructions.md 2>/dev/null; then
  print_success "AR-3: Card positioned at top center (0.5, 0.9)"
else
  print_warning "AR-3: Card positioning not verified (check Lens Studio scene)"
fi

# AR-4: Auto-hide (10 seconds)
if grep -q "PATIENT_CARD_AUTO_HIDE.*10000" lens-studio/Public/Scripts/config.js; then
  print_success "AR-4: Auto-hide configured for 10 seconds"
else
  print_error "AR-4: Auto-hide timeout not configured correctly"
fi

echo ""

# ===================================================================
# 6. Demo Data Integration
# ===================================================================
echo "=== 6. Demo Data Integration ==="
echo ""

if [ -f "config/demo_patient_data.json" ]; then
  # Check that Sarah Chen has required fields for testing
  if grep -q "sarah_chen" config/demo_patient_data.json && \
     grep -q "Penicillin" config/demo_patient_data.json && \
     grep -q "Warfarin" config/demo_patient_data.json; then
    print_success "Sarah Chen demo patient has allergy and medication data"
  else
    print_warning "Sarah Chen demo patient may be missing test data"
  fi

  # Check for Robert Martinez (no allergies edge case)
  if grep -q "robert_martinez" config/demo_patient_data.json; then
    print_success "Robert Martinez demo patient exists (no allergies edge case)"
  else
    print_warning "Missing Robert Martinez patient (optional edge case test)"
  fi
else
  print_error "demo_patient_data.json not found"
fi

echo ""

# ===================================================================
# 7. Git Commits
# ===================================================================
echo "=== 7. Git Commits ==="
echo ""

# Check for Task 2.2 commits
TASK_2_2_COMMITS=$(git log --oneline --grep="Task 2.2" --grep="patient card" --grep="patientCardRenderer" -i | wc -l)

if [ "$TASK_2_2_COMMITS" -ge 2 ]; then
  print_success "$TASK_2_2_COMMITS commits for Task 2.2 (expected ≥2: tests + implementation)"
else
  print_warning "Only $TASK_2_2_COMMITS Task 2.2 commits found (expected ≥2)"
fi

# Show recent commits
echo ""
echo "Recent commits:"
git log --oneline -5 --color=always

echo ""

# ===================================================================
# 8. TDD Workflow Verification
# ===================================================================
echo "=== 8. TDD Workflow ==="
echo ""

# Check if test commit came before implementation commit
TEST_COMMIT=$(git log --oneline --grep="test.*patient card" -i --format="%H" | tail -1)
IMPL_COMMIT=$(git log --oneline --grep="feat.*patient card" -i --format="%H" | tail -1)

if [ -n "$TEST_COMMIT" ] && [ -n "$IMPL_COMMIT" ]; then
  # Check if test commit is ancestor of impl commit (i.e., test came first)
  if git merge-base --is-ancestor "$TEST_COMMIT" "$IMPL_COMMIT" 2>/dev/null; then
    print_success "TDD workflow: Tests committed before implementation ✅"
  else
    print_warning "TDD workflow: Could not verify test-first approach"
  fi
else
  print_warning "TDD workflow: Could not find test and implementation commits"
fi

echo ""

# ===================================================================
# Final Summary
# ===================================================================
echo "==================================================================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Task 2.2 Validation PASSED${NC}"
  echo "==================================================================="
  echo ""
  echo "All checks passed! Task 2.2 (Patient Card Renderer) is complete."
  echo ""
  echo "Summary:"
  echo "  - ✅ 16+ test cases covering all FR-13 requirements"
  echo "  - ✅ Node.js mock implementation for Jest testing"
  echo "  - ✅ Lens Studio implementation with all view modes"
  echo "  - ✅ Allergy display in RED (AR-1)"
  echo "  - ✅ Auto-hide after 10 seconds (AR-4)"
  echo "  - ✅ All $PASSING_TESTS tests passing"
  echo "  - ✅ TDD workflow followed (tests first, then implementation)"
  echo ""
  echo "Next Steps:"
  echo "  1. Review Task 2.3 implementation guide:"
  echo "     docs/Dev2_Task_2.3_Implementation_Guide.md"
  echo ""
  echo "  2. Start Task 2.3 (Clinical Mode State Machine):"
  echo "     - Write tests for state transitions"
  echo "     - Implement clinical workflow states"
  echo "     - Integrate with patient card and prescription UI"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Task 2.2 Validation FAILED${NC}"
  echo "==================================================================="
  echo ""
  echo -e "${RED}$FAILED checks failed.${NC}"
  echo ""
  echo "Please review the errors above and fix them before proceeding."
  echo ""
  echo "Common fixes:"
  echo "  - Ensure all 16 test cases are written and passing"
  echo "  - Verify Node.js mock exports all required methods"
  echo "  - Check Lens Studio script has all required functions"
  echo "  - Run 'npm test' to see detailed test errors"
  echo "  - Verify TDD workflow: commit tests before implementation"
  echo ""
  exit 1
fi
