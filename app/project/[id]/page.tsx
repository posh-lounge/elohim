// app/dashboard/projects/[id]/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Circle,
  Eye,
  Loader2,
  X,
  Upload,
  User,
  Calendar,
  Send,
  FileText,
  Download,
  AlertCircle,
  Flag,
  Clock,
  Users,
  Settings,
  Trash2,
  Edit2,
  MoreVertical,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import {
  useProjectDetail,
  useCreateMilestone,
  useUpdateMilestoneStatus,
  useAddMilestoneComment,
  useAddMilestoneAttachment,
  useAddProjectDiscussion,
  useAddProjectAttachment,
  useDeleteProjectAttachment,
  useAddProjectMembers,
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
  useAvailableUsers,
  type Milestone,
  type MilestoneStatus,
  type MilestoneComment,
  type MilestoneAttachment,
} from '@/hooks/useProjects';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: {
  key: MilestoneStatus;
  label: string;
  headerBg: string;
  border: string;
  bg: string;
  dot: string;
}[] = [
  { key: 'todo', label: 'To Do', headerBg: 'bg-slate-500/10', border: 'border-slate-500/20', bg: 'bg-[#0a0e1a]', dot: 'bg-slate-500' },
  { key: 'in_progress', label: 'In Progress', headerBg: 'bg-blue-500/10', border: 'border-blue-500/20', bg: 'bg-[#060d1f]', dot: 'bg-blue-500' },
  { key: 'review', label: 'Review', headerBg: 'bg-amber-500/10', border: 'border-amber-500/20', bg: 'bg-[#100d03]', dot: 'bg-amber-500' },
  { key: 'done', label: 'Done', headerBg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bg: 'bg-[#030f09]', dot: 'bg-emerald-500' },
];

const COLUMN_ICON: Record<MilestoneStatus, React.ReactNode> = {
  todo: <Circle size={12} className="text-slate-400" />,
  in_progress: <Loader2 size={12} className="text-blue-400 animate-spin" />,
  review: <Eye size={12} className="text-amber-400" />,
  done: <CheckCircle2 size={12} className="text-emerald-400" />,
};

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-blue-400',
  high: 'bg-amber-400',
  urgent: 'bg-rose-500',
};

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateShort(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtSize(b: number) {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1048576).toFixed(1)}MB`;
}

function timeSince(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return fmtDateShort(d) ?? '';
}

// ─── UI Components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className="rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  return (
    <div className="flex gap-3">
      <Avatar name={comment.name} size={30} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white text-xs font-semibold">{comment.name}</span>
          <span className="text-slate-600 text-xs">{timeSince(comment.created_at)}</span>
          <span className="text-slate-600 text-xs">· {comment.role_label}</span>
        </div>
        <div className="bg-[#0d1120] border border-[#1a2035] rounded-xl px-3.5 py-2.5">
          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
        </div>
      </div>
    </div>
  );
}

function AttachmentItem({ attachment, onDelete, isAdmin }: { 
  attachment: any; 
  onDelete?: () => void;
  isAdmin?: boolean;
}) {
  const isImage = attachment.file_type?.startsWith('image/');
  return (
    <div className="flex items-center gap-3 p-2.5 bg-[#080c18] rounded-xl border border-[#1a2035] hover:border-indigo-500/40 transition group">
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a2035] flex items-center justify-center">
        {isImage ? (
          <img src={`/${attachment.file_path}`} alt={attachment.file_name} className="w-full h-full object-cover" />
        ) : (
          <FileText size={15} className="text-slate-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <a href={`/${attachment.file_path}`} target="_blank" rel="noreferrer" className="text-white text-xs font-medium hover:text-indigo-400 transition truncate block">
          {attachment.file_name}
        </a>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{fmtSize(attachment.file_size)}</span>
          {attachment.is_compressed && (
            <span className="text-emerald-400 text-[10px]">✓ compressed</span>
          )}
        </div>
      </div>
      {onDelete && isAdmin && (
        <button
          onClick={onDelete}
          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
        >
          <Trash2 size={14} />
        </button>
      )}
      <a href={`/${attachment.file_path}`} download className="text-slate-600 hover:text-indigo-400 transition flex-shrink-0">
        <Download size={14} />
      </a>
    </div>
  );
}

// ─── Comment Input ────────────────────────────────────────────────────────────

function CommentInput({ 
  onSubmit, 
  isPending,
  placeholder = 'Write a comment…',
}: { 
  onSubmit: (text: string, files: File[]) => Promise<void>;
  isPending: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    await onSubmit(text, files);
    setText('');
    setFiles([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-[#080c18] border border-[#1a2035] rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-transparent px-3.5 py-3 text-white text-sm placeholder-slate-600 outline-none resize-none"
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {files.map((f, i) => (
              <span key={i} className="flex items-center gap-1 bg-[#1a2035] rounded-lg px-2 py-0.5 text-xs text-slate-300">
                <FileText size={10} /> {f.name} ({(f.size / 1024).toFixed(1)}KB)
                <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400 ml-0.5 transition">
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-3 pb-2.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-slate-500 hover:text-slate-300 transition"
          >
            <Paperclip size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) setFiles((p) => [...p, ...Array.from(e.target.files!)]);
            }}
          />
          <button
            type="submit"
            disabled={isPending || (!text.trim() && files.length === 0)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 rounded-lg text-white text-xs hover:bg-indigo-500 disabled:opacity-40 transition"
          >
            {isPending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Send
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CreateMilestoneModal({ 
  isOpen, 
  projectId, 
  defaultStatus, 
  members,
  onClose 
}: { 
  isOpen: boolean;
  projectId: number;
  defaultStatus: MilestoneStatus;
  members: any[];
  onClose: () => void;
}) {
  const createMilestone = useCreateMilestone();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: defaultStatus,
    assignee_user_id: '',
    due_date: '',
  });

  useEffect(() => {
    if (isOpen) setForm((f) => ({ ...f, status: defaultStatus }));
  }, [isOpen, defaultStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await createMilestone.mutateAsync({
        projectId,
        ...form,
        assignee_user_id: form.assignee_user_id ? parseInt(form.assignee_user_id) : null,
      });
      onClose();
      setForm({ title: '', description: '', priority: 'medium', status: defaultStatus, assignee_user_id: '', due_date: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create milestone');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto p-6 bg-[#0d1120] rounded-2xl border border-[#1a2035]" showCloseButton={false}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-bold">New Milestone</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a2035] transition">
          <X size={15} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Milestone title *"
          required
          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:border-indigo-500 outline-none transition"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description (optional)"
          rows={2}
          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:border-indigo-500 outline-none transition"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
          >
            {['low', 'medium', 'high', 'urgent'].map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as MilestoneStatus })}
            className="bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <select
          value={form.assignee_user_id}
          onChange={(e) => setForm({ ...form, assignee_user_id: e.target.value })}
          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
        >
          <option value="">Assign to...</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
        />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#1a2035] rounded-xl text-slate-400 text-sm hover:bg-[#1a2035] transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMilestone.isPending}
            className="px-5 py-2 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {createMilestone.isPending ? 'Adding…' : 'Add Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StatusChangeModal({ 
  isOpen, 
  milestone, 
  newStatus, 
  projectId,
  onClose 
}: { 
  isOpen: boolean;
  milestone: Milestone | null;
  newStatus: MilestoneStatus | null;
  projectId: number;
  onClose: () => void;
}) {
  const updateStatus = useUpdateMilestoneStatus();
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isOpen) setComment('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestone || !newStatus) return;
    try {
      await updateStatus.mutateAsync({
        milestoneId: milestone.id,
        status: newStatus,
        comment: comment || undefined,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const col = COLUMNS.find((c) => c.key === newStatus);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto p-6 bg-[#0d1120] rounded-2xl border border-[#1a2035]" showCloseButton={false}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold text-base">Move Milestone</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a2035] transition">
          <X size={15} />
        </button>
      </div>
      {milestone && newStatus && (
        <div className="mb-4 p-3 bg-[#080c18] rounded-xl border border-[#1a2035]">
          <p className="text-white text-sm font-medium">{milestone.title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-slate-500 capitalize">{milestone.status.replace('_', ' ')}</span>
            <span className="text-slate-600">→</span>
            <span className={`font-medium capitalize ${col?.dot.replace('bg-', 'text-')}`}>
              {col?.label}
            </span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-400 text-xs font-medium mb-2 block">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note about this change..."
            rows={2}
            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:border-indigo-500 outline-none resize-none transition"
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#1a2035] rounded-xl text-slate-400 text-sm hover:bg-[#1a2035] transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateStatus.isPending}
            className="px-5 py-2 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {updateStatus.isPending ? 'Updating…' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Kanban Components ──────────────────────────────────────────────────────

function MilestoneCard({ 
  milestone, 
  onOpen, 
  onDragStart, 
  draggingId 
}: { 
  milestone: Milestone;
  onOpen: (m: Milestone) => void;
  onDragStart: (id: number) => void;
  draggingId: number | null;
}) {
  const isDone = milestone.status === 'done';
  return (
    <div
      draggable
      onDragStart={() => onDragStart(milestone.id)}
      onClick={() => onOpen(milestone)}
      className={`bg-[#0d1120] rounded-xl border px-3 py-2.5 cursor-pointer transition select-none group
        hover:border-[#2a3560] hover:bg-[#0f1428]
        ${draggingId === milestone.id ? 'opacity-40 border-indigo-500 scale-95' : 'border-[#1a2035]'}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0 ${PRIORITY_DOT[milestone.priority]}`} />
        <p className={`text-sm font-medium leading-snug flex-1 ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
          {milestone.title}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-3.5 text-xs text-slate-600">
        {milestone.due_date && (
          <span className="flex items-center gap-1"><Calendar size={10} />{fmtDateShort(milestone.due_date)}</span>
        )}
        {milestone.assignee_name && (
          <span className="flex items-center gap-1"><User size={10} />{milestone.assignee_name}</span>
        )}
        {milestone.comments?.length > 0 && (
          <span className="flex items-center gap-1"><MessageSquare size={10} />{milestone.comments.length}</span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ 
  col, 
  milestones, 
  projectId, 
  members,
  onAddMilestone, 
  onOpenMilestone, 
  onDragStart,
  onColumnDrop,
  draggingId 
}: { 
  col: typeof COLUMNS[number];
  milestones: Milestone[];
  projectId: number;
  members: any[];
  onAddMilestone: (status: MilestoneStatus) => void;
  onOpenMilestone: (m: Milestone) => void;
  onDragStart: (id: number) => void;
  onColumnDrop: (status: MilestoneStatus) => void;
  draggingId: number | null;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={`flex flex-col min-w-[280px] w-[280px] rounded-2xl border transition-all duration-150 ${col.border} ${col.bg}
        ${isOver ? 'ring-2 ring-indigo-500/30' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsOver(false); onColumnDrop(col.key); }}
    >
      <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-t-2xl ${col.headerBg} border-b ${col.border}`}>
        <div className="flex items-center gap-2">
          {COLUMN_ICON[col.key]}
          <span className="text-white text-sm font-semibold">{col.label}</span>
          <span className="bg-black/20 text-slate-400 text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {milestones.length}
          </span>
        </div>
        <button
          onClick={() => onAddMilestone(col.key)}
          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[60px] max-h-[calc(100vh-290px)]">
        {milestones.length === 0 && (
          <div className="flex items-center justify-center py-8 text-slate-700 text-xs">Drop here</div>
        )}
        {milestones.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            onOpen={onOpenMilestone}
            onDragStart={onDragStart}
            draggingId={draggingId}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Milestone Detail Sidebar ──────────────────────────────────────────────

function MilestoneSidebar({ 
  milestone, 
  projectId,
  onClose, 
  onMarkDone,
  isAdmin,
}: { 
  milestone: Milestone | null;
  projectId: number;
  onClose: () => void;
  onMarkDone: (m: Milestone) => void;
  isAdmin: boolean;
}) {
  const addComment = useAddMilestoneComment();
  const addAttachment = useAddMilestoneAttachment();

  useEffect(() => {
    document.body.style.overflow = milestone ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [milestone]);

  if (!milestone) return null;

  const isDone = milestone.status === 'done';

  const handleComment = async (text: string, files: File[]) => {
    if (text.trim()) {
      await addComment.mutateAsync({ milestoneId: milestone.id, comment: text });
    }
    for (const file of files) {
      await addAttachment.mutateAsync({ milestoneId: milestone.id, file });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full max-w-[480px] bg-[#0a0e1c] border-l border-[#1a2035] z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-[#1a2035]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  milestone.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  milestone.status === 'review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {COLUMN_ICON[milestone.status]}
                  <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${PRIORITY_BADGE[milestone.priority]}`}>
                  <Flag size={10} />{milestone.priority}
                </span>
              </div>
              <h2 className={`text-lg font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                {milestone.title}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-[#1a2035] transition flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="grid grid-cols-2 gap-2.5">
            {milestone.due_date && (
              <div className="bg-[#080c18] border border-[#1a2035] rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1 flex items-center gap-1.5"><Calendar size={11} />Due</p>
                <p className="text-white text-sm font-semibold">{fmtDate(milestone.due_date)}</p>
              </div>
            )}
            {milestone.completed_at && (
              <div className="bg-[#080c18] border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-500/70 text-xs mb-1 flex items-center gap-1.5"><CheckCircle2 size={11} />Completed</p>
                <p className="text-emerald-400 text-sm font-semibold">{fmtDate(milestone.completed_at)}</p>
              </div>
            )}
            {milestone.assignee_name && (
              <div className="bg-[#080c18] border border-[#1a2035] rounded-xl p-3 col-span-2">
                <p className="text-slate-500 text-xs mb-1 flex items-center gap-1.5"><User size={11} />Assignee</p>
                <p className="text-white text-sm font-semibold">{milestone.assignee_name}</p>
              </div>
            )}
          </div>

          {milestone.description && (
            <div>
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-2">Description</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{milestone.description}</p>
            </div>
          )}

          {!isDone && (isAdmin || milestone.assignee_user_id) && (
            <button
              onClick={() => onMarkDone(milestone)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm font-medium hover:bg-emerald-600/20 hover:border-emerald-500/50 transition"
            >
              <CheckCircle2 size={15} /> Mark as done
            </button>
          )}

          {/* Activity */}
          {milestone.history?.length > 0 && (
            <div>
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-3">Activity</p>
              <div className="space-y-3">
                {milestone.history.map((h) => (
                  <div key={h.id} className="bg-[#080c18] rounded-xl p-3 border border-[#1a2035]">
                    <div className="flex justify-between items-start">
                      <span className="text-white text-xs font-medium">{h.name}</span>
                      <span className="text-slate-600 text-xs">{timeSince(h.created_at)}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Changed status from <span className="text-slate-300 capitalize">{h.old_status?.replace('_', ' ')}</span>
                      {' → '}
                      <span className={`capitalize ${h.new_status === 'done' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {h.new_status?.replace('_', ' ')}
                      </span>
                    </p>
                    {h.comment && <p className="text-slate-500 text-xs mt-1 italic">"{h.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {milestone.attachments?.length > 0 && (
            <div>
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-3">
                Attachments ({milestone.attachments.length})
              </p>
              <div className="space-y-2">
                {milestone.attachments.map((a) => (
                  <AttachmentItem key={a.id} attachment={a} />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-3">
              Comments ({milestone.comments?.length || 0})
            </p>
            <div className="space-y-4 mb-4">
              {milestone.comments?.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
            <CommentInput
              onSubmit={handleComment}
              isPending={addComment.isPending || addAttachment.isPending}
              placeholder="Add a comment or attach files..."
            />
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Members Management Modal ──────────────────────────────────────────────

function MembersModal({ 
  isOpen, 
  projectId,
  members,
  isAdmin,
  onClose 
}: { 
  isOpen: boolean;
  projectId: number;
  members: any[];
  isAdmin: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { data: availableUsers, refetch } = useAvailableUsers(projectId, search);
  const addMembers = useAddProjectMembers();
  const updateRole = useUpdateProjectMemberRole();
  const removeMember = useRemoveProjectMember();

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    await addMembers.mutateAsync({ projectId, user_ids: selectedUsers });
    setSelectedUsers([]);
  };

  const handleRoleChange = async (userId: number, role: string) => {
    await updateRole.mutateAsync({ projectId, userId, role });
  };

  const handleRemoveMember = async (userId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeMember.mutateAsync({ projectId, userId });
    }
  };

  useEffect(() => {
    if (isOpen && search.length > 1) {
      refetch();
    }
  }, [search, isOpen, refetch]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg mx-auto p-6 bg-[#0d1120] rounded-2xl border border-[#1a2035] max-h-[90vh] flex flex-col" showCloseButton={false}>
      <div className="flex justify-between items-center mb-5 flex-shrink-0">
        <h2 className="text-white font-bold text-lg">Project Members</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2035] transition">
          <X size={16} />
        </button>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {members.map((m) => (
          <div key={m.user_id} className="flex items-center justify-between p-3 bg-[#080c18] rounded-xl border border-[#1a2035]">
            <div className="flex items-center gap-3">
              <Avatar name={m.name} size={32} />
              <div>
                <p className="text-white text-sm font-medium">{m.name}</p>
                <p className="text-slate-500 text-xs">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && m.role !== 'admin' && (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                  className="bg-[#0a0e1a] border border-[#1a2035] rounded-lg px-2 py-1 text-xs text-white outline-none"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              )}
              {isAdmin && m.role !== 'admin' && (
                <button
                  onClick={() => handleRemoveMember(m.user_id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Members */}
      {isAdmin && (
        <div className="border-t border-[#1a2035] pt-4 flex-shrink-0">
          <div className="flex gap-2 mb-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users to add..."
              className="flex-1 bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          {availableUsers?.users && availableUsers.users.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
              {availableUsers.users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-[#1a2035] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, u.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                      }
                    }}
                    className="accent-indigo-600"
                  />
                  <span className="text-white text-sm">{u.name}</span>
                  <span className="text-slate-500 text-xs">({u.role_label})</span>
                </label>
              ))}
            </div>
          )}
          {selectedUsers.length > 0 && (
            <button
              onClick={handleAddMembers}
              disabled={addMembers.isPending}
              className="w-full py-2 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {addMembers.isPending ? 'Adding...' : `Add ${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const { data, isLoading, error } = useProjectDetail(projectId);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);
  const [pendingStatus, setPendingStatus] = useState<MilestoneStatus | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [openMilestone, setOpenMilestone] = useState<Milestone | null>(null);
  const [markDoneMilestone, setMarkDoneMilestone] = useState<Milestone | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<MilestoneStatus>('todo');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanban' | 'discussions' | 'files'>('kanban');

  const addDiscussion = useAddProjectDiscussion();
  const addProjectAttachment = useAddProjectAttachment();
  const deleteProjectAttachment = useDeleteProjectAttachment();

  const onDragStart = useCallback((id: number) => setDraggingId(id), []);

  const onColumnDrop = useCallback((newStatus: MilestoneStatus) => {
    if (!draggingId || !data) return;
    const ms = data.milestones.find((m) => m.id === draggingId);
    if (!ms || ms.status === newStatus) {
      setDraggingId(null);
      return;
    }
    if (newStatus === 'done') {
      setMarkDoneMilestone(ms);
    } else {
      setPendingMilestone(ms);
      setPendingStatus(newStatus);
      setShowMoveModal(true);
    }
    setDraggingId(null);
  }, [draggingId, data]);

  // Keep sidebar fresh
  useEffect(() => {
    if (openMilestone && data) {
      const fresh = data.milestones.find((m) => m.id === openMilestone.id);
      if (fresh) setOpenMilestone(fresh);
    }
  }, [data, openMilestone]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] p-4 sm:p-6 max-w-7xl mx-auto">
        <Skeleton width={160} height={20} className="mb-5" baseColor="#0d1120" highlightColor="#1a2035" />
        <Skeleton width={320} height={32} className="mb-2" baseColor="#0d1120" highlightColor="#1a2035" />
        <Skeleton width={200} height={18} className="mb-6" baseColor="#0d1120" highlightColor="#1a2035" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={280} height={360} className="rounded-2xl flex-shrink-0" baseColor="#0d1120" highlightColor="#1a2035" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={36} className="mx-auto text-rose-400 mb-3" />
          <p className="text-slate-400 mb-2">Failed to load project</p>
          <button onClick={() => router.refresh()} className="text-indigo-400 text-sm hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { project, milestones, discussions, attachments, members } = data;
  const totalMs = milestones.length;
  const doneMs = milestones.filter((m) => m.status === 'done').length;
  const pct = totalMs ? Math.round((doneMs / totalMs) * 100) : 0;
  const isAdmin = members.some((m: any) => m.role === 'admin' || m.role === 'manager');

  const handleDiscussionComment = async (text: string, files: File[]) => {
    if (text.trim()) {
      await addDiscussion.mutateAsync({ projectId, comment: text });
    }
    for (const file of files) {
      await addProjectAttachment.mutateAsync({ projectId, file });
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (confirm('Delete this file?')) {
      await deleteProjectAttachment.mutateAsync({ projectId, attachmentId });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Back & Actions */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition">
          <ArrowLeft size={14} /> All Projects
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembersModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1120] border border-[#1a2035] rounded-xl text-slate-400 hover:text-white text-xs transition"
          >
            <Users size={13} /> Members ({members.length})
          </button>
          {isAdmin && (
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2035] transition">
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-[#0d1120] rounded-2xl border border-[#1a2035] p-5 mb-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                project.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                project.status === 'on_hold' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                project.status === 'completed' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                'border-slate-500/30 bg-slate-500/10 text-slate-400'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-slate-500 text-xs">{project.project_key}</span>
              <span className="text-slate-600 text-xs">· Created by {project.created_by_name}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-slate-400 text-sm mt-1 max-w-lg">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              {project.start_date && (
                <span className="flex items-center gap-1.5"><Calendar size={11} />Start: {fmtDateShort(project.start_date)}</span>
              )}
              {project.end_date && (
                <span className="flex items-center gap-1.5"><Calendar size={11} />End: {fmtDateShort(project.end_date)}</span>
              )}
              <span className="flex items-center gap-1.5"><Users size={11} />{members.length} members</span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col items-center justify-center bg-[#080c18] rounded-2xl border border-[#1a2035] px-6 py-4 min-w-[130px]">
            <div className="relative w-16 h-16 mb-2">
              <svg viewBox="0 0 36 36" className="w-16 h-16 rotate-[-90deg]">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a2035" strokeWidth="2.8" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="url(#pg)"
                  strokeWidth="2.8"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{pct}%</span>
            </div>
            <p className="text-slate-400 text-xs text-center">{doneMs}/{totalMs} done</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-[#1a2035] pb-2">
        {[
          { key: 'kanban' as const, label: 'Milestones', count: totalMs },
          { key: 'discussions' as const, label: 'Discussion', count: discussions.length },
          { key: 'files' as const, label: 'Files', count: attachments.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm whitespace-nowrap rounded-t-lg border-b-2 transition ${
              activeTab === t.key
                ? 'border-indigo-500 text-white font-medium'
                : 'border-transparent text-slate-500 hover:text-white'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-indigo-600/30 text-indigo-300' : 'bg-[#1a2035] text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        {activeTab === 'kanban' && (
          <div className="w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => { setAddDefaultStatus('todo'); setShowAddModal(true); }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-xl text-white text-xs hover:bg-indigo-500 transition font-medium w-full sm:w-auto"
            >
              <Plus size={13} /> Add Milestone
            </button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              col={col}
              milestones={milestones.filter((m) => m.status === col.key)}
              projectId={projectId}
              members={members}
              onAddMilestone={(s) => { setAddDefaultStatus(s); setShowAddModal(true); }}
              onOpenMilestone={setOpenMilestone}
              onDragStart={onDragStart}
              onColumnDrop={onColumnDrop}
              draggingId={draggingId}
            />
          ))}
        </div>
      )}

      {/* Discussions */}
      {activeTab === 'discussions' && (
        <div className="max-w-2xl">
          <div className="bg-[#0d1120] rounded-2xl border border-[#1a2035] p-5">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <MessageSquare size={15} className="text-indigo-400" /> Project Discussion
            </h3>
            <div className="space-y-4 mb-5">
              {discussions.map((d) => (
                <CommentItem key={d.id} comment={d} />
              ))}
              {discussions.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">No discussion yet. Start the conversation!</p>
              )}
            </div>
            <CommentInput
              onSubmit={handleDiscussionComment}
              isPending={addDiscussion.isPending || addProjectAttachment.isPending}
              placeholder="Start a discussion or attach files..."
            />
          </div>
        </div>
      )}

      {/* Files */}
      {activeTab === 'files' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-[#0d1120] rounded-2xl border border-[#1a2035] p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Paperclip size={15} className="text-indigo-400" /> Project Files
            </h3>
            {attachments.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">No files yet. Attach files via the Discussion tab.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((a) => (
                  <AttachmentItem
                    key={a.id}
                    attachment={a}
                    onDelete={() => handleDeleteAttachment(a.id)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
          {milestones.some((m) => m.attachments?.length > 0) && (
            <div className="bg-[#0d1120] rounded-2xl border border-[#1a2035] p-5">
              <h3 className="text-white font-semibold mb-4">Milestone Files</h3>
              {milestones.filter((m) => m.attachments?.length > 0).map((m) => (
                <div key={m.id} className="mb-4 last:mb-0">
                  <p className="text-slate-300 text-xs font-semibold mb-2">{m.title}</p>
                  <div className="space-y-2">
                    {m.attachments.map((a) => (
                      <AttachmentItem key={a.id} attachment={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <MilestoneSidebar
        milestone={openMilestone}
        projectId={projectId}
        onClose={() => setOpenMilestone(null)}
        onMarkDone={(m) => { setMarkDoneMilestone(m); setOpenMilestone(null); }}
        isAdmin={isAdmin}
      />

      <CreateMilestoneModal
        isOpen={showAddModal}
        projectId={projectId}
        defaultStatus={addDefaultStatus}
        members={members}
        onClose={() => setShowAddModal(false)}
      />

      <StatusChangeModal
        isOpen={showMoveModal}
        milestone={pendingMilestone}
        newStatus={pendingStatus}
        projectId={projectId}
        onClose={() => { setShowMoveModal(false); setPendingMilestone(null); setPendingStatus(null); }}
      />

      <MembersModal
        isOpen={showMembersModal}
        projectId={projectId}
        members={members}
        isAdmin={isAdmin}
        onClose={() => setShowMembersModal(false)}
      />
    </div>
  );
}