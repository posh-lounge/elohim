'use client';

import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Plus, TrendingUp } from 'lucide-react';
import type { KpiDefinition, RoleKey, TaskScope } from '@/lib/types';
import { useKpis } from '@/hooks/useKpis';
import { ROLE_ACCENT } from '@/lib/roleDisplay';
import { LogKpiEntryModal } from './LogKpiEntryModal';
import { AddKpiModal } from './AddKpiModal';

function fmtShortDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function KpiCard({ def, canLog, onLog, roleLabelByKey }: {
  def: KpiDefinition; canLog: boolean; onLog: () => void; roleLabelByKey: Record<string, string>;
}) {
  const accent = ROLE_ACCENT[def.roleKey];
  const latest = def.entries[def.entries.length - 1];
  const chartData = def.entries.map((e) => ({ date: fmtShortDate(e.periodDate), value: e.value }));

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex justify-between items-start gap-2 mb-1">
        <div>
          <div className="text-[13px] font-semibold leading-snug">{def.label}</div>
          <div className={`text-[10.5px] font-mono mt-0.5 ${accent.text}`}>{roleLabelByKey[def.roleKey]}</div>
        </div>
        {canLog && (
          <button
            onClick={onLog}
            className="flex items-center gap-1 text-[10.5px] px-2 py-1 rounded-md border border-gold text-gold whitespace-nowrap"
          ><Plus size={11} /> Log</button>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-2xl font-display font-bold">{latest ? latest.value : '—'}</span>
        {def.unit && <span className="text-[11px] text-faint">{def.unit}</span>}
        {def.targetValue !== null && <span className="text-[10.5px] text-faint ml-auto">target: {def.targetValue}{def.unit}</span>}
      </div>

      {chartData.length > 1 ? (
        <div className="h-[70px] mt-2 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', fontSize: 11, borderRadius: 6 }}
                labelStyle={{ color: 'var(--text-muted)' }}
              />
              {def.targetValue !== null && <ReferenceLine y={def.targetValue} stroke="var(--gold)" strokeDasharray="3 3" />}
              <Line type="monotone" dataKey="value" stroke="var(--gold)" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-[11px] text-faint mt-3 py-3 text-center border border-dashed border-border-soft rounded-lg">
          {chartData.length === 1 ? 'One reading so far — log another to see a trend.' : 'No readings logged yet.'}
        </div>
      )}
    </div>
  );
}

export function KpiTracking({
  currentRoleKey, roleLabelByKey, canManage, isTopLevel, manageableOptions,
}: {
  currentRoleKey: RoleKey; roleLabelByKey: Record<string, string>; canManage: boolean;
  isTopLevel: boolean; manageableOptions: RoleKey[];
}) {
  const [scope, setScope] = useState<TaskScope>('my');
  const [logTarget, setLogTarget] = useState<KpiDefinition | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const kpiQuery = useKpis(scope);

  const tabs: { key: TaskScope; label: string }[] = [
    { key: 'my', label: 'My Metrics' },
    ...(canManage ? [{ key: 'team' as TaskScope, label: 'Team Metrics' }] : []),
    ...(isTopLevel ? [{ key: 'all' as TaskScope, label: 'Org-wide' }] : []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key} onClick={() => setScope(t.key)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border ${scope === t.key ? 'border-gold bg-gold-soft text-primary' : 'border-border text-muted'}`}
            >{t.label}</button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-1.5 text-xs"
        ><TrendingUp size={13} /> Track a metric</button>
      </div>

      {kpiQuery.isLoading && <div className="text-sm text-faint py-8">Loading metrics…</div>}

      {kpiQuery.data && kpiQuery.data.length === 0 && (
        <div className="text-[13px] text-faint py-8">No metrics here yet.</div>
      )}

      {kpiQuery.data && kpiQuery.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpiQuery.data.map((def) => (
            <KpiCard
              key={def.id} def={def} canLog={def.roleKey === currentRoleKey}
              onLog={() => setLogTarget(def)} roleLabelByKey={roleLabelByKey}
            />
          ))}
        </div>
      )}

      {logTarget && <LogKpiEntryModal definition={logTarget} onClose={() => setLogTarget(null)} />}
      {showAdd && (
        <AddKpiModal
          options={Array.from(new Set([currentRoleKey, ...manageableOptions]))}
          roleLabelByKey={roleLabelByKey} onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
