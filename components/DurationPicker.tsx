'use client';

import { fmtDuration } from './primitives';

const PRESETS = [30, 60, 120, 240];

export function DurationPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block">
        Estimated time (optional)
      </label>
      <div className="flex gap-1.5 flex-wrap items-center">
        {PRESETS.map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => onChange(value === m ? null : m)}
            className={`text-[11.5px] px-2.5 py-1.5 rounded-md font-semibold border ${
              value === m
                ? 'border-gold bg-gold-soft text-primary'
                : 'border-border bg-surface-alt text-muted'
            }`}
          >
            {fmtDuration(m)}
          </button>
        ))}
        <input
          type="number"
          min={1}
          max={1440}
          placeholder="Custom (min)"
          value={value && !PRESETS.includes(value) ? value : ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-28 bg-surface-alt border border-border rounded-md px-2 py-1.5 text-[11.5px]"
        />
      </div>
    </div>
  );
}