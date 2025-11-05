# FPR Emarat - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Data Flow](#data-flow)
4. [API Reference](#api-reference)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

## Architecture Overview

The FPR Emarat testing framework is built on Playwright and provides automated validation of Financial Position Reports with multi-company support.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FPR Emarat System                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Test       │────▶ │   Framework  │────▶ │  Report  │ │
│  │   Scripts    │      │   Core       │      │  Engine  │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                      │                    │       │
│         │                      ▼                    │       │
│         │              ┌──────────────┐             │       │
│         │              │  Playwright  │             │       │
│         │              │   Browser    │             │       │
│         │              └──────────────┘             │       │
│         │                      │                    │       │
│         ▼                      ▼                    ▼       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │  Excel       │      │   Web App    │      │  JSON    │ │
│  │  Comparison  │      │   (Emarat)   │      │  Report  │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. FPRTestFramework

The main testing framework class that handles:
- Authentication and navigation
- Template selection
- Report generation
- Data extraction and validation

**Location**: `tests/framework/fpr-test-framework.ts`

**Key Methods**:
- `login()`: Authenticates user
- `navigateToFPR()`: Navigates to FPR module
- `selectTemplate(name: string)`: Selects report template
- `generateReport()`: Generates the FPR report
- `validateReport(reportType: string)`: Extracts and validates data

### 2. Excel Comparison Module

Handles reading and comparing Excel files with test results.

**Location**: `tests/emarat_compare_tmp49D6.ts`

**Key Functions**:
- `readExpectedResultsFromTmp49D6()`: Parses Excel file
- `compareWithExpected()`: Compares actual vs expected
- Generates Excel and JSON reports

### 3. Diagnostic Tools

Utility scripts for analyzing report structure and verifying mappings.

**Locations**:
- `tests/diagnose_report_structure.ts`
- `tests/verify_column_totals.js`
- `tests/generate_complete_mapping.js`
- `tests/generate_line_by_line_mapping.js`

## Data Flow

### Test Execution Flow

```
1. Initialize Framework
   ↓
2. Login to System
   ↓
3. Navigate to FPR Module
   ↓
4. Select Template
   ↓
5. Generate Report
   ↓
6. Extract Data
   │
   ├─ Detect Column Mapping
   ├─ Apply Column Offset
   ├─ Extract Account Codes
   ├─ Extract ACAL Values
   ├─ Extract ANLI Values
   ├─ Extract TURC Values
   └─ Calculate Totals
   ↓
7. Load Expected Data from Excel
   │
   ├─ Parse ACAL Section
   ├─ Parse ANLI Section
   └─ Parse TURC Section
   ↓
8. Compare Actual vs Expected
   │
   ├─ Match by Account Code
   ├─ Compare Company Values
   └─ Calculate Differences
   ↓
9. Generate Reports
   │
   ├─ Excel Report
   ├─ JSON Report
   └─ Mapping Diagrams
```

### Excel File Structure

```
tmp49D6.xlsx
│
├─ Row 1: Headers (Account No, Account Name, Closing Balance)
├─ Row 2: ACAL Section Header
├─ Rows 3-165: ACAL Accounts (162 accounts)
├─ Row 166: ANLI Section Header
├─ Rows 167-280: ANLI Accounts (113 accounts)
├─ Row 281: TURC Section Header
└─ Rows 282-409: TURC Accounts (126 accounts)
```

## API Reference

### FPRTestFramework Class

#### Constructor

```typescript
constructor(page: Page, config: TestConfig)
```

**Parameters**:
- `page`: Playwright Page object
- `config`: Configuration object with baseUrl, credentials, timeout

#### Methods

##### login()

```typescript
async login(): Promise<void>
```

Authenticates user with provided credentials.

**Throws**: Error if login fails

##### navigateToFPR()

```typescript
async navigateToFPR(): Promise<void>
```

Navigates to the FPR module.

##### selectTemplate(templateName: string)

```typescript
async selectTemplate(templateName: string): Promise<void>
```

Selects a report template by name.

**Parameters**:
- `templateName`: Name of the template (e.g., "Test QA2")

##### generateReport()

```typescript
async generateReport(): Promise<void>
```

Generates the FPR report.

##### validateReport(reportType: string)

```typescript
async validateReport(reportType: string): Promise<ValidationResult>
```

Validates the generated report and extracts data.

**Parameters**:
- `reportType`: Type of report ("FPR Report", "Balance Sheet", etc.)

**Returns**: ValidationResult object with accounts and statistics

### AccountRow Interface

```typescript
interface AccountRow {
  account: string;
  header1Value: number;
  header2Value: number;
  totalValue: number;
  calculatedTotal: number;
  isValid: boolean;
  accountCode?: string;
  acalValue?: number;
  anliValue?: number;
  turcValue?: number;
}
```

### ValidationResult Interface

```typescript
interface ValidationResult {
  reportType: string;
  accounts: AccountRow[];
  validAccountRows: number;
  passedCalculations: number;
  failedCalculations: number;
  successRate: number;
}
```

## Configuration

### Environment Configuration

Create a config object with required settings:

```typescript
const config: TestConfig = {
  baseUrl: 'https://sndrydocktest.azurewebsites.net/emarat',
  credentials: {
    username: 'your-username',
    password: 'your-password'
  },
  timeout: 300000 // 5 minutes
};
```

### Playwright Configuration

See `playwright.config.ts` for detailed configuration:
- Browser settings
- Timeout values
- Screenshot/video options
- Report settings

## Troubleshooting

### Common Issues

#### 1. Column Offset Errors

**Problem**: Headers and data columns don't align

**Solution**: The framework automatically detects and corrects column offsets. Check logs for "Detected column offset" message.

#### 2. Account Not Found

**Problem**: Account exists in test but not in Excel

**Solution**: This is expected for new accounts. Check the "Not in Expected" section of the report.

#### 3. Value Mismatches

**Problem**: Values differ between test and Excel

**Solution**: Check if this is a data timing issue. The two known mismatches are legitimate data differences.

#### 4. Timeout Errors

**Problem**: Test times out during execution

**Solution**: Increase timeout in config or check network connectivity.

### Debug Mode

Run tests with debug logging:

```bash
DEBUG=pw:api npx playwright test --headed
```

### Trace Viewer

Record traces for debugging:

```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Performance Optimization

### Current Performance Metrics

- Total execution time: ~65 seconds
- Report generation: ~30 seconds
- Data extraction: ~5 seconds
- Comparison: ~1 second

### Optimization Tips

1. Use `--workers` flag for parallel execution
2. Reduce wait times if report loads quickly
3. Cache authentication state
4. Use API calls instead of UI when possible

## Best Practices

1. **Always use headed mode for debugging**
2. **Check mapping diagrams before investigating mismatches**
3. **Keep Excel file structure consistent**
4. **Run diagnostic tests after major changes**
5. **Review generated reports regularly**

## Future Enhancements

- API integration for direct data access
- Multi-template support
- Historical comparison tracking
- Automated scheduling
- Email notifications
- Dashboard visualization
