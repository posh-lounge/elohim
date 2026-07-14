'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Role } from '@/lib/types';
import { ROLE_ICON, ROLE_ACCENT } from '@/lib/roleDisplay';

export function Dossier({ role, roleLabelByKey }: { role: Role; roleLabelByKey: Record<string, string> }) {
  const [open, setOpen] = useState(true);
  const Icon = ROLE_ICON[role.key];
  const accent = ROLE_ACCENT[role.key];

  return (
    <div className="bg-surface border border-border rounded-xl mb-4 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent.softBg}`}>
            <Icon size={17} className={accent.text} />
          </div>
          <div>
            <div className="font-display text-base font-semibold">{role.label}</div>
            <div className="font-mono text-[11px] text-faint">
              {role.reportsTo ? `reports to ${roleLabelByKey[role.reportsTo]}` : 'top of the chain'} · {role.department}
            </div>
          </div>
        </div>
        <ChevronDown size={16} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted leading-relaxed">{role.purpose}</p>
            <div className={`font-mono text-[10.5px] uppercase tracking-wider mt-3 mb-1.5 ${accent.text}`}>Key responsibilities</div>
            <ul className="list-disc pl-4 text-[12.5px] text-muted leading-relaxed space-y-0.5">
              {role.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <div>
            <div className={`font-mono text-[10.5px] uppercase tracking-wider mb-1.5 ${accent.text}`}>How performance is measured</div>
            <ul className="list-disc pl-4 text-[12.5px] text-muted leading-relaxed space-y-0.5">
              {role.kpis.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
