'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Printer, Wallet, CheckCircle2, X, Loader2,
  User, Calendar, DollarSign, Package, AlertTriangle,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  useInvoiceDetail,
  useUpdateInvoiceStatus,
  useRecordPayment,
  printInvoicePdf,
} from '@/hooks/useInvoices';
import type { PaymentMode } from '@/lib/types';

function fmtMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 2,
    }).format(n);
  } catch { return `${n.toLocaleString()} ${currency}`; }
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function InvoiceDetailPage() {
  const { invId } = useParams<{ invId: string }>();
  const router = useRouter();

  const { data, isLoading, isError, error } = useInvoiceDetail(invId);
  const updateStatus = useUpdateInvoiceStatus();
  const recordPayment = useRecordPayment();

  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [mode, setMode] = useState<PaymentMode>('Cash');

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <Skeleton width={220} height={20} baseColor="#0d1120" highlightColor="#1a2035" />
        <Skeleton height={120} baseColor="#0d1120" highlightColor="#1a2035" />
        <Skeleton height={300} baseColor="#0d1120" highlightColor="#1a2035" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle size={36} className="mx-auto text-rose-400 mb-3" />
        <p className="text-slate-300 mb-2">Failed to load invoice</p>
        <p className="text-slate-500 text-xs mb-4">{error?.message}</p>
        <Link href="/invoices" className="text-gold text-sm hover:underline">
          ← Back to invoices
        </Link>
      </div>
    );
  }

  const { invoice, products, payments } = data;
  const isDraft = invoice.status === 'Draft';
  const isUnpaid = invoice.status === 'Unpaid';
  const isPaid = invoice.status === 'Paid';
  const canPay = isUnpaid && invoice.balanceAmount > 0;

  const submitPayment = () => {
    if (amount <= 0) return;
    if (amount > invoice.balanceAmount) return;
    recordPayment.mutate(
      { invId: invoice.invId, amount, paymentMode: mode },
      { onSuccess: () => { setShowPayment(false); setAmount(0); } },
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-lg border border-[#1a2035] text-slate-400 hover:text-white hover:border-slate-600 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">Invoice {invoice.invId}</h1>
            <p className="text-xs text-slate-500">{invoice.clientName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDraft && (
            <button
              onClick={() => updateStatus.mutate({ invId: invoice.invId, status: 'Unpaid' })}
              disabled={updateStatus.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/90 text-white text-xs font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {updateStatus.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Approve
            </button>
          )}
          {canPay && (
            <button
              onClick={() => setShowPayment(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold text-[#1A1408] text-xs font-bold hover:bg-gold/90 transition"
            >
              <Wallet size={13} /> Record payment
            </button>
          )}
          {isDraft && (
            <button
              onClick={() => printInvoicePdf(invoice.invId, 'proforma')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1a2035] text-slate-300 text-xs hover:bg-[#1a2035] transition"
            >
              <Printer size={13} /> Proforma
            </button>
          )}
          {isUnpaid && (
            <button
              onClick={() => printInvoicePdf(invoice.invId, 'invoice')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1a2035] text-slate-300 text-xs hover:bg-[#1a2035] transition"
            >
              <Printer size={13} /> Invoice PDF
            </button>
          )}
          {isPaid && (
            <button
              onClick={() => printInvoicePdf(invoice.invId, 'receipt')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1a2035] text-slate-300 text-xs hover:bg-[#1a2035] transition"
            >
              <Printer size={13} /> Receipt
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: meta */}
        <div className="space-y-4">
          <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={14} className="text-gold" /> Summary
            </h2>
            <Row icon={<DollarSign size={13} />} label="Grand total" value={fmtMoney(invoice.grandTotal, invoice.currency)} />
            <Row icon={<DollarSign size={13} />} label="Paid" value={fmtMoney(invoice.paidAmount, invoice.currency)} tone="text-emerald-400" />
            <Row icon={<DollarSign size={13} />} label="Balance" value={fmtMoney(invoice.balanceAmount, invoice.currency)} tone={invoice.balanceAmount > 0 ? 'text-rose-400' : 'text-emerald-400'} />
            <Row icon={<Calendar size={13} />} label="Issued" value={fmtDate(invoice.created_date)} />
            <Row icon={<Calendar size={13} />} label="Due" value={fmtDate(invoice.duedate)} />
          </div>

          <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <User size={14} className="text-gold" /> Client
            </h2>
            <p className="text-white text-sm font-medium">{invoice.clientName}</p>
            <p className="text-slate-400 text-xs mt-1 whitespace-pre-wrap">{invoice.clientDetails}</p>
          </div>

          {payments.length > 0 && (
            <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Payment history</h2>
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-300">{p.payment_mode}</p>
                      <p className="text-slate-600">{fmtDate(p.payment_date)}</p>
                    </div>
                    <p className="text-emerald-400 font-medium">
                      {fmtMoney(p.payment_amount, invoice.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: products */}
        <div className="lg:col-span-2 bg-[#0d1120] border border-[#1a2035] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a2035] flex items-center gap-2">
            <Package size={14} className="text-gold" />
            <h2 className="text-sm font-semibold text-white">Line items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[#080c18] text-left text-slate-500 font-mono text-[10.5px] uppercase tracking-wide">
                  <th className="px-4 py-2.5 font-semibold">#</th>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Qty</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Unit</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="border-t border-[#1a2035]">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-200">{p.product_name}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{p.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {fmtMoney(p.price, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-100 font-medium">
                      {fmtMoney(p.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#080c18] border-t border-[#1a2035]">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-right text-xs text-slate-500">Subtotal</td>
                  <td className="px-4 py-2.5 text-right text-slate-200 text-sm">
                    {fmtMoney(invoice.subTotal, invoice.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-right text-xs text-slate-500">VAT</td>
                  <td className="px-4 py-2.5 text-right text-slate-200 text-sm">
                    {fmtMoney(invoice.vat, invoice.currency)}
                  </td>
                </tr>
                <tr className="border-t border-[#1a2035]">
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gold">Grand total</td>
                  <td className="px-4 py-3 text-right text-base font-bold text-gold">
                    {fmtMoney(invoice.grandTotal, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setShowPayment(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl w-full max-w-md p-6 pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Record payment</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a2035]"
                >
                  <X size={15} />
                </button>
              </div>

              <label className="block text-[11px] uppercase tracking-wide text-slate-500 font-mono mb-1.5">
                Amount ({invoice.currency})
              </label>
              <input
                type="number"
                min={0}
                max={invoice.balanceAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080c18] border border-[#1a2035] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-gold"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Balance due: {fmtMoney(invoice.balanceAmount, invoice.currency)}
              </p>

              <label className="block text-[11px] uppercase tracking-wide text-slate-500 font-mono mb-1.5 mt-4">
                Payment mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as PaymentMode)}
                className="w-full bg-[#080c18] border border-[#1a2035] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-gold"
              >
                {(['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Credit Card'] as PaymentMode[]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowPayment(false)}
                  className="px-4 py-2 rounded-lg border border-[#1a2035] text-slate-400 text-sm hover:bg-[#1a2035]"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPayment}
                  disabled={recordPayment.isPending || amount <= 0 || amount > invoice.balanceAmount}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-[#1A1408] text-sm font-bold hover:bg-gold/90 disabled:opacity-50"
                >
                  {recordPayment.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  icon, label, value, tone = 'text-slate-200',
}: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a2035]/50 last:border-0">
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        {icon}
        {label}
      </div>
      <span className={`text-sm font-medium ${tone}`}>{value}</span>
    </div>
  );
}