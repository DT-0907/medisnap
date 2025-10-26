#!/usr/bin/env node

/**
 * Test Runner for All Lens Studio Scripts
 * Runs all test suites and generates coverage report
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('MedSnap Lens Studio Test Runner');
console.log('========================================\n');

// Test files to run
const testFiles = [
    'modeManager.test.js',
    'clinicalMode.test.js',
    'prescriptionUI.test.js',
    'patientCardRenderer.test.js',
    'apiClient.test.js',
    'stateManager.test.js'
];

// Check which test files exist
const existingTests = testFiles.filter(file => {
    const testPath = path.join(__dirname, file);
    return fs.existsSync(testPath);
});

console.log(`Found ${existingTests.length} test files:`);
existingTests.forEach(file => console.log(`  - ${file}`));
console.log('\n');

// Run tests
try {
    console.log('Running tests...\n');

    const testCommand = `npx jest ${existingTests.join(' ')} --config=jest.config.js --coverage --verbose`;

    execSync(testCommand, {
        cwd: __dirname,
        stdio: 'inherit'
    });

    console.log('\n========================================');
    console.log('✅ All tests completed successfully!');
    console.log('========================================');

} catch (error) {
    console.error('\n========================================');
    console.error('❌ Test execution failed!');
    console.error('========================================');
    console.error('Error:', error.message);
    process.exit(1);
}

// Generate test summary
console.log('\n📊 Test Summary:');
console.log('----------------');

// Read coverage summary if available
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
if (fs.existsSync(coveragePath)) {
    try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const total = coverage.total;

        console.log(`  Lines:       ${total.lines.pct}%`);
        console.log(`  Statements:  ${total.statements.pct}%`);
        console.log(`  Functions:   ${total.functions.pct}%`);
        console.log(`  Branches:    ${total.branches.pct}%`);
    } catch (e) {
        console.log('  Coverage data not available');
    }
} else {
    console.log('  Coverage report not generated');
}

console.log('\n✨ Test run complete!');