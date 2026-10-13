'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Loader2, Eye, Save, X,
  User, Calendar, DollarSign, Package, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateInvoice } from '@/hooks/useInvoices';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: 'RWF', label: 'RWF — Rwandan Franc' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
];

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

function lineTotal(item: LineItem) {
  return item.price * item.quantity;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();

  // Form state
  const [currency, setCurrency] = useState('RWF');
  const [clientName, setClientName] = useState('');
  const [clientDetails, setClientDetails] = useState('');
  const [duedate, setDuedate] = useState('');

  // Line items
  const [items, setItems] = useState<LineItem[]>([]);

  // Inline product form
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pQty, setPQty] = useState<number>(1);

  // UI
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Totals
  const subTotal = useMemo(
    () => items.reduce((sum, i) => sum + lineTotal(i), 0),
    [items],
  );
  const vat = 0; // 18% VAT can be enabled here later
  const grandTotal = subTotal + vat;

  // ─── Add item ─────────────────────────────────────────────────────────────

  const addItem = () => {
    setError(null);
    if (!pName.trim()) return setError('Product name is required.');
    if (pPrice <= 0) return setError('Price must be greater than 0.');
    if (pQty < 1) return setError('Quantity must be at least 1.');

    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: pName.trim(),
        price: pPrice,
        quantity: pQty,
      },
    ]);
    setPName('');
    setPPrice(0);
    setPQty(1);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const submit = () => {
    setError(null);

    if (!clientName.trim()) return setError('Client name is required.');
    if (!clientDetails.trim()) return setError('Client details are required.');
    if (!duedate) return setError('Please pick a due date.');
    if (items.length === 0) return setError('Add at least one line item.');

    createInvoice.mutate(
      {
        currency,
        clientName: clientName.trim(),
        clientDetails: clientDetails.trim(),
        duedate,
        products: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subTotal,
        vat,
        grandTotal,
      },
      {
        onSuccess: (data) => {
          router.push(`/invoices/${data.invId}`);
        },
      },
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const fieldCls =
    'w-full bg-[#080c18] border border-[#1a2035] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-gold transition';
  const labelCls =
    'block font-mono text-[10.5px] uppercase tracking-wide text-slate-500 mb-1.5';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/invoices"
          className="p-2 rounded-lg border border-[#1a2035] text-slate-400 hover:text-white hover:border-slate-600 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">New invoice</h1>
          <p className="text-xs text-slate-500">
            Fill in the client, add line items, then save.
          </p>
        </div>
      </div>

      {/* Invoice info */}
      <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <User size={14} className="text-gold" />
          Invoice details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Client name</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Kigali Heights Ltd"
              className={fieldCls}
            />
          </div>

          <div>
            <label className={labelCls}>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={fieldCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Client details</label>
            <textarea
              value={clientDetails}
              onChange={(e) => setClientDetails(e.target.value)}
              rows={2}
              placeholder="Address, TIN, contact person…"
              className={`${fieldCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Due date</label>
            <input
              type="date"
              value={duedate}
              onChange={(e) => setDuedate(e.target.value)}
              className={fieldCls}
            />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a2035] flex items-center gap-2">
          <Package size={14} className="text-gold" />
          <h2 className="text-sm font-semibold text-white">Line items</h2>
          <span className="text-[11px] text-slate-500 ml-2">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[#080c18] text-left text-slate-500 font-mono text-[10.5px] uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold w-10">#</th>
                <th className="px-4 py-2.5 font-semibold">Description</th>
                <th className="px-4 py-2.5 font-semibold text-center w-24">
                  Qty
                </th>
                <th className="px-4 py-2.5 font-semibold text-right w-32">
                  Unit price
                </th>
                <th className="px-4 py-2.5 font-semibold text-right w-32">
                  Total
                </th>
                <th className="px-4 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-600 text-sm"
                  >
                    No items yet — add one below.
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className="border-t border-[#1a2035]">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {fmtMoney(item.price, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-100 font-medium">
                      {fmtMoney(lineTotal(item), currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add item form */}
        <div className="px-5 py-4 border-t border-[#1a2035] bg-[#080c18]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-6">
              <label className={labelCls}>Product / service</label>
              <input
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="e.g. Consulting fee"
                className={fieldCls}
              />
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Price ({currency})</label>
              <input
                type="number"
                min={0}
                step="any"
                value={pPrice || ''}
                onChange={(e) => setPPrice(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={fieldCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Qty</label>
              <input
                type="number"
                min={1}
                value={pQty}
                onChange={(e) =>
                  setPQty(Math.max(1, parseInt(e.target.value) || 1))
                }
                className={fieldCls}
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full h-[42px] flex items-center justify-center gap-1 rounded-lg bg-gold text-[#1A1408] font-bold hover:bg-gold/90 transition"
                title="Add line item"
              >
                <Plus size={14} />
              </button>
            </div>
          </form>
          <p className="text-[10.5px] text-slate-600 mt-2">
            Press Enter or click <span className="text-gold">+</span> to add the
            line to the invoice.
          </p>
        </div>
      </div>

      {/* Totals + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 text-xs">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-200 font-medium">
              {fmtMoney(subTotal, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">VAT (0%)</span>
            <span className="text-slate-200 font-medium">
              {fmtMoney(vat, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#1a2035]">
            <span className="text-sm font-semibold text-gold">Grand total</span>
            <span className="text-lg font-bold text-gold">
              {fmtMoney(grandTotal, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setShowPreview(true)}
          disabled={items.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#1a2035] text-slate-300 text-sm hover:bg-[#1a2035] transition disabled:opacity-40"
        >
          <Eye size={14} /> Preview
        </button>
        <button
          onClick={submit}
          disabled={createInvoice.isPending || items.length === 0}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gold text-[#1A1408] text-sm font-bold hover:bg-gold/90 disabled:opacity-50 transition"
        >
          {createInvoice.isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={14} /> Save invoice
            </>
          )}
        </button>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          currency={currency}
          clientName={clientName}
          clientDetails={clientDetails}
          duedate={duedate}
          items={items}
          subTotal={subTotal}
          vat={vat}
          grandTotal={grandTotal}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            submit();
          }}
          isSaving={createInvoice.isPending}
        />
      )}
    </div>
  );
}

// ─── Preview Modal ──────────────────────────────────────────────────────────

function PreviewModal({
  currency,
  clientName,
  clientDetails,
  duedate,
  items,
  subTotal,
  vat,
  grandTotal,
  onClose,
  onConfirm,
  isSaving,
}: {
  currency: string;
  clientName: string;
  clientDetails: string;
  duedate: string;
  items: LineItem[];
  subTotal: number;
  vat: number;
  grandTotal: number;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between p-5 border-b border-[#1a2035]">
            <h2 className="text-white font-semibold">Preview</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a2035]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Client" value={clientName || '—'} />
              <Info label="Due date" value={duedate || '—'} />
              <div className="col-span-2">
                <Info label="Details" value={clientDetails || '—'} />
              </div>
            </div>

            <div className="border border-[#1a2035] rounded-xl overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-[#080c18] text-left text-slate-500 font-mono text-[10.5px] uppercase tracking-wide">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={it.id} className="border-t border-[#1a2035]">
                      <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2.5 text-slate-200">{it.name}</td>
                      <td className="px-4 py-2.5 text-center text-slate-400">
                        {it.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400">
                        {fmtMoney(it.price, currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-100">
                        {fmtMoney(lineTotal(it), currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto w-full sm:w-64 space-y-1.5 text-sm">
              <Row label="Subtotal" value={fmtMoney(subTotal, currency)} />
              <Row label="VAT" value={fmtMoney(vat, currency)} />
              <Row
                label="Grand total"
                value={fmtMoney(grandTotal, currency)}
                bold
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-5 border-t border-[#1a2035]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#1a2035] text-slate-400 text-sm hover:bg-[#1a2035]"
            >
              Close
            </button>
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gold text-[#1A1408] text-sm font-bold hover:bg-gold/90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={13} /> Confirm & save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-slate-200">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        bold ? 'pt-2 border-t border-[#1a2035]' : ''
      }`}
    >
      <span className={bold ? 'text-gold font-semibold' : 'text-slate-500'}>
        {label}
      </span>
      <span className={bold ? 'text-gold font-bold' : 'text-slate-200'}>
        {value}
      </span>
    </div>
  );
}