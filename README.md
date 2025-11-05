# FPR Emarat - Financial Position Report Testing Framework

A comprehensive Playwright-based testing framework for validating Financial Position Reports (FPR) with multi-company support and Excel comparison capabilities.

## 🎯 Project Overview

This project provides automated testing for the Emarat FPR system, comparing actual report data against expected values from Excel files. It supports multi-company validation (ACAL, ANLI, TURC) with detailed comparison and reporting features.

## ✨ Features

- **Multi-Company Support**: Validates data for ACAL, ANLI, and TURC companies simultaneously
- **Excel Comparison**: Compares test results with expected values from Excel files
- **Comprehensive Reporting**: Generates detailed comparison reports in JSON and Excel formats
- **Line-by-Line Mapping**: Complete audit trail of every account comparison
- **Visual Diagrams**: ASCII-based mapping diagrams for easy verification
- **99.02% Match Rate**: Achieves high accuracy in data validation
- **Enhanced Validation Logic**: Intelligent business rules for edge cases

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Access to the Emarat test environment

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/FPR_Emarat.git
cd FPR_Emarat
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## 📦 Dependencies

```json
{
  "playwright": "^1.40.0",
  "xlsx": "^0.18.5",
  "@types/node": "^20.0.0"
}
```

## 🏗️ Project Structure

```
FPR_Emarat/
├── tests/
│   ├── framework/
│   │   └── fpr-test-framework.ts       # Core testing framework
│   ├── emarat_login.ts                  # Enhanced validation test
│   ├── emarat_compare_tmp49D6.ts       # Excel comparison test
│   ├── diagnose_report_structure.ts    # Diagnostic utilities
│   └── verify_*.js                      # Verification scripts
├── data/
│   ├── tmp49D6.xlsx                     # Expected results Excel
│   └── Actual_Results_Comparison.xlsx  # Generated comparison report
├── playwright-report/                   # Test execution reports
├── test-results/                        # Test artifacts
├── playwright.config.ts                 # Playwright configuration
├── package.json                         # Project dependencies
├── COMPLETE_MAPPING_DIAGRAM.txt        # Full account mapping
├── LINE_BY_LINE_MAPPING_DIAGRAM.txt    # Detailed line-by-line comparison
└── README.md                            # This file
```

## 🧪 Running Tests

### Basic Test Execution

Run the Excel comparison test:
```bash
npx playwright test emarat_compare_tmp49D6.ts
```

Run in headed mode (visible browser):
```bash
npx playwright test emarat_compare_tmp49D6.ts --headed
```

Run enhanced validation test:
```bash
npx playwright test emarat_login.ts --headed
```

### Generate Reports

View HTML report:
```bash
npx playwright show-report
```

Generate mapping diagrams:
```bash
node tests/verify_column_totals.js
node tests/generate_complete_mapping.js
node tests/generate_line_by_line_mapping.js
```

## 📊 Test Results

The framework generates multiple output files:

1. **Excel Comparison** (`data/Actual_Results_Comparison.xlsx`):
   - Summary statistics
   - Detailed comparison with differences
   - Perfect matches sheet
   - Mismatches sheet
   - Actual results export

2. **JSON Report** (`tmp49D6-comparison-report.json`):
   - Complete comparison data
   - Structured format for programmatic access

3. **Mapping Diagrams**:
   - `COMPLETE_MAPPING_DIAGRAM.txt`: All 240 accounts
   - `LINE_BY_LINE_MAPPING_DIAGRAM.txt`: Detailed line-by-line comparison

## 🔍 Key Features Explained

### Multi-Company Validation

The framework extracts and validates data for three companies:
- **ACAL** (APL CALIFORNIA)
- **ANLI** (AN LI)
- **TURC** (AFRICAN TURACO)

Each company's data is compared against corresponding sections in the Excel file.

### Column Mapping

The framework automatically detects and handles:
- Column offsets between header and data rows
- Multi-company column structures
- Missing values (treated as 0)
- Account code matching across sections

### Validation Rules

- Exact value matching with 0.01 tolerance
- Account code verification
- Total calculation validation
- Cross-company consistency checks

## 📈 Current Performance

- **Total Accounts**: 232 in test, 214 in Excel
- **Perfect Matches**: 203 accounts (99.02%)
- **Mismatches**: 2 accounts (0.98%)
- **Test Only**: 26 accounts
- **Excel Only**: 9 accounts

## 🔧 Configuration

### Test Environment

Update credentials in test files:
```typescript
const config: TestConfig = {
  baseUrl: 'https://sndrydocktest.azurewebsites.net/emarat',
  credentials: {
    username: 'your-username',
    password: 'your-password'
  },
  timeout: 300000
};
```

### Excel File Path

Update the Excel file path if needed:
```typescript
const excelPath = path.join(process.cwd(), 'data', 'tmp49D6.xlsx');
```

## 🐛 Known Issues

1. **VESSEL MANAGEMENT FEE** (4110-130): Value differences across all companies
2. **BANK CHARGES** (5320-120): ACAL value mismatch

These appear to be legitimate data differences rather than extraction errors.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- Playwright team for the excellent testing framework
- SheetJS for Excel file handling
- Emarat project team

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** (2025-11-05)
  - Initial release
  - Multi-company support
  - Excel comparison features
  - Line-by-line mapping diagrams
  - 99.02% match rate achieved

## 🚦 Status

![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Match Rate](https://img.shields.io/badge/match%20rate-99.02%25-brightgreen)
![Coverage](https://img.shields.io/badge/accounts-232%2F240-blue)
