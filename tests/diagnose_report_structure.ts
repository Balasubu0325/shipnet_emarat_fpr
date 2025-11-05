import { test, expect } from '@playwright/test';
import { FPRTestFramework, TestConfig } from './framework/fpr-test-framework';

test('Diagnose FPR Report Structure - Check Column Headers', async ({ page }) => {
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
  
  console.log('🔍 Diagnostic Test: Examining FPR Report Structure');
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  await framework.login();
  await framework.navigateToFPR();
  await framework.selectTemplate('Test QA2');
  await framework.generateReport();
  
  console.log('\n📋 Examining Report Table Structure...\n');
  
  // Find all tables
  const tables = await page.locator('table').all();
  console.log(`Found ${tables.length} tables on the page`);
  
  for (let tableIdx = 0; tableIdx < Math.min(tables.length, 3); tableIdx++) {
    console.log(`\n=== TABLE ${tableIdx + 1} ===`);
    const table = tables[tableIdx];
    
    // Get header row
    const headerCells = table.locator('thead th, thead td, tr:first-child th, tr:first-child td');
    const headerCount = await headerCells.count();
    console.log(`Header cells: ${headerCount}`);
    
    const headers = [];
    for (let i = 0; i < headerCount; i++) {
      const headerText = await headerCells.nth(i).innerText();
      headers.push(headerText.trim());
      console.log(`  Column ${i}: "${headerText.trim()}"`);
    }
    
    // Get first few data rows
    const dataRows = await table.locator('tbody tr, tr:not(:first-child)').all();
    console.log(`\nData rows: ${dataRows.length}`);
    console.log('\nFirst 5 data rows:');
    
    for (let rowIdx = 0; rowIdx < Math.min(5, dataRows.length); rowIdx++) {
      const row = dataRows[rowIdx];
      const cells = row.locator('th, td');
      const cellCount = await cells.count();
      
      const rowData = [];
      for (let cellIdx = 0; cellIdx < cellCount; cellIdx++) {
        const cellText = await cells.nth(cellIdx).innerText();
        rowData.push(cellText.trim());
      }
      
      console.log(`  Row ${rowIdx + 1}: ${JSON.stringify(rowData)}`);
    }
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'fpr-report-structure.png', fullPage: true });
  console.log('\n📸 Screenshot saved to: fpr-report-structure.png');
  
  // Check if there are any company column headers
  const pageContent = await page.content();
  const companyMatches = {
    acal: pageContent.match(/ACAL|APL CALIFORNIA/gi),
    anli: pageContent.match(/ANLI|ANL INTERNATIONAL/gi),
    turc: pageContent.match(/TURC|APL TURKEY/gi)
  };
  
  console.log('\n🏢 Company Name Occurrences in Page:');
  console.log(`  ACAL/APL CALIFORNIA: ${companyMatches.acal?.length || 0} occurrences`);
  console.log(`  ANLI/ANL INTERNATIONAL: ${companyMatches.anli?.length || 0} occurrences`);
  console.log(`  TURC/APL TURKEY: ${companyMatches.turc?.length || 0} occurrences`);
});
