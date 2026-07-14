'use client';

import { useState } from 'react';
import { Mail, Phone, Network, List } from 'lucide-react';
import type { DirectoryPerson, Role, RoleKey } from '@/lib/types';
import { useDirectory } from '@/hooks/useDirectory';
import { ROLE_ICON, ROLE_ACCENT } from '@/lib/roleDisplay';

function PersonCard({ person }: { person: DirectoryPerson }) {
  const Icon = ROLE_ICON[person.role.key];
  const accent = ROLE_ACCENT[person.role.key];
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent.softBg}`}>
          <Icon size={17} className={accent.text} />
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold truncate">{person.name}</div>
          <div className={`text-[11px] font-mono truncate ${accent.text}`}>{person.role.label}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-[11.5px] text-muted">
        <a href={`mailto:${person.email}`} className="flex items-center gap-1.5 hover:text-primary truncate">
          <Mail size={11} className="text-faint shrink-0" /> {person.email}
        </a>
        {person.phone && (
          <a href={`tel:${person.phone}`} className="flex items-center gap-1.5 hover:text-primary">
            <Phone size={11} className="text-faint shrink-0" /> {person.phone}
          </a>
        )}
      </div>
    </div>
  );
}

function OrgChartNode({ roleKey, roles, peopleByRole }: { roleKey: RoleKey; roles: Role[]; peopleByRole: Record<string, DirectoryPerson[]> }) {
  const role = roles.find((r) => r.key === roleKey);
  if (!role) return null;
  const people = peopleByRole[roleKey] ?? [];
  const Icon = ROLE_ICON[roleKey];
  const accent = ROLE_ACCENT[roleKey];
  const children = roles.filter((r) => r.reportsTo === roleKey);

  return (
    <div className="flex flex-col items-center">
      <div className={`bg-surface-alt border ${accent.border} rounded-lg px-3 py-2 min-w-[160px] text-center`}>
        <div className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold mb-1">
          <Icon size={13} className={accent.text} /> {role.label}
        </div>
        {people.length > 0
          ? people.map((p) => <div key={p.id} className="text-[10.5px] text-muted">{p.name}</div>)
          : <div className="text-[10.5px] text-faint italic">vacant</div>}
      </div>
      {children.length > 0 && (
        <>
          <div className="w-px h-4 bg-border" />
          <div className="flex gap-5">
            {children.map((c) => (
              <div key={c.key} className="flex flex-col items-center">
                <OrgChartNode roleKey={c.key} roles={roles} peopleByRole={peopleByRole} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TeamDirectory({ roles }: { roles: Role[] }) {
  const directoryQuery = useDirectory();
  const [view, setView] = useState<'list' | 'chart'>('list');

  const peopleByRole: Record<string, DirectoryPerson[]> = {};
  (directoryQuery.data ?? []).forEach((p) => {
    (peopleByRole[p.role.key] ??= []).push(p);
  });

  const topRole = roles.find((r) => !r.reportsTo);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-[13px] text-muted">
          {directoryQuery.data ? `${directoryQuery.data.length} people` : 'Loading…'}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${view === 'list' ? 'border-gold bg-gold-soft text-primary' : 'border-border text-muted'}`}
          ><List size={13} /> List</button>
          <button
            onClick={() => setView('chart')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${view === 'chart' ? 'border-gold bg-gold-soft text-primary' : 'border-border text-muted'}`}
          ><Network size={13} /> Org chart</button>
        </div>
      </div>

      {directoryQuery.isLoading && <div className="text-sm text-faint py-8">Loading directory…</div>}

      {directoryQuery.data && view === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {directoryQuery.data.map((p) => <PersonCard key={p.id} person={p} />)}
        </div>
      )}

      {directoryQuery.data && view === 'chart' && topRole && (
        <div className="overflow-x-auto py-4">
          <div className="flex justify-center min-w-[700px]">
            <OrgChartNode roleKey={topRole.key} roles={roles} peopleByRole={peopleByRole} />
          </div>
        </div>
      )}
    </div>
  );
}
