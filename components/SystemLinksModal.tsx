'use client';

import { useState } from 'react';
import { X, Plus, ExternalLink, Trash2 } from 'lucide-react';

// Common templates — swap this out for a real fetch once the backend endpoint exists.
const COMMON_LINK_TEMPLATES: { id: string; name: string; url: string }[] = [
  { id: 'N Residential', name: 'N Residential System', url: 'https://hub.nresidentialsuites.com' },
  { id: 'Elohim Website', name: 'Elohim Website', url: 'https://www.elohimgroupltd.com' },
  { id: 'Elohim System', name: 'Elohim System', url: 'https://admin.elohimgroupltd.com' },
  { id: 'P conn system', name: 'P Conn System', url: 'https://pa.elohimgroupltd.com' },
  // add more shared systems here
];

interface PersonalLink { id: string; name: string; url: string }

export function SystemLinksModal({ onClose }: { onClose: () => void }) {
  const [personalLinks, setPersonalLinks] = useState<PersonalLink[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  const addLink = () => {
    if (!name.trim() || !url.trim()) return;
    let href = url.trim();
    if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
    setPersonalLinks((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), url: href }]);
    setName('');
    setUrl('');
  };

  const removeLink = (id: string) => setPersonalLinks((prev) => prev.filter((l) => l.id !== id));

  const LinkRow = ({ link, onRemove }: { link: { id: string; name: string; url: string }; onRemove?: () => void }) => (
    <div className="flex items-center justify-between bg-surface-alt border border-border-soft rounded-lg px-3 py-2 group">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[12.5px] text-primary hover:text-gold flex-1 min-w-0">
        <ExternalLink size={13} className="shrink-0 text-faint" />
        <span className="truncate">{link.name}</span>
      </a>
      {onRemove && (
        <button onClick={onRemove} className="text-faint hover:text-danger opacity-0 group-hover:opacity-100 shrink-0">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Quick links</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className={label}>Common</label>
            <div className="flex flex-col gap-1.5">
              {COMMON_LINK_TEMPLATES.map((l) => <LinkRow key={l.id} link={l} />)}
            </div>
          </div>

          <div>
            <label className={label}>My links</label>
            <div className="flex flex-col gap-1.5">
              {personalLinks.length === 0 && <div className="text-[11px] text-faint">No personal links yet.</div>}
              {personalLinks.map((l) => <LinkRow key={l.id} link={l} onRemove={() => removeLink(l.id)} />)}
            </div>
          </div>

         {/* <div className="border-t border-border-soft pt-4">
            <label className={label}>Add a link</label>
            <div className="flex flex-col gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. N Residential System" className={field} />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={field} />
              <button
                onClick={addLink} disabled={!name.trim() || !url.trim()}
                className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
              ><Plus size={15} /> Add link</button>
            </div>
          </div>
           */}
        </div>
      </div>
    </div>
  );
}