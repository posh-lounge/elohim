import ExcelJS from 'exceljs';
import type { PayrollEntry } from '@/lib/types';

/**
 * Rebuilds the RSSB / PAYE split columns from gross salary, matching the
 * layout of the "AUGUST PAYROLL 2026" / "june_payroll" sheets.
 *
 * NOTE: this recomputes PAYE, pension, and maternity contributions from
 * gross salary rather than reading rssb_* entries directly, since the
 * template needs a finer column split (EYEE-6% / EYER-6% / EYER-2% / etc.)
 * than a single stored rssb_pension_employer figure gives us.
 * If your RSSB rates ever change, update the constants below.
 */

const PENSION_EYEE_RATE = 0.06;
const PENSION_EYER_RATE = 0.06;
const PENSION_EYER_EXTRA_RATE = 0.02; // the extra 2% employer pays on top
const MATERNITY_EYEE_RATE = 0.003;
const MATERNITY_EYER_RATE = 0.003;
const CBHI_RATE = 0.005;

function calculatePAYE(gross: number): number {
  let tax = 0;
  if (gross > 200000) {
    tax += (gross - 200000) * 0.3;
    gross = 200000;
  }
  if (gross > 100000) {
    tax += (gross - 100000) * 0.2;
    gross = 100000;
  }
  if (gross > 60000) {
    tax += (gross - 60000) * 0.1;
  }
  return tax;
}

interface EmployeeRow {
  name: string;
  basicSalary: number;
  housingAllowance: number;
}

const HEADERS = [
  'NAMES',
  'Basic salary',
  'housing allowance',
  'Gross Salary',
  'PAYE',
  'EYEE-6%',
  'EYER-6%',
  'EYER-2%',
  'TOT-8%',
  'TOT-14%',
  'EYEE-0.3%',
  'EYER-0.3%',
  'EYER-0.6%',
  'TOT -deductions',
  'NET SALARY B4 CBHI',
  'CBHI-0.5%',
  'Net Salary after CBHI',
  'Advance(loan)',
  'Take home',
];

function monthYearLabel(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}

function buildEmployeeRows(entries: PayrollEntry[]): EmployeeRow[] {
  const byEmployee = new Map<number, { name: string; entries: PayrollEntry[] }>();
  entries.forEach((e) => {
    if (!byEmployee.has(e.employeeId)) {
      byEmployee.set(e.employeeId, { name: e.employeeName, entries: [] });
    }
    byEmployee.get(e.employeeId)!.entries.push(e);
  });

  const rows: EmployeeRow[] = [];
  byEmployee.forEach(({ name, entries }) => {
    const basicSalary = entries
      .filter((e) => e.category === 'base_salary')
      .reduce((sum, e) => sum + e.amount, 0);

    // Anything else that's an "earning" (bonus, other) gets folded into the
    // housing-allowance column so Gross Salary still equals total earnings.
    const housingAllowance = entries
      .filter((e) => e.direction === 'earning' && e.category !== 'base_salary')
      .reduce((sum, e) => sum + e.amount, 0);

    rows.push({ name, basicSalary, housingAllowance });
  });

  return rows;
}

function getAdvanceForEmployee(entries: PayrollEntry[], employeeName: string): number {
  return entries
    .filter((e) => e.employeeName === employeeName && ['loan', 'advance'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
}

export async function exportPayrollToExcel(entries: PayrollEntry[], period: string): Promise<void> {
  const employeeRows = buildEmployeeRows(entries);
  const title = `${monthYearLabel(period)} PAYROLL`;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Payroll');

  // Row 1: title
  sheet.mergeCells('A1:S1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14 };

  // Row 2: PENSION / MATERNITY section labels
  sheet.mergeCells('F2:J2');
  sheet.getCell('F2').value = 'PENSION';
  sheet.getCell('F2').font = { bold: true };
  sheet.getCell('F2').alignment = { horizontal: 'center' };

  sheet.mergeCells('K2:M2');
  sheet.getCell('K2').value = 'MATERNITY';
  sheet.getCell('K2').font = { bold: true };
  sheet.getCell('K2').alignment = { horizontal: 'center' };

  // Row 3: column headers
  const headerRow = sheet.getRow(3);
  headerRow.values = HEADERS;
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', wrapText: true };

  // Totals accumulator, keyed by column (skip name column)
  const totals = new Array(HEADERS.length - 1).fill(0);

  let rowIndex = 4;
  for (const emp of employeeRows) {
    const grossSalary = emp.basicSalary + emp.housingAllowance;

    const paye = calculatePAYE(grossSalary);

    const pensionEyee = grossSalary * PENSION_EYEE_RATE;
    const pensionEyer = grossSalary * PENSION_EYER_RATE;
    const pensionEyerExtra = grossSalary * PENSION_EYER_EXTRA_RATE;
    const pensionTot8 = pensionEyer + pensionEyerExtra;
    const pensionTot14 = pensionTot8 + pensionEyee;

    const maternityEyee = grossSalary * MATERNITY_EYEE_RATE;
    const maternityEyer = grossSalary * MATERNITY_EYER_RATE;
    const maternityTot = maternityEyee + maternityEyer;

    const totalDeductions = paye + pensionEyee + maternityEyee;
    const netBeforeCbhi = grossSalary - totalDeductions;
    const cbhi = netBeforeCbhi * CBHI_RATE;
    const netAfterCbhi = netBeforeCbhi - cbhi;

    const advance = getAdvanceForEmployee(entries, emp.name);
    const takeHome = netAfterCbhi - advance;

    const rowValues = [
      emp.name,
      emp.basicSalary,
      emp.housingAllowance,
      grossSalary,
      paye,
      pensionEyee,
      pensionEyer,
      pensionEyerExtra,
      pensionTot8,
      pensionTot14,
      maternityEyee,
      maternityEyer,
      maternityTot,
      totalDeductions,
      netBeforeCbhi,
      cbhi,
      netAfterCbhi,
      advance,
      takeHome,
    ];

    sheet.getRow(rowIndex).values = rowValues;

    // Accumulate totals (skip index 0, the name column)
    for (let i = 1; i < rowValues.length; i++) {
      totals[i - 1] += rowValues[i] as number;
    }

    rowIndex++;
  }

  // Totals row
  const totalsRow = sheet.getRow(rowIndex);
  totalsRow.values = ['Total', ...totals];
  totalsRow.font = { bold: true };

  // Column widths
  sheet.getColumn(1).width = 24;
  for (let col = 2; col <= HEADERS.length; col++) {
    sheet.getColumn(col).width = 14;
  }

  // Number formatting for all numeric cells
  for (let r = 4; r <= rowIndex; r++) {
    for (let c = 2; c <= HEADERS.length; c++) {
      sheet.getCell(r, c).numFmt = '#,##0.00';
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payroll-${period}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
