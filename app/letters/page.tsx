'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Plus, Search, FileText, Loader2, Send, Archive, CheckCircle2,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useLetters } from '@/hooks/useLetters';
import type { Letter } from '@/lib/types';

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusPill({ status }: { status: Letter['status'] }) {
  const map: Record<Letter['status'], string> = {
    Draft: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    Final: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    Sent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Archived: 'text-slate-600 border-slate-700 bg-slate-800/40',
  };
  const icon: Record<Letter['status'], React.ReactNode> = {
    Draft: <FileText size={11} />,
    Final: <CheckCircle2 size={11} />,
    Sent: <Send size={11} />,
    Archived: <Archive size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${map[status]}`}>
      {icon[status]}
      {status}
    </span>
  );
}

export default function LettersPage() {
  const [statusFilter, setStatusFilter] = useState<'All' | Letter['status']>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useLetters({
    status: statusFilter,
    search: search.trim() || undefined,
  });
  const letters = data?.letters ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Mail size={18} className="text-gold" />
            Letters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compose official correspondence with letterhead PDF export
          </p>
        </div>
        <Link
          href="/letters/new"
          className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-2 text-xs hover:bg-gold/90 transition"
        >
          <Plus size={13} /> New letter
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#1a2035] bg-[#0d1120] rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          {(['All', 'Draft', 'Final', 'Sent', 'Archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
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
            placeholder="Search ref, title, recipient…"
            className="bg-[#080c18] border border-[#1a2035] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-gold w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1a2035] bg-[#0d1120] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={42} baseColor="#0d1120" highlightColor="#1a2035" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-400 text-sm">
            Failed to load letters: {error?.message}
          </div>
        ) : letters.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">No letters yet</p>
            <Link
              href="/letters/new"
              className="inline-block mt-4 text-gold text-xs hover:underline"
            >
              Write your first letter →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[#080c18] text-left text-slate-500 font-mono text-[10.5px] uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Ref</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">To</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {letters.map((l) => (
                  <tr key={l.id} className="border-t border-[#1a2035] hover:bg-[#0f1428] transition">
                    <td className="px-4 py-3">
                      <Link href={`/letters/${l.id}`} className="font-mono text-xs text-slate-200 hover:text-gold">
                        {l.ref_no}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{l.title}</td>
                    <td className="px-4 py-3 text-slate-400">{l.to_name}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[240px]">{l.reason}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(l.created_at)}</td>
                    <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/letters/${l.id}`}
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