'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Printer, Send, Archive, CheckCircle2,
  Loader2, Trash2, Edit2, AlertTriangle, X,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  useLetter, useUpdateLetter, useUpdateLetterStatus, useDeleteLetter, printLetterPdf,
} from '@/hooks/useLetters';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { LetterStatus } from '@/lib/types';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function LetterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const letterId = Number(id);
  const router = useRouter();

  const { data, isLoading, isError, error } = useLetter(letterId);
  const updateLetter = useUpdateLetter();
  const updateStatus = useUpdateLetterStatus();
  const deleteLetter = useDeleteLetter();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: '', to_name: '', to_title: '', to_address: '',
    reason: '', body_html: '', conclusion: '',
  });

  useEffect(() => {
    if (data?.letter) {
      setForm({
        title: data.letter.title,
        to_name: data.letter.to_name,
        to_title: data.letter.to_title ?? '',
        to_address: data.letter.to_address ?? '',
        reason: data.letter.reason,
        body_html: data.letter.body_html,
        conclusion: data.letter.conclusion ?? '',
      });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <Skeleton width={220} height={20} baseColor="#0d1120" highlightColor="#1a2035" />
        <Skeleton height={400} baseColor="#0d1120" highlightColor="#1a2035" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle size={36} className="mx-auto text-rose-400 mb-3" />
        <p className="text-slate-300 mb-2">Failed to load letter</p>
        <p className="text-slate-500 text-xs mb-4">{error?.message}</p>
        <Link href="/letters" className="text-gold text-sm hover:underline">← Back to letters</Link>
      </div>
    );
  }

  const { letter, signature } = data;
  const isDraft = letter.status === 'Draft';
  const isArchived = letter.status === 'Archived';
  const canEdit = !isArchived;

  const save = () => {
    updateLetter.mutate(
      { id: letterId, ...form },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const setStatus = (status: LetterStatus) => {
    if (status === 'Final' && !confirm('Mark this letter as Final? It will be signed with your signature.')) return;
    updateStatus.mutate({ id: letterId, status });
  };

  const remove = () => {
    if (!confirm('Delete this letter permanently?')) return;
    deleteLetter.mutate(letterId, { onSuccess: () => router.push('/letters') });
  };

  const fieldCls = 'w-full bg-[#080c18] border border-[#1a2035] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-gold transition';
  const labelCls = 'block font-mono text-[10.5px] uppercase tracking-wide text-slate-500 mb-1.5';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/letters"
            className="p-2 rounded-lg border border-[#1a2035] text-slate-400 hover:text-white hover:border-slate-600 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">{letter.title}</h1>
            <p className="text-xs text-slate-500 font-mono">{letter.ref_no}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-lg border border-[#1a2035] text-slate-400 text-xs hover:bg-[#1a2035]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={updateLetter.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold text-[#1A1408] text-xs font-bold hover:bg-gold/90 disabled:opacity-50"
              >
                {updateLetter.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1a2035] text-slate-300 text-xs hover:bg-[#1a2035]"
                >
                  <Edit2 size={13} /> Edit
                </button>
              )}
              <button
                onClick={() => printLetterPdf(letterId)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1a2035] text-slate-300 text-xs hover:bg-[#1a2035]"
              >
                <Printer size={13} /> PDF
              </button>
              {isDraft && (
                <button
                  onClick={() => setStatus('Final')}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600/90 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {updateStatus.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Finalize
                </button>
              )}
              {letter.status === 'Final' && (
                <button
                  onClick={() => setStatus('Sent')}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/90 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50"
                >
                  <Send size={13} /> Mark sent
                </button>
              )}
              {letter.status !== 'Archived' && (
                <button
                  onClick={() => setStatus('Archived')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1a2035] text-slate-400 text-xs hover:bg-[#1a2035]"
                >
                  <Archive size={13} /> Archive
                </button>
              )}
              {isDraft && (
                <button
                  onClick={remove}
                  disabled={deleteLetter.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 text-rose-400 text-xs hover:bg-rose-500/10"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Meta + content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {isEditing ? (
            <>
              <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white">Envelope</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Recipient name</label>
                    <input value={form.to_name} onChange={(e) => setForm({ ...form, to_name: e.target.value })} className={fieldCls} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Recipient title</label>
                    <input value={form.to_title} onChange={(e) => setForm({ ...form, to_title: e.target.value })} className={fieldCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Recipient address</label>
                    <input value={form.to_address} onChange={(e) => setForm({ ...form, to_address: e.target.value })} className={fieldCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Reason / subject</label>
                  <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={fieldCls} />
                </div>
              </div>

              <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1a2035]">
                  <h2 className="text-sm font-semibold text-white">Body</h2>
                </div>
                <div className="p-4">
                  <RichTextEditor value={form.body_html} onChange={(v) => setForm({ ...form, body_html: v })} />
                </div>
              </div>

              <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 space-y-2">
                <h2 className="text-sm font-semibold text-white">Conclusion</h2>
                <textarea
                  value={form.conclusion}
                  onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                  rows={3}
                  className={`${fieldCls} resize-none`}
                />
              </div>
            </>
          ) : (
            <div className="bg-white text-[#0f172a] rounded-2xl p-8 shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono mb-4">Letter preview</p>
              <h1 className="text-xl font-bold mb-5">{letter.title}</h1>

              <div className="mb-5">
                <p className="text-[10px] uppercase text-slate-400 font-mono mb-1">To</p>
                <p className="font-bold">{letter.to_name}</p>
                {letter.to_title && <p className="text-sm text-slate-500">{letter.to_title}</p>}
                {letter.to_address && <p className="text-sm text-slate-500 whitespace-pre-line">{letter.to_address}</p>}
              </div>

              <div className="border-l-4 border-cyan-400 bg-slate-50 p-3 mb-5 rounded-r">
                <p className="text-[10px] uppercase text-slate-400 font-mono mb-1">Re</p>
                <p className="font-semibold">{letter.reason}</p>
              </div>

              <p className="mb-4">Dear {letter.to_name},</p>

              <div
                className="text-sm leading-relaxed letter-body-preview"
                dangerouslySetInnerHTML={{ __html: letter.body_html }}
              />

              {letter.conclusion && (
                <p className="mt-5 text-sm leading-relaxed">{letter.conclusion}</p>
              )}

              {signature && (
                <div className="mt-8 text-right">
                  <p className="text-sm">Yours sincerely,</p>
                  <div className="mt-6">
                    <img src={signature.signature} alt="Signature" className="inline-block w-40 h-auto" />
                  </div>
                  <p className="font-bold text-sm mt-1">{signature.signed_by_name}</p>
                  <p className="text-xs text-slate-500">Authorized Signatory</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white">Info</h2>
            <InfoRow label="Reference" value={letter.ref_no} mono />
            <InfoRow label="Status" value={letter.status} />
            <InfoRow label="Created" value={fmtDate(letter.created_at)} />
            <InfoRow label="Author" value={letter.created_by_name ?? '—'} />
            {letter.finalized_at && (
              <InfoRow label="Finalized" value={fmtDate(letter.finalized_at)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#1a2035]/60 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-200 font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}