'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText, Search, Plus, Loader2, ChevronDown,
  CheckCircle2, Clock, AlertTriangle, Wallet,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useInvoices } from '@/hooks/useInvoices';
import type { Invoice } from '@/lib/types';

function fmtMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toLocaleString()} ${currency}`;
  }
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function StatusPill({ status }: { status: Invoice['status'] }) {
  const map = {
    Draft:     'text-slate-400 border-slate-500/30 bg-slate-500/10',
    Unpaid:    'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Paid:      'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Cancelled: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  } as const;
  const icon = {
    Draft:     <FileText size={11} />,
    Unpaid:    <Clock size={11} />,
    Paid:      <CheckCircle2 size={11} />,
    Cancelled: <AlertTriangle size={11} />,
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${map[status]}`}>
      {icon[status]}
      {status}
    </span>
  );
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<'All' | Invoice['status']>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useInvoices({
    status: statusFilter,
    search: search.trim() || undefined,
  });

  const invoices = data?.invoices ?? [];

  const stats = useMemo(() => {
    let overdue = 0, due30 = 0, paidCount = 0, totalPaidDays = 0, upcoming = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const future30 = new Date(today); future30.setDate(today.getDate() + 30);

    invoices.forEach((inv) => {
      const due = new Date(inv.duedate);
      if (inv.status === 'Unpaid' || inv.status === 'Draft') {
        if (due < today) overdue += inv.balanceAmount || inv.grandTotal;
        else if (due <= future30) due30 += inv.balanceAmount || inv.grandTotal;
        else upcoming += inv.balanceAmount || inv.grandTotal;
      }
      if (inv.status === 'Paid') {
        const created = new Date(inv.created_date);
        const days = Math.max(0, Math.round((due.getTime() - created.getTime()) / 86400000));
        totalPaidDays += days;
        paidCount++;
      }
    });

    return {
      overdue,
      due30,
      upcoming,
      avgDays: paidCount ? Math.round(totalPaidDays / paidCount) : 0,
    };
  }, [invoices]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track billing, payments, and approvals</p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-2 text-xs"
        >
          <Plus size={13} /> New invoice
        </Link>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-[#1a2035] overflow-hidden bg-[#0d1120]">
        {[
          { label: 'Overdue', value: fmtMoney(stats.overdue, 'RWF'), tone: 'text-rose-400' },
          { label: 'Due within 30 days', value: fmtMoney(stats.due30, 'RWF'), tone: 'text-amber-400' },
          { label: 'Avg time to payment', value: `${stats.avgDays} days`, tone: 'text-slate-300' },
          { label: 'Upcoming', value: fmtMoney(stats.upcoming, 'RWF'), tone: 'text-emerald-400' },
        ].map((card, i) => (
          <div
            key={card.label}
            className={`p-5 border-[#1a2035] ${
              i < 3 ? 'sm:border-r' : ''
            } ${i < 2 ? 'border-b sm:border-b-0' : ''}`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-mono mb-2">
              {card.label}
            </p>
            {isLoading ? (
              <Skeleton width={110} height={26} baseColor="#0d1120" highlightColor="#1a2035" />
            ) : (
              <p className={`text-2xl font-semibold ${card.tone}`}>{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#1a2035] bg-[#0d1120] rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          {(['All', 'Draft', 'Unpaid', 'Paid', 'Cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border capitalize transition ${
                statusFilter === s
                  ? 'border-gold bg-gold-soft text-primary'
                  : 'border-[#1a2035] text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invId or client…"
            className="bg-[#080c18] border border-[#1a2035] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-gold w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1a2035] bg-[#0d1120] rounded-2xl overflow-hidden">
        {isError ? (
          <div className="p-8 text-center text-rose-400 text-sm">
            Failed to load invoices: {error?.message}
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={42} baseColor="#0d1120" highlightColor="#1a2035" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[#080c18] text-left text-slate-500 font-mono text-[10.5px] uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Issued</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.invNo}
                    className="border-t border-[#1a2035] hover:bg-[#0f1428] transition"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.invId}`}
                        className="font-mono text-xs text-slate-200 hover:text-gold transition"
                      >
                        {inv.invId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{inv.clientName}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(inv.created_date)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(inv.duedate)}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {fmtMoney(inv.grandTotal, inv.currency)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <span className={inv.balanceAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {fmtMoney(inv.balanceAmount, inv.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={inv.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/invoices/${inv.invId}`}
                        className="text-[11px] px-2.5 py-1 rounded-md border border-[#1a2035] text-slate-400 hover:text-white hover:border-slate-600 transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}