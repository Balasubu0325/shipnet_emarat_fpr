import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.join(process.cwd(), 'data', 'expected_results.xlsx');
console.log('Reading:', excelPath);

const workbook = XLSX.readFile(excelPath);
console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  console.log(`Rows: ${jsonData.length}`);
  
  if (jsonData.length > 0) {
    console.log('First row keys:', Object.keys(jsonData[0] as any));
    console.log('First 3 rows:');
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
  }
});
