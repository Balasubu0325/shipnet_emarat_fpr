# Test Setup and Execution Guide

## ✅ Setup Complete

All required dependencies have been installed and configured for running Playwright tests.

## Installation Status

### 1. ✅ NPM Dependencies Installed
- `@playwright/test@1.56.1` - Playwright testing framework
- `@types/node@24.10.0` - TypeScript type definitions for Node.js
- `xlsx@0.18.5` - Excel file reading/writing library

### 2. ✅ Playwright Browser Installed
- Chromium browser (build 1194) installed at: `~/.cache/ms-playwright/chromium_headless_shell-1194/`
- Browser binary size: 442MB
- Headless mode enabled for CI/CD compatibility

### 3. ✅ Test Script Configured
- `package.json` test script updated to: `"test": "playwright test"`
- Configuration file: `playwright.config.ts`
- Test directory: `./tests`

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npx playwright test emarat_login.ts
npx playwright test emarat_compare_tmp49D6.ts
npx playwright test simple_test.ts
```

### View Test Report
```bash
npx playwright show-report
```

## Test Files

### Main Test Files
1. **emarat_login.ts** - Enhanced validation test
   - Tests login functionality
   - Validates FPR, Balance Sheet, and Profit & Loss reports
   - Applies enhanced validation rules

2. **emarat_compare_tmp49D6.ts** - Excel comparison test
   - Compares FPR report data with expected Excel file
   - Validates ACAL, ANLI, TURC company values
   - Generates detailed comparison reports

3. **simple_test.ts** - Infrastructure verification test
   - Validates TypeScript compilation
   - Confirms Playwright installation
   - Tests basic test execution

### Test Framework
- **tests/framework/fpr-test-framework.ts** - Core testing framework
  - Handles login and navigation
  - Report generation
  - Data validation

## Test Configuration

### Playwright Config (`playwright.config.ts`)
```typescript
testDir: './tests'
testMatch: ['**/emarat_login.ts', '**/emarat_compare_tmp49D6.ts', '**/simple_test.ts']
testIgnore: '**/framework/**'
workers: 1
retries: 2 (in CI)
reporter: 'html'
```

### Test Data
- Excel file: `data/tmp49D6.xlsx`
- Contains expected results for ACAL, ANLI, and TURC companies

## Important Notes

### Network Requirements
The main tests (`emarat_login.ts` and `emarat_compare_tmp49D6.ts`) require:
- Access to: `https://sndrydocktest.azurewebsites.net/emarat`
- Valid credentials: username: 'balasubu', password: 'SHIPNET88'

**Note:** These tests will fail in environments without network access to the Azure website.

### Test Execution in This Environment
- ✅ **simple_test.ts** - Passes successfully (no network required)
- ❌ **emarat_login.ts** - Requires network access
- ❌ **emarat_compare_tmp49D6.ts** - Requires network access

The infrastructure test (`simple_test.ts`) confirms that:
- All dependencies are properly installed
- TypeScript compilation works
- Test framework is operational
- Tests can execute successfully

## Troubleshooting

### Browser Not Found
If you see "Executable doesn't exist" errors:
```bash
npx playwright install chromium
```

### TypeScript Errors
Ensure @types/node is installed:
```bash
npm install --save-dev @types/node
```

### Network Errors
If tests fail with `ERR_NAME_NOT_RESOLVED`:
- Verify network connectivity
- Check if the Azure website is accessible
- Verify credentials are correct

## Success Verification

Run the infrastructure test to verify setup:
```bash
npx playwright test simple_test.ts
```

Expected output:
```
✅ Test infrastructure is working correctly!
✅ TypeScript compilation successful
✅ @playwright/test package installed
✅ Test execution framework operational
  1 passed
```

## Next Steps

To run the actual FPR tests:
1. Ensure network access to `sndrydocktest.azurewebsites.net`
2. Verify credentials are valid
3. Run: `npm test`

For local development:
```bash
# Run tests in headed mode (shows browser)
npx playwright test --headed

# Run specific test with debug
npx playwright test emarat_login.ts --debug

# Generate and view test report
npx playwright test && npx playwright show-report
```
