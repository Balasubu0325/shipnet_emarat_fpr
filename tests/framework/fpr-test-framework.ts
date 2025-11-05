
import { Page, expect } from '@playwright/test';

export interface TestConfig {
  baseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  timeout: number;
}

export interface AccountRow {
  rowNumber: number;
  account: string;
  description?: string;
  header1Value: number;
  header2Value: number;
  totalValue: number;
  calculatedTotal: number;
  isValid: boolean;
  errorMessage?: string;
  // Extended fields for multi-company reports
  acalValue?: number;
  anliValue?: number;
  turcValue?: number;
  accountCode?: string;
}

export interface ReportValidationResult {
  reportType: string;
  totalRowsProcessed: number;
  validAccountRows: number;
  passedCalculations: number;
  failedCalculations: number;
  successRate: number;
  accounts: AccountRow[];
  executionTime: number;
  timestamp: string;
}

export interface TestSummary {
  testName: string;
  reports: ReportValidationResult[];
  overallStats: {
    totalAccounts: number;
    totalPassed: number;
    totalFailed: number;
    overallSuccessRate: number;
  };
  executionDetails: {
    startTime: string;
    endTime: string;
    totalDuration: number;
  };
}

export class FPRTestFramework {
  private page: Page;
  private config: TestConfig;

  constructor(page: Page, config: TestConfig) {
    this.page = page;
    this.config = config;
  }

  async login(): Promise<void> {
    await this.page.goto(this.config.baseUrl);
    await this.page.getByRole('textbox', { name: 'Enter Username' }).fill(this.config.credentials.username);
    await this.page.getByRole('textbox', { name: 'Enter Password' }).fill(this.config.credentials.password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToFPR(): Promise<void> {
    console.log('🔄 Navigating to FPR module...');
    
    const fprNavLink = this.page.getByRole('link', { name: /\bFPR\s*$/ });
    await expect(fprNavLink.first()).toBeVisible({ timeout: 20000 });
    await fprNavLink.first().click({ timeout: 20000 });
    await this.page.waitForLoadState('networkidle');
  }

  async selectTemplate(templateName: string): Promise<void> {
    console.log(`📋 Selecting template: ${templateName}`);
    
    await this.page.mouse.move(960, 540);
    await this.page.waitForTimeout(5000);

    // Open dropdown with multiple strategies
    const opened = await this.openTemplateDropdown();
    expect(opened, 'Could not open the Report Template dropdown').toBeTruthy();

    // Type and select template
    const searchInput = this.page.locator('xpath=//label[contains(normalize-space(.),"Report Template")]//following::input[@type="text"][1]');
    if (await searchInput.count()) {
      await searchInput.first().fill(templateName);
    } else {
      await this.page.locator('input[type="text"]:visible').first().fill(templateName);
    }
    await this.page.waitForTimeout(1000);

    // Select option
    const optExact = this.page.getByRole('option', { name: new RegExp(`^${templateName}$`) });
    const optAny = this.page.getByRole('option', { name: new RegExp(templateName, 'i') });
    
    if (await optExact.count()) {
      await optExact.first().click({ timeout: 10000 });
    } else if (await optAny.count()) {
      await optAny.first().click({ timeout: 10000 });
    } else {
      await this.page.keyboard.press('Enter');
    }
    
    await this.page.waitForTimeout(1000);
  }

  private async openTemplateDropdown(): Promise<boolean> {
    // Strategy 1: role + name
    const comboByRole = this.page.getByRole('combobox', { name: /report template/i });
    if (await comboByRole.count()) {
      try {
        await comboByRole.first().click({ timeout: 5000 });
        return true;
      } catch {}
    }

    // Strategy 2: relative to label using XPath
    const inputNear = this.page.locator('xpath=//label[contains(normalize-space(.),"Report Template")]//following::input[@type="text"][1]');
    if (await inputNear.count()) {
      try {
        await inputNear.first().click({ timeout: 5000 });
        return true;
      } catch {}
    }

    return false;
  }

  async selectReportType(reportType: 'FPR' | 'Balance Sheet' | 'Profit & Loss'): Promise<void> {
    if (reportType !== 'FPR') {
      console.log(`📊 Selecting report type: ${reportType}`);
      await this.page.getByLabel(reportType).check();
    }
  }

  async generateReport(): Promise<void> {
    console.log('⚙️ Generating report...');
    await this.page.getByRole('button', { name: /Generate/i }).click();
    
    // Enhanced wait for report generation
    await this.page.waitForTimeout(8000);
    
    // Wait for loading indicators to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], .loading, .spinner');
      return loadingElements.length === 0 || Array.from(loadingElements).every(el => 
        getComputedStyle(el).display === 'none' || !(el as HTMLElement).offsetParent
      );
    }, { timeout: 60000 });
    
    // Wait for table with actual data
    await this.page.waitForFunction(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      return tables.some(t => {
        const rows = t.querySelectorAll('tbody tr, tr');
        if (rows.length > 1) {
          const dataRows = Array.from(rows).slice(1);
          return dataRows.some(row => {
            const cells = row.querySelectorAll('td, th');
            return Array.from(cells).some(cell => 
              cell.textContent && cell.textContent.trim().length > 0
            );
          });
        }
        return false;
      });
    }, { timeout: 90000 });
    
    await this.page.waitForTimeout(3000);
  }

  async validateReport(reportType: string): Promise<ReportValidationResult> {
    console.log(`🔍 Validating ${reportType} report calculations...`);
    const startTime = Date.now();

    const parseNumber = (text: string): number => {
      const cleaned = text
        .replace(/,/g, '')
        .replace(/\s+/g, '')
        .replace(/[$£€]/g, '')
        .replace(/^-$|^–$/, '0');
      if (!cleaned) return 0;
      if (/^\(.*\)$/.test(cleaned)) return -parseFloat(cleaned.slice(1, -1));
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    // Find table with correct structure
    const tables = await this.page.locator('table').all();
    let bestTable: any = null;
    
    for (const table of tables) {
      const headerCells = table.locator('thead th, thead td, tr:first-child th, tr:first-child td');
      const headers = (await headerCells.allInnerTexts()).map((h: string) => h.trim());
      
      if (headers.length > 5) {
        bestTable = table;
        break;
      }
    }

    expect(bestTable, 'Could not locate suitable table with data').toBeTruthy();

    const dataRows = await bestTable.locator('tbody tr, tr:not(:first-child)').all();
    const accounts: AccountRow[] = [];
    let passedCalculations = 0;
    let failedCalculations = 0;
    
    // Detect column mapping based on headers
    const headerCells = bestTable.locator('thead th, thead td, tr:first-child th, tr:first-child td');
    const headers = (await headerCells.allInnerTexts()).map((h: string) => h.trim().toUpperCase());
    
    // Find ACAL, ANLI, TURC, Total columns
    let accountCodeCol = -1, accountNameCol = -1, acalCol = -1, anliCol = -1, turcCol = -1, totalCol = -1;
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header.includes('ACCOUNT') && !header.includes('DESCRIPTION')) {
        accountCodeCol = i;
      } else if (header.includes('DESCRIPTION')) {
        accountNameCol = i;
      } else if (header.includes('ACAL') && header.includes('[')) {
        acalCol = i;
      } else if (header.includes('ANLI') && header.includes('[')) {
        anliCol = i;
      } else if (header.includes('TURC') && header.includes('[')) {
        turcCol = i;
      } else if (header.includes('TOTAL') && header.includes('[')) {
        totalCol = i;
      }
    }
    
    console.log(`📊 Column mapping (from headers): Account=${accountCodeCol}, Name=${accountNameCol}, ACAL=${acalCol}, ANLI=${anliCol}, TURC=${turcCol}, Total=${totalCol}`);
    
    // Check if there's an offset between header row and data rows
    // In some tables, header row has extra columns at the start
    const firstDataRow = dataRows.length > 0 ? dataRows[0] : null;
    let columnOffset = 0;
    
    if (firstDataRow && accountCodeCol >= 0) {
      const testCells = firstDataRow.locator('th, td');
      const testCount = await testCells.count();
      // If data row has fewer columns than header row, calculate offset
      if (testCount < headers.length && accountCodeCol >= 2) {
        columnOffset = accountCodeCol - 0; // Assuming account code should be at column 0 in data rows
        console.log(`📊 Detected column offset: ${columnOffset} (headers have ${headers.length} cols, data has ${testCount} cols)`);
      }
    }
    
    // Apply offset to all column indices
    if (columnOffset > 0) {
      if (accountCodeCol >= 0) accountCodeCol -= columnOffset;
      if (accountNameCol >= 0) accountNameCol -= columnOffset;
      if (acalCol >= 0) acalCol -= columnOffset;
      if (anliCol >= 0) anliCol -= columnOffset;
      if (turcCol >= 0) turcCol -= columnOffset;
      if (totalCol >= 0) totalCol -= columnOffset;
    }
    
    console.log(`📊 Adjusted column mapping: Account=${accountCodeCol}, Name=${accountNameCol}, ACAL=${acalCol}, ANLI=${anliCol}, TURC=${turcCol}, Total=${totalCol}`);
    
    // Fallback to old mapping if new columns not found
    const useMultiCompany = acalCol >= 0 && anliCol >= 0 && turcCol >= 0;
    const headerMap = useMultiCompany 
      ? { accountCode: accountCodeCol, accountName: accountNameCol, acal: acalCol, anli: anliCol, turc: turcCol, total: totalCol }
      : { account: 1, h1: 3, h2: 4, total: 5 };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const cells = row.locator('th, td');
      const cellCount = await cells.count();
      
      if (!useMultiCompany) {
        const hmap = headerMap as any;
        const maxNeededIndex = Math.max(hmap.account || 1, hmap.h1 || 3, hmap.h2 || 4, hmap.total || 5);
        if (cellCount <= maxNeededIndex) continue;
      }

      const getCellText = async (zeroIdx: number) => {
        if (zeroIdx < 0 || zeroIdx >= cellCount) return '';
        return (await cells.nth(zeroIdx).innerText()).trim();
      };

      let accountVal = '', accountCode = '', h1Text = '', h2Text = '', totalText = '';
      let acalText = '', anliText = '', turcText = '';
      let h1 = 0, h2 = 0, total = 0, calculatedTotal = 0;
      let acal = 0, anli = 0, turc = 0;
      
      if (useMultiCompany) {
        // New multi-company format
        accountCode = await getCellText(headerMap.accountCode || 0);
        accountVal = await getCellText(headerMap.accountName || 0);
        acalText = await getCellText(headerMap.acal || 0);
        anliText = await getCellText(headerMap.anli || 0);
        turcText = await getCellText(headerMap.turc || 0);
        totalText = await getCellText(headerMap.total || 0);
        
        // Skip headers, summaries, or empty rows
        if (accountCode.toLowerCase().includes('account') ||
            accountCode.toLowerCase().includes('sum') ||
            accountCode.includes('[') || // Skip header rows with brackets
            accountCode.match(/^\d+$/) || // Skip pure number rows (likely data from wrong column)
            totalText.toLowerCase().includes('total') ||
            accountVal.toLowerCase().includes('description') ||
            accountVal.toLowerCase().includes('acal') ||
            accountVal.toLowerCase().includes('anli') ||
            accountVal.toLowerCase().includes('turc') ||
            accountVal.includes('[')) { // Skip column header rows
          continue;
        }
        
        acal = parseNumber(acalText);
        anli = parseNumber(anliText);
        turc = parseNumber(turcText);
        total = parseNumber(totalText);
        calculatedTotal = acal + anli + turc;
        
        // For backward compatibility, map to h1/h2
        h1 = acal;
        h2 = anli;
        
      } else {
        // Old format
        accountVal = await getCellText((headerMap as any).account || 1);
        h1Text = await getCellText((headerMap as any).h1 || 3);
        h2Text = await getCellText((headerMap as any).h2 || 4);
        totalText = await getCellText((headerMap as any).total || 5);
        
        // Skip headers, summaries, or empty rows
        if (h1Text.toLowerCase().includes('header') || 
            totalText.toLowerCase().includes('total') ||
            h1Text.toLowerCase().includes('sum:') ||
            accountVal.toLowerCase().includes('sum')) {
          continue;
        }
        
        h1 = parseNumber(h1Text);
        h2 = parseNumber(h2Text);
        total = parseNumber(totalText);
        calculatedTotal = h1 + h2;
      }
      
      // Skip rows where all values are NaN or empty
      if (Number.isNaN(total) && Number.isNaN(calculatedTotal)) continue;

      const tolerance = 0.01;
      const isValid = Math.abs(total - calculatedTotal) <= tolerance;
      
      if (isValid) {
        passedCalculations++;
      } else {
        failedCalculations++;
      }

      const accountRow: AccountRow = {
        rowNumber: i + 1,
        account: accountVal,
        header1Value: h1,
        header2Value: h2,
        totalValue: total,
        calculatedTotal: calculatedTotal,
        isValid: isValid,
        errorMessage: !isValid ? `Expected: ${calculatedTotal}, Actual: ${total}` : undefined,
        // Add extended fields for multi-company
        ...(useMultiCompany && {
          accountCode: accountCode,
          acalValue: acal,
          anliValue: anli,
          turcValue: turc
        })
      };

      accounts.push(accountRow);
    }

    const executionTime = Date.now() - startTime;
    const totalValidRows = passedCalculations + failedCalculations;
    
    return {
      reportType,
      totalRowsProcessed: dataRows.length,
      validAccountRows: totalValidRows,
      passedCalculations,
      failedCalculations,
      successRate: totalValidRows > 0 ? (passedCalculations / totalValidRows) * 100 : 0,
      accounts,
      executionTime,
      timestamp: new Date().toISOString()
    };
  }

  async captureScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ path: filename, fullPage: true });
  }
}