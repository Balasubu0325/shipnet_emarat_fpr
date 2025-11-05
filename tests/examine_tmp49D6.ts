import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.join(process.cwd(), 'data', 'tmp49D6.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 });

console.log('First 30 rows of Excel:');
jsonData.slice(0, 30).forEach((row: any, idx: number) => {
  console.log(`Row ${idx}: ${JSON.stringify(row)}`);
});
