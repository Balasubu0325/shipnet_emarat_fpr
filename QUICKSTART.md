# Quick Start Guide

Get up and running with FPR Emarat testing framework in minutes!

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18.x or higher installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] Access to Emarat test environment
- [ ] Valid credentials for the system

## 🚀 5-Minute Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/FPR_Emarat.git
cd FPR_Emarat
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Playwright testing framework
- xlsx for Excel file handling
- TypeScript and type definitions
- All other required dependencies

### Step 3: Install Playwright Browsers

```bash
npx playwright install
```

This downloads the required browser binaries (Chromium, Firefox, WebKit).

### Step 4: Configure Credentials (Optional)

If you need to update credentials, edit the test files:

```typescript
// tests/emarat_compare_tmp49D6.ts
const config: TestConfig = {
  baseUrl: 'https://sndrydocktest.azurewebsites.net/emarat',
  credentials: {
    username: 'your-username',  // Update this
    password: 'your-password'    // Update this
  },
  timeout: 300000
};
```

### Step 5: Run Your First Test

```bash
npx playwright test emarat_compare_tmp49D6.ts --headed
```

This runs the Excel comparison test with a visible browser window.

## 🎯 What You'll See

1. **Browser Opens**: A Chromium browser window appears
2. **Login**: Automatic authentication
3. **Navigation**: Moves to FPR module
4. **Report Generation**: Creates the report (takes ~30 seconds)
5. **Data Extraction**: Extracts all account data
6. **Comparison**: Compares with Excel file
7. **Results**: Shows match rate and statistics

### Expected Output

```
✅ Extracted 232 accounts from FPR Report
✅ Loaded 214 expected accounts from Excel
📊 Perfect Matches: 203
⚠️  Mismatches: 2
📊 Match Rate: 99.02%
```

## 📊 Generated Files

After the test completes, you'll find:

1. **Excel Report**: `data/Actual_Results_Comparison.xlsx`
   - Open with Excel or any spreadsheet software
   - Contains detailed comparison with multiple sheets

2. **JSON Report**: `tmp49D6-comparison-report.json`
   - Structured data for programmatic access

3. **Mapping Diagrams**: `*_MAPPING_DIAGRAM.txt`
   - Text-based visual comparisons

## 🔍 Viewing Results

### HTML Report

View the detailed HTML report:

```bash
npx playwright show-report
```

This opens an interactive report in your browser showing:
- Test execution timeline
- Screenshots and videos
- Detailed logs
- Error traces

### Excel Report

Open the generated Excel file:

```bash
# Windows
start data/Actual_Results_Comparison.xlsx

# Mac
open data/Actual_Results_Comparison.xlsx

# Linux
xdg-open data/Actual_Results_Comparison.xlsx
```

## 🧪 Running Different Tests

### Excel Comparison Test (Recommended)

```bash
npx playwright test emarat_compare_tmp49D6.ts --headed
```

### Enhanced Validation Test

```bash
npx playwright test emarat_login.ts --headed
```

### Run All Tests

```bash
npx playwright test
```

### Run in Headless Mode (No Browser Window)

```bash
npx playwright test emarat_compare_tmp49D6.ts
```

## 📈 Understanding Results

### Match Rate

- **99%+**: Excellent! Minor differences expected
- **90-99%**: Good, investigate mismatches
- **<90%**: Check for data issues or mapping errors

### Common Scenarios

#### ✅ Perfect Match
Account values match exactly between test and Excel.

#### ⚠️ Mismatch
Values differ - could be:
- Data timing (report generated at different time)
- Legitimate data changes
- Data entry errors

#### ➖ Not in Excel
Account exists in test but not Excel:
- New account added after Excel was created
- Expected behavior for new accounts

#### ➕ Not in Test
Account exists in Excel but not test:
- Account removed or renamed
- Check if still active in system

## 🛠️ Troubleshooting

### Test Fails to Start

**Issue**: Browser doesn't open
```bash
# Reinstall browsers
npx playwright install --force
```

### Login Fails

**Issue**: Authentication error

**Solution**: 
1. Check credentials in test file
2. Verify system is accessible
3. Try manual login to confirm credentials

### Timeout Errors

**Issue**: Test times out

**Solution**:
```bash
# Increase timeout (edit playwright.config.ts)
timeout: 600000  // 10 minutes
```

### Excel File Not Found

**Issue**: Can't find tmp49D6.xlsx

**Solution**:
1. Ensure file exists in `data/` folder
2. Check file path in test script

## 📚 Next Steps

Now that you're set up:

1. **Review Results**: Check the generated Excel report
2. **Explore Tests**: Look at test files to understand structure
3. **Run Diagnostics**: Use verification scripts
4. **Customize**: Modify tests for your needs
5. **Read Docs**: Check DOCUMENTATION.md for details

## 💡 Tips for Success

1. **Always run in headed mode first** to see what's happening
2. **Check logs** if something unexpected occurs
3. **Review mapping diagrams** to understand data flow
4. **Keep Excel file updated** with expected values
5. **Run tests regularly** to catch issues early

## 🆘 Getting Help

If you encounter issues:

1. Check the [DOCUMENTATION.md](DOCUMENTATION.md) file
2. Review [Troubleshooting](#troubleshooting) section
3. Check test logs for error messages
4. Create an issue on GitHub
5. Contact the development team

## 🎉 You're Ready!

You've successfully set up the FPR Emarat testing framework. Start running tests and exploring the results!

### Quick Reference Commands

```bash
# Run main test
npx playwright test emarat_compare_tmp49D6.ts --headed

# View report
npx playwright show-report

# Generate mapping diagrams
node tests/generate_complete_mapping.js
node tests/generate_line_by_line_mapping.js

# Run verification
node tests/verify_column_totals.js
```

Happy testing! 🚀
