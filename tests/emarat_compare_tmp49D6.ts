import { test, expect } from '@playwright/test';
import { FPRTestFramework, TestConfig } from './framework/fpr-test-framework';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

interface ExpectedRow {
  accountCode: string;
  accountName: string;
  acal: number;
  anli: number;
  turc: number;
  total: number;
}

function readExpectedResultsFromTmp49D6(filePath: string): ExpectedRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  const sheetName = workbook.SheetNames[0];
  console.log(`📄 Using sheet: ${sheetName}`);
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  console.log(`\n📋 Excel Structure - First row keys:`);
  if (jsonData.length > 0) {
    console.log(Object.keys(jsonData[0] as any));
    console.log(`\n📋 Sample data (first 3 rows):`);
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
  }

  // Parse as raw rows to handle company sections
  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
  
  console.log(`\n📋 Total rows in Excel: ${(rawData as any[]).length}`);
  
  // Parse accounts by company
  const accountMap = new Map<string, { accountCode: string, accountName: string, companies: Map<string, number> }>();
  let currentCompany = '';
  
  for (let i = 0; i < (rawData as any[]).length; i++) {
    const row = (rawData as any[])[i];
    if (!row || row.length === 0) continue;
    
    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();
    const col2 = row[2];
    
    // Detect company section headers
    if (col0.includes('ACAL') || col0.includes('APL CALIFORNIA')) {
      currentCompany = 'ACAL';
      console.log(`Found ${currentCompany} section at row ${i}`);
      continue;
    } else if (col0.includes('ANLI') || col0.includes('ANL INTERNATIONAL')) {
      currentCompany = 'ANLI';
      console.log(`Found ${currentCompany} section at row ${i}`);
      continue;
    } else if (col0.includes('TURC') || col0.includes('APL TURKEY')) {
      currentCompany = 'TURC';
      console.log(`Found ${currentCompany} section at row ${i}`);
      continue;
    }
    
    // Skip header rows and empty rows
    if (!currentCompany || col0 === 'Account No' || col0 === 'Account' || !col0 || !col1) {
      continue;
    }
    
    // Parse account data
    const accountCode = col0;
    const accountName = col1;
    const amount = parseFloat(col2) || 0;
    
    if (!accountMap.has(accountName)) {
      accountMap.set(accountName, {
        accountCode,
        accountName,
        companies: new Map()
      });
    }
    
    accountMap.get(accountName)!.companies.set(currentCompany, amount);
  }
  
  console.log(`\n📋 Parsed ${accountMap.size} unique accounts across companies`);
  
  // Convert to ExpectedRow format
  const expectedRows: ExpectedRow[] = Array.from(accountMap.values()).map(data => {
    const acal = data.companies.get('ACAL') || 0;
    const anli = data.companies.get('ANLI') || 0;
    const turc = data.companies.get('TURC') || 0;
    const total = acal + anli + turc;
    
    return {
      accountCode: data.accountCode,
      accountName: data.accountName,
      acal,
      anli,
      turc,
      total
    };
  });

  return expectedRows;
}

function compareWithExpected(actualAccounts: any[], expectedAccounts: ExpectedRow[]) {
  const comparisonResults = [];
  let perfectMatches = 0;
  let mismatches = 0;
  let notFoundInExpected = 0;
  let notFoundInActual = 0;

  console.log('\n================================================================================');
  console.log('📊 DETAILED COMPARISON: ACTUAL vs EXPECTED (tmp49D6.xlsx)');
  console.log('================================================================================\n');

  // Create a map of expected accounts for quick lookup (by account name)
  const expectedMap = new Map<string, ExpectedRow>();
  expectedAccounts.forEach(exp => {
    expectedMap.set(exp.accountName, exp);
  });

  // Compare actual accounts with expected
  for (const actual of actualAccounts) {
    const actualAccountName = (actual.account || '').trim();
    
    if (!actualAccountName) continue;

    const expected = expectedMap.get(actualAccountName);

    if (!expected) {
      notFoundInExpected++;
      comparisonResults.push({
        accountCode: actualAccountName,
        status: 'NOT_IN_EXPECTED',
        actual: {
          h1: actual.header1Value,
          h2: actual.header2Value,
          total: actual.totalValue
        },
        expected: null,
        differences: ['Account not found in expected Excel file']
      });
      continue;
    }

    const differences = [];
    const tolerance = 0.01;

    // Use extended company values if available, otherwise fall back to header values
    const actualACAL = actual.acalValue !== undefined ? actual.acalValue : actual.header1Value;
    const actualANLI = actual.anliValue !== undefined ? actual.anliValue : actual.header2Value;
    const actualTURC = actual.turcValue !== undefined ? actual.turcValue : 0;

    // Compare ACAL
    if (Math.abs(actualACAL - expected.acal) > tolerance) {
      differences.push({
        field: 'ACAL',
        expected: expected.acal,
        actual: actualACAL,
        diff: actualACAL - expected.acal
      });
    }

    // Compare ANLI
    if (Math.abs(actualANLI - expected.anli) > tolerance) {
      differences.push({
        field: 'ANLI',
        expected: expected.anli,
        actual: actualANLI,
        diff: actualANLI - expected.anli
      });
    }

    // Compare TURC
    if (Math.abs(actualTURC - expected.turc) > tolerance) {
      differences.push({
        field: 'TURC',
        expected: expected.turc,
        actual: actualTURC,
        diff: actualTURC - expected.turc
      });
    }
    
    // Compare Total
    if (Math.abs(actual.totalValue - expected.total) > tolerance) {
      differences.push({
        field: 'Total',
        expected: expected.total,
        actual: actual.totalValue,
        diff: actual.totalValue - expected.total
      });
    }

    const status = differences.length === 0 ? 'MATCH' : 'MISMATCH';
    
    if (status === 'MATCH') {
      perfectMatches++;
    } else {
      mismatches++;
    }

    comparisonResults.push({
      accountCode: expected.accountCode,
      accountName: actualAccountName,
      status,
      actual: {
        acal: actualACAL,
        anli: actualANLI,
        turc: actualTURC,
        total: actual.totalValue,
        isValid: actual.isValid
      },
      expected: {
        acal: expected.acal,
        anli: expected.anli,
        turc: expected.turc,
        total: expected.total
      },
      differences
    });

    // Mark as found in expected map
    expectedMap.delete(actualAccountName);
  }

  // Accounts in expected but not in actual
  notFoundInActual = expectedMap.size;
  for (const [accountName, expected] of expectedMap) {
    comparisonResults.push({
      accountCode: expected.accountCode,
      accountName: accountName,
      status: 'NOT_IN_ACTUAL',
      actual: null,
      expected: {
        acal: expected.acal,
        anli: expected.anli,
        turc: expected.turc,
        total: expected.total
      },
      differences: ['Account not found in actual report']
    });
  }

  return { 
    comparisonResults, 
    perfectMatches, 
    mismatches, 
    notFoundInExpected, 
    notFoundInActual 
  };
}

test('Compare FPR Report with tmp49D6.xlsx for ACAL, ANLI, TURC', async ({ page }) => {
  test.setTimeout(300000);
  
  const config: TestConfig = {
    baseUrl: 'https://sndrydocktest.azurewebsites.net/emarat',
    credentials: {
      username: 'balasubu',
      password: 'SHIPNET88'
    },
    timeout: 300000
  };

  const framework = new FPRTestFramework(page, config);
  const startTime = new Date();
  
  console.log('🎯 TASK: Compare FPR Report with tmp49D6.xlsx');
  console.log('📋 Validation: Account Code + ACAL + ANLI + TURC + Total');
  console.log('📁 Excel File: tmp49D6.xlsx\n');
  
  // Login and navigate
  console.log('📋 Step 1: Authentication and Navigation');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await framework.login();
  await framework.navigateToFPR();
  
  console.log('📋 Step 2: Template Selection');
  await framework.selectTemplate('Test QA2');
  
  console.log('📋 Step 3: Generate FPR Report');
  await framework.generateReport();
  
  // Wait for report to fully render
  console.log('⏳ Waiting for report to fully render (5 seconds)...');
  await page.waitForTimeout(5000);
  
  console.log('📋 Step 4: Extract Actual Results from FPR Report');
  const actualResult = await framework.validateReport('FPR Report');
  
  console.log(`\n✅ Extracted ${actualResult.accounts.length} accounts from FPR Report`);
  console.log(`   Valid account rows: ${actualResult.validAccountRows}`);
  
  // Wait to allow viewing the evaluated report
  console.log('⏳ Pausing for 10 seconds to review the report...');
  await page.waitForTimeout(10000);
  
  // Read expected results from tmp49D6.xlsx
  console.log('\n📋 Step 5: Reading Expected Results from tmp49D6.xlsx');
  const excelPath = path.join(process.cwd(), 'data', 'tmp49D6.xlsx');
  
  let expectedAccounts: ExpectedRow[] = [];
  
  try {
    expectedAccounts = readExpectedResultsFromTmp49D6(excelPath);
    console.log(`✅ Loaded ${expectedAccounts.length} expected accounts from Excel`);
    
    // Show sample of expected data
    if (expectedAccounts.length > 0) {
      console.log(`\n📋 Sample Expected Data (first 3 rows):`);
      expectedAccounts.slice(0, 3).forEach((exp, idx) => {
        console.log(`   ${idx + 1}. ${exp.accountCode}`);
        console.log(`      ACAL: ${exp.acal}, ANLI: ${exp.anli}, TURC: ${exp.turc}, Total: ${exp.total}`);
      });
    }
  } catch (error: any) {
    console.error(`❌ Error reading Excel file: ${error.message}`);
    throw error;
  }
  
  // Compare results
  console.log('\n📋 Step 6: Comparing Actual vs Expected Results');
  const { 
    comparisonResults, 
    perfectMatches, 
    mismatches, 
    notFoundInExpected, 
    notFoundInActual 
  } = compareWithExpected(actualResult.accounts, expectedAccounts);
  
  // Display mismatches in detail
  const mismatchedAccounts = comparisonResults.filter(r => r.status === 'MISMATCH');
  if (mismatchedAccounts.length > 0) {
    console.log(`\n⚠️  MISMATCHES FOUND (${mismatchedAccounts.length} accounts):`);
    console.log('================================================================================');
    
    mismatchedAccounts.forEach((result: any, idx) => {
      console.log(`\n${idx + 1}. Account: ${result.accountCode} - ${result.accountName}`);
      if (result.actual) {
        console.log(`   ACTUAL:   ACAL=${result.actual.acal.toFixed(2)}, ANLI=${result.actual.anli.toFixed(2)}, Total=${result.actual.total.toFixed(2)}`);
      }
      console.log(`   EXPECTED: ACAL=${result.expected?.acal.toFixed(2)}, ANLI=${result.expected?.anli.toFixed(2)}, TURC=${result.expected?.turc.toFixed(2)}, Total=${result.expected?.total.toFixed(2)}`);
      console.log(`   Differences:`);
      result.differences.forEach((diff: any) => {
        if (diff.field) {
          console.log(`      ${diff.field}: Expected ${diff.expected}, Got ${diff.actual}, Diff: ${diff.diff}`);
        }
      });
    });
  }
  
  // Display accounts not in expected
  const notFound = comparisonResults.filter(r => r.status === 'NOT_IN_EXPECTED');
  if (notFound.length > 0) {
    console.log(`\n📋 ACCOUNTS IN ACTUAL BUT NOT IN EXPECTED (${notFound.length} accounts):`);
    notFound.slice(0, 5).forEach((result: any, idx) => {
      console.log(`   ${idx + 1}. ${result.accountCode || result.accountName}`);
    });
    if (notFound.length > 5) {
      console.log(`   ... and ${notFound.length - 5} more`);
    }
  }

  // Display accounts not in actual
  const notInActual = comparisonResults.filter(r => r.status === 'NOT_IN_ACTUAL');
  if (notInActual.length > 0) {
    console.log(`\n📋 ACCOUNTS IN EXPECTED BUT NOT IN ACTUAL (${notInActual.length} accounts):`);
    notInActual.slice(0, 5).forEach((result: any, idx) => {
      console.log(`   ${idx + 1}. ${result.accountCode} - ${result.accountName}`);
    });
    if (notInActual.length > 5) {
      console.log(`   ... and ${notInActual.length - 5} more`);
    }
  }
  
  // Summary
  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  
  console.log('\n================================================================================');
  console.log('📊 COMPARISON SUMMARY');
  console.log('================================================================================');
  console.log(`Total Accounts in Actual Report: ${actualResult.accounts.length}`);
  console.log(`Total Accounts in Expected Excel: ${expectedAccounts.length}`);
  console.log(`✅ Perfect Matches: ${perfectMatches}`);
  console.log(`⚠️  Mismatches: ${mismatches}`);
  console.log(`❓ Not Found in Expected: ${notFoundInExpected}`);
  console.log(`❓ Not Found in Actual: ${notFoundInActual}`);
  
  const totalCompared = perfectMatches + mismatches;
  const matchRate = totalCompared > 0 
    ? ((perfectMatches / totalCompared) * 100).toFixed(2) 
    : 0;
  console.log(`📊 Match Rate: ${matchRate}%`);
  console.log(`⏱️  Total Execution Time: ${duration}s`);
  console.log('================================================================================');
  
  if (perfectMatches === expectedAccounts.length && notFoundInExpected === 0 && notFoundInActual === 0) {
    console.log('🎉 SUCCESS: All accounts match perfectly with expected results!');
  } else if (mismatches === 0) {
    console.log('✅ All compared accounts match, but some accounts are missing from one source');
  } else {
    console.log('⚠️  WARNING: Some accounts do not match the expected results');
  }
  
  // Save detailed comparison to JSON file
  const reportPath = path.join(process.cwd(), 'tmp49D6-comparison-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalActual: actualResult.accounts.length,
      totalExpected: expectedAccounts.length,
      perfectMatches,
      mismatches,
      notFoundInExpected,
      notFoundInActual,
      matchRate: `${matchRate}%`
    },
    details: comparisonResults
  }, null, 2));
  
  console.log(`\n📄 Detailed comparison report saved to: ${reportPath}`);
  
  // Create Excel comparison file
  console.log('\n📊 Generating Excel comparison file...');
  
  // Prepare data for Excel
  const excelData = [];
  
  // Add summary sheet data
  excelData.push({
    'Summary': '',
    '': '',
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  excelData.push({
    'Summary': 'Total Accounts in Actual Report',
    '': actualResult.accounts.length,
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  excelData.push({
    'Summary': 'Total Accounts in Expected Excel',
    '': expectedAccounts.length,
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  excelData.push({
    'Summary': 'Perfect Matches',
    '': perfectMatches,
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  excelData.push({
    'Summary': 'Mismatches',
    '': mismatches,
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  excelData.push({
    'Summary': 'Match Rate',
    '': `${matchRate}%`,
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  excelData.push({
    'Summary': '',
    '': '',
    ' ': '',
    '  ': '',
    '   ': '',
    '    ': ''
  });
  
  // Create detailed comparison data
  const detailedData = [];
  
  for (const result of comparisonResults) {
    const row: any = {
      'Status': result.status,
      'Account Code': result.accountCode || '',
      'Account Name': result.accountName || ''
    };
    
    if (result.actual) {
      row['Actual ACAL'] = result.actual.acal;
      row['Actual ANLI'] = result.actual.anli;
      row['Actual TURC'] = result.actual.turc;
      row['Actual Total'] = result.actual.total;
    } else {
      row['Actual ACAL'] = '';
      row['Actual ANLI'] = '';
      row['Actual TURC'] = '';
      row['Actual Total'] = '';
    }
    
    if (result.expected) {
      row['Expected ACAL'] = result.expected.acal;
      row['Expected ANLI'] = result.expected.anli;
      row['Expected TURC'] = result.expected.turc;
      row['Expected Total'] = result.expected.total;
    } else {
      row['Expected ACAL'] = '';
      row['Expected ANLI'] = '';
      row['Expected TURC'] = '';
      row['Expected Total'] = '';
    }
    
    // Calculate differences
    if (result.actual && result.expected) {
      row['Diff ACAL'] = result.actual.acal - result.expected.acal;
      row['Diff ANLI'] = result.actual.anli - result.expected.anli;
      row['Diff TURC'] = result.actual.turc - result.expected.turc;
      row['Diff Total'] = result.actual.total - result.expected.total;
    } else {
      row['Diff ACAL'] = '';
      row['Diff ANLI'] = '';
      row['Diff TURC'] = '';
      row['Diff Total'] = '';
    }
    
    row['Differences'] = result.differences.map((d: any) => 
      typeof d === 'string' ? d : `${d.field}: Expected ${d.expected}, Got ${d.actual}`
    ).join('; ');
    
    detailedData.push(row);
  }
  
  // Create workbook with multiple sheets
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const wsSummary = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  
  // Detailed comparison sheet
  const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
  XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detailed Comparison');
  
  // Perfect matches sheet
  const perfectMatchData = detailedData.filter(r => r.Status === 'MATCH');
  if (perfectMatchData.length > 0) {
    const wsPerfect = XLSX.utils.json_to_sheet(perfectMatchData);
    XLSX.utils.book_append_sheet(wb, wsPerfect, 'Perfect Matches');
  }
  
  // Mismatches sheet
  const mismatchData = detailedData.filter(r => r.Status === 'MISMATCH');
  if (mismatchData.length > 0) {
    const wsMismatch = XLSX.utils.json_to_sheet(mismatchData);
    XLSX.utils.book_append_sheet(wb, wsMismatch, 'Mismatches');
  }
  
  // Not in expected sheet
  const notInExpectedData = detailedData.filter(r => r.Status === 'NOT_IN_EXPECTED');
  if (notInExpectedData.length > 0) {
    const wsNotExpected = XLSX.utils.json_to_sheet(notInExpectedData);
    XLSX.utils.book_append_sheet(wb, wsNotExpected, 'Not in Expected');
  }
  
  // Not in actual sheet
  const notInActualData = detailedData.filter(r => r.Status === 'NOT_IN_ACTUAL');
  if (notInActualData.length > 0) {
    const wsNotActual = XLSX.utils.json_to_sheet(notInActualData);
    XLSX.utils.book_append_sheet(wb, wsNotActual, 'Not in Actual');
  }
  
  // Create "Actual Results" sheet with clean format
  const actualResultsData = actualResult.accounts.map(acc => ({
    'Account Code': acc.accountCode || '',
    'Account Name': acc.account,
    'ACAL': acc.acalValue !== undefined ? acc.acalValue : acc.header1Value,
    'ANLI': acc.anliValue !== undefined ? acc.anliValue : acc.header2Value,
    'TURC': acc.turcValue !== undefined ? acc.turcValue : 0,
    'Total': acc.totalValue,
    'Calculated Total': acc.calculatedTotal,
    'Is Valid': acc.isValid ? 'Yes' : 'No'
  }));
  
  const wsActualResults = XLSX.utils.json_to_sheet(actualResultsData);
  XLSX.utils.book_append_sheet(wb, wsActualResults, 'Actual Results');
  
  // Save to data folder
  const excelOutputPath = path.join(process.cwd(), 'data', 'Actual_Results_Comparison.xlsx');
  XLSX.writeFile(wb, excelOutputPath);
  
  console.log(`✅ Excel comparison file saved to: ${excelOutputPath}`);
  console.log(`   Sheets created: Summary, Detailed Comparison, Perfect Matches, Mismatches, Actual Results`);
  
  // Test assertions
  expect(actualResult.accounts.length).toBeGreaterThan(0);
  expect(expectedAccounts.length).toBeGreaterThan(0);
  
  // Assert that we have a good match rate (at least 80%)
  if (totalCompared > 0) {
    const matchRateNum = (perfectMatches / totalCompared) * 100;
    console.log(`\n📊 Asserting match rate >= 80%: Current = ${matchRateNum.toFixed(2)}%`);
    expect(matchRateNum).toBeGreaterThanOrEqual(80);
  }
});
