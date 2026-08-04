'use client';

import type { PayrollEntry } from '@/lib/types';

function fmtRWF(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' RWF';
}

export function PayrollSummary({ entries, period }: { entries: PayrollEntry[]; period: string }) {
  if (entries.length === 0) {
    return <div className="text-sm text-faint py-4">No entries for {period}.</div>;
  }

  let totalGross = 0;
  let totalBonuses = 0;
  let totalLoans = 0;
  let totalAdvances = 0;
  let totalPaye = 0;
  let totalPensionEmployee = 0;
  let totalPensionEmployer = 0;
  let totalMaternityEmployee = 0;
  let totalMaternityEmployer = 0;
  let totalCbhi = 0;
  let totalNet = 0;

  const employeeMap = new Map<number, { earnings: number; deductions: number }>();

  entries.forEach((e) => {
    switch (e.category) {
      case 'base_salary':
        if (e.direction === 'earning') totalGross += e.amount;
        break;
      case 'bonus':
        if (e.direction === 'earning') totalBonuses += e.amount;
        break;
      case 'loan':
        if (e.direction === 'deduction') totalLoans += e.amount;
        break;
      case 'advance':
        if (e.direction === 'deduction') totalAdvances += e.amount;
        break;
      case 'rssb_paye':
        if (e.direction === 'deduction') totalPaye += e.amount;
        break;
      case 'rssb_pension':
        if (e.direction === 'deduction') totalPensionEmployee += e.amount;
        break;
      case 'rssb_pension_employer':
        if (e.direction === 'employer_cost') totalPensionEmployer += e.amount;
        break;
      case 'rssb_maternity':
        if (e.direction === 'deduction') totalMaternityEmployee += e.amount;
        break;
      case 'rssb_maternity_employer':
        if (e.direction === 'employer_cost') totalMaternityEmployer += e.amount;
        break;
      case 'rssb_mutuelle':
        if (e.direction === 'deduction') totalCbhi += e.amount;
        break;
      default:
        break;
    }

    if (!employeeMap.has(e.employeeId)) {
      employeeMap.set(e.employeeId, { earnings: 0, deductions: 0 });
    }
    const emp = employeeMap.get(e.employeeId)!;
    if (e.direction === 'earning') emp.earnings += e.amount;
    else if (e.direction === 'deduction') emp.deductions += e.amount;
  });

  for (const [, { earnings, deductions }] of employeeMap) {
    totalNet += (earnings - deductions);
  }

  const totalPension = totalPensionEmployee + totalPensionEmployer;
  const totalMaternity = totalMaternityEmployee + totalMaternityEmployer;

  const summaryData = [
    { label: 'Total Gross', value: totalGross, color: 'text-gold' },
    { label: 'Total Bonuses', value: totalBonuses, color: 'text-success' },
    { label: 'Total Loans', value: totalLoans, color: 'text-danger' },
    { label: 'Total Advances', value: totalAdvances, color: 'text-danger' },
    { label: 'Total PAYE (Tax)', value: totalPaye, color: 'text-danger' },
    { label: 'Total Pension (Emp + Emp)', value: totalPension, color: 'text-muted' },
    { label: 'Total Maternity (Emp + Emp)', value: totalMaternity, color: 'text-muted' },
    { label: 'Total CBHI', value: totalCbhi, color: 'text-muted' },
    { label: 'Total Net Pay', value: totalNet, color: 'text-gold font-bold' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-4">
      <div className="font-mono text-[10.5px] uppercase tracking-wide text-faint mb-3">
        Payroll Summary – {period}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {summaryData.map((item) => (
          <div key={item.label} className="bg-surface-alt border border-border-soft rounded-lg px-3 py-2">
            <div className="text-[10.5px] text-faint font-mono uppercase tracking-wide">
              {item.label}
            </div>
            <div className={`text-[15px] font-display font-semibold ${item.color}`}>
              {fmtRWF(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}