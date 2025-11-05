const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'data', 'tmp49D6.xlsx');
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('='.repeat(80));
console.log('VERIFYING ACCOUNT CODE MATCHING IN tmp49D6.xlsx');
console.log('='.repeat(80));
console.log();

// Test case 1: Account 1110-100
console.log('Test Case 1: Account Code 1110-100');
console.log('-'.repeat(80));

// Find all rows with account 1110-100
const account1110Rows = data.filter(row => 
  row.Account && row.Account.toString().trim() === '1110-100'
);

console.log(`Found ${account1110Rows.length} rows with account code 1110-100:`);
console.log();

account1110Rows.forEach((row, index) => {
  console.log(`Row ${index + 1}:`);
  console.log(`  Account: ${row.Account}`);
  console.log(`  Name: ${row.__EMPTY || '(empty)'}`);
  console.log(`  Amount: ${row.Amount || '(empty)'}`);
  console.log();
});

// Now let's trace through the sections
console.log('='.repeat(80));
console.log('SECTION ANALYSIS');
console.log('='.repeat(80));
console.log();

let currentSection = 'UNKNOWN';
let acalSection = { start: -1, end: -1, accounts: [] };
let anliSection = { start: -1, end: -1, accounts: [] };
let turcSection = { start: -1, end: -1, accounts: [] };

data.forEach((row, index) => {
  const accountStr = row.Account ? row.Account.toString() : '';
  const nameStr = row.__EMPTY ? row.__EMPTY.toString() : '';
  
  // Detect section headers
  if (accountStr.includes('ACAL')) {
    currentSection = 'ACAL';
    acalSection.start = index;
    console.log(`Found ACAL section at row ${index + 1}: "${accountStr}"`);
  } else if (accountStr.includes('ANLI')) {
    if (acalSection.start >= 0 && acalSection.end === -1) {
      acalSection.end = index - 1;
    }
    currentSection = 'ANLI';
    anliSection.start = index;
    console.log(`Found ANLI section at row ${index + 1}: "${accountStr}"`);
  } else if (accountStr.includes('TURC')) {
    if (anliSection.start >= 0 && anliSection.end === -1) {
      anliSection.end = index - 1;
    }
    currentSection = 'TURC';
    turcSection.start = index;
    console.log(`Found TURC section at row ${index + 1}: "${accountStr}"`);
  }
  
  // Collect account data
  if (accountStr.match(/^\d{4}-\d{3}$/)) {
    const accountData = {
      code: accountStr,
      name: nameStr,
      value: row.Amount || 0,
      rowIndex: index + 1
    };
    
    if (currentSection === 'ACAL') {
      acalSection.accounts.push(accountData);
    } else if (currentSection === 'ANLI') {
      anliSection.accounts.push(accountData);
    } else if (currentSection === 'TURC') {
      turcSection.accounts.push(accountData);
    }
  }
});

// Set end for TURC section
if (turcSection.start >= 0) {
  turcSection.end = data.length - 1;
}

console.log();
console.log('Section Summary:');
console.log(`  ACAL: Rows ${acalSection.start + 1} to ${acalSection.end + 1}, ${acalSection.accounts.length} accounts`);
console.log(`  ANLI: Rows ${anliSection.start + 1} to ${anliSection.end + 1}, ${anliSection.accounts.length} accounts`);
console.log(`  TURC: Rows ${turcSection.start + 1} to ${turcSection.end + 1}, ${turcSection.accounts.length} accounts`);
console.log();

// Now find account 1110-100 in each section
console.log('='.repeat(80));
console.log('ACCOUNT 1110-100 IN EACH SECTION');
console.log('='.repeat(80));
console.log();

const acal1110 = acalSection.accounts.find(a => a.code === '1110-100');
const anli1110 = anliSection.accounts.find(a => a.code === '1110-100');
const turc1110 = turcSection.accounts.find(a => a.code === '1110-100');

console.log('ACAL Section:');
if (acal1110) {
  console.log(`  ✓ Found at row ${acal1110.rowIndex}`);
  console.log(`  Account: ${acal1110.code}`);
  console.log(`  Name: ${acal1110.name}`);
  console.log(`  Value: ${acal1110.value}`);
} else {
  console.log('  ✗ Not found');
}
console.log();

console.log('ANLI Section:');
if (anli1110) {
  console.log(`  ✓ Found at row ${anli1110.rowIndex}`);
  console.log(`  Account: ${anli1110.code}`);
  console.log(`  Name: ${anli1110.name}`);
  console.log(`  Value: ${anli1110.value}`);
} else {
  console.log('  ✗ Not found');
}
console.log();

console.log('TURC Section:');
if (turc1110) {
  console.log(`  ✓ Found at row ${turc1110.rowIndex}`);
  console.log(`  Account: ${turc1110.code}`);
  console.log(`  Name: ${turc1110.name}`);
  console.log(`  Value: ${turc1110.value}`);
} else {
  console.log('  ✗ Not found');
}
console.log();

// Summary for 1110-100
console.log('='.repeat(80));
console.log('EXPECTED VALUES FOR ACCOUNT 1110-100');
console.log('='.repeat(80));
console.log();
console.log('Account Code: 1110-100');
console.log(`Account Name: ${acal1110 ? acal1110.name : 'CASH ON HAND - INR'}`);
console.log(`ACAL Value: ${acal1110 ? acal1110.value : 0}`);
console.log(`ANLI Value: ${anli1110 ? anli1110.value : 0}`);
console.log(`TURC Value: ${turc1110 ? turc1110.value : 0}`);
console.log(`Total: ${(acal1110 ? acal1110.value : 0) + (anli1110 ? anli1110.value : 0) + (turc1110 ? turc1110.value : 0)}`);
console.log();

// Test a few more accounts
console.log('='.repeat(80));
console.log('TESTING MORE ACCOUNTS');
console.log('='.repeat(80));
console.log();

const testAccounts = ['1110-106', '1110-107', '2110-200'];

testAccounts.forEach(accountCode => {
  const acalAcc = acalSection.accounts.find(a => a.code === accountCode);
  const anliAcc = anliSection.accounts.find(a => a.code === accountCode);
  const turcAcc = turcSection.accounts.find(a => a.code === accountCode);
  
  console.log(`Account: ${accountCode}`);
  console.log(`  ACAL: ${acalAcc ? acalAcc.value : 0}`);
  console.log(`  ANLI: ${anliAcc ? anliAcc.value : 0}`);
  console.log(`  TURC: ${turcAcc ? turcAcc.value : 0}`);
  console.log(`  Total: ${(acalAcc ? acalAcc.value : 0) + (anliAcc ? anliAcc.value : 0) + (turcAcc ? turcAcc.value : 0)}`);
  console.log();
});
