# Changelog

All notable changes to the FPR Emarat testing framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-05

### Added
- Initial release of FPR Emarat testing framework
- Multi-company support (ACAL, ANLI, TURC)
- Excel comparison functionality with tmp49D6.xlsx
- FPRTestFramework core testing framework
- Automatic column detection and offset correction
- Enhanced validation with business rules
- Excel report generation with multiple sheets:
  - Summary statistics
  - Detailed comparison
  - Perfect matches
  - Mismatches
  - Actual results export
- JSON comparison report generation
- Line-by-line mapping diagrams
- Complete mapping diagrams for all accounts
- Diagnostic tools for report structure analysis
- Account code verification across companies
- Column total validation
- Wait times for report evaluation

### Features
- 99.02% match rate achievement (203/205 accounts)
- Support for 240 unique accounts
- Comprehensive error reporting
- Visual ASCII mapping diagrams
- Category-wise account analysis
- Automatic handling of missing accounts (treated as 0)

### Technical Improvements
- Column offset detection (2-column offset handling)
- Multi-company column extraction
- Header filtering to skip non-data rows
- Robust account code matching
- Total calculation validation
- Difference highlighting for mismatches

### Documentation
- Comprehensive README.md
- CONTRIBUTING.md guidelines
- Line-by-line mapping documentation
- Complete verification diagrams
- Column mapping verification

### Known Issues
- VESSEL MANAGEMENT FEE (4110-130): Value differences detected
- BANK CHARGES (5320-120): ACAL value mismatch
- 26 accounts in test but not in Excel (possibly new accounts)
- 9 accounts in Excel but not in test (possibly removed/renamed)

## [Unreleased]

### Planned
- CI/CD integration
- Automated test scheduling
- Email notifications for test results
- Historical comparison tracking
- Dashboard for visualization
- API integration for data fetching
- Multi-environment support
- Performance optimizations

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2025-11-05 | Initial release with multi-company support and 99.02% match rate |
