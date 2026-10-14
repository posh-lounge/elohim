'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, Eye, X } from 'lucide-react';
import { useCreateLetter } from '@/hooks/useLetters';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function NewLetterPage() {
  const router = useRouter();
  const createLetter = useCreateLetter();

  const [title, setTitle] = useState('');
  const [toName, setToName] = useState('');
  const [toTitle, setToTitle] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [reason, setReason] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const submit = () => {
    setError(null);
    if (!title.trim()) return setError('Letter title is required.');
    if (!toName.trim()) return setError('Recipient name is required.');
    if (!reason.trim()) return setError('Reason / subject is required.');
    if (!bodyHtml.trim() || bodyHtml === '<p><br></p>') return setError('Body cannot be empty.');

    createLetter.mutate(
      {
        title: title.trim(),
        to_name: toName.trim(),
        to_title: toTitle.trim() || undefined,
        to_address: toAddress.trim() || undefined,
        reason: reason.trim(),
        body_html: bodyHtml,
        conclusion: conclusion.trim() || undefined,
      },
      { onSuccess: (data) => router.push(`/letters/${data.id}`) },
    );
  };

  const fieldCls = 'w-full bg-[#080c18] border border-[#1a2035] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-gold transition';
  const labelCls = 'block font-mono text-[10.5px] uppercase tracking-wide text-slate-500 mb-1.5';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/letters"
          className="p-2 rounded-lg border border-[#1a2035] text-slate-400 hover:text-white hover:border-slate-600 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">New letter</h1>
          <p className="text-xs text-slate-500">Compose on the rich editor, then generate the letterhead PDF</p>
        </div>
      </div>

      {/* Envelope metadata */}
      <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Envelope</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Letter title (internal)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Offer of employment" className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Recipient name</label>
            <input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="e.g. Mr. Jean Bosco" className={fieldCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Recipient title (optional)</label>
            <input value={toTitle} onChange={(e) => setToTitle(e.target.value)} placeholder="e.g. Managing Director" className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Recipient address (optional)</label>
            <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Company, street, city" className={fieldCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Reason / subject</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Confirmation of employment" className={fieldCls} />
        </div>
      </div>

      {/* Editor */}
      <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a2035]">
          <h2 className="text-sm font-semibold text-white">Letter body</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Use the toolbar to format text like in MS Word.
          </p>
        </div>
        <div className="p-4">
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-semibold text-white">Conclusion</h2>
        <textarea
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          rows={3}
          placeholder="e.g. We look forward to your response at your earliest convenience."
          className={`${fieldCls} resize-none`}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!bodyHtml || bodyHtml === '<p><br></p>'}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#1a2035] text-slate-300 text-sm hover:bg-[#1a2035] transition disabled:opacity-40"
        >
          <Eye size={14} /> Preview
        </button>
        <button
          onClick={submit}
          disabled={createLetter.isPending}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gold text-[#1A1408] text-sm font-bold hover:bg-gold/90 disabled:opacity-50 transition"
        >
          {createLetter.isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Saving…</>
          ) : (
            <><Save size={14} /> Save as draft</>
          )}
        </button>
      </div>

      {showPreview && (
        <LetterPreviewModal
          title={title}
          toName={toName}
          toTitle={toTitle}
          toAddress={toAddress}
          reason={reason}
          bodyHtml={bodyHtml}
          conclusion={conclusion}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// ─── Preview modal ──────────────────────────────────────────────────────────

function LetterPreviewModal({
  title, toName, toTitle, toAddress, reason, bodyHtml, conclusion, onClose,
}: {
  title: string; toName: string; toTitle: string; toAddress: string;
  reason: string; bodyHtml: string; conclusion: string; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#0d1120] border border-[#1a2035] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between p-5 border-b border-[#1a2035]">
            <h2 className="text-white font-semibold">Preview</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a2035]">
              <X size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white text-[#0f172a] rounded-xl p-8 shadow-inner">
              <p className="text-[10px] uppercase text-slate-400 font-mono mb-4">Draft preview</p>
              <h1 className="text-xl font-bold mb-4">{title || 'Untitled letter'}</h1>
              <div className="mb-4">
                <p className="text-[10px] uppercase text-slate-400 font-mono mb-1">To</p>
                <p className="font-bold">{toName || '—'}</p>
                {toTitle && <p className="text-sm text-slate-500">{toTitle}</p>}
                {toAddress && <p className="text-sm text-slate-500">{toAddress}</p>}
              </div>
              <div className="border-l-4 border-cyan-400 bg-slate-50 p-3 mb-4 rounded-r">
                <p className="text-[10px] uppercase text-slate-400 font-mono mb-1">Re</p>
                <p className="font-semibold">{reason || '—'}</p>
              </div>
              <p className="mb-3">Dear {toName || '—'},</p>
              <div
                className="letter-body-preview text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
              {conclusion && <p className="mt-5 text-sm leading-relaxed">{conclusion}</p>}
              <p className="mt-8 text-sm">Yours sincerely,</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-5 border-t border-[#1a2035]">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1a2035] text-slate-400 text-sm hover:bg-[#1a2035]">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}