// app/projects/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, FolderKanban, Calendar, Users, CheckCircle2, 
  Loader2, X, Search, Filter, MoreVertical 
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'sonner';
import { useProjects, useCreateProject, type Project } from '@/hooks/useProjects';
import { Modal } from '@/components/ui/modal';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  on_hold: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

function progressPct(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const createProject = useCreateProject();
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    member_ids: [] as number[],
  });
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    try {
      await createProject.mutateAsync(form);
      onClose();
      setForm({ name: '', description: '', start_date: '', end_date: '', member_ids: [] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg mx-auto p-6 bg-[#0d1120] rounded-2xl border border-[#1a2035]" showCloseButton={false}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-bold text-lg">New Project</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2035] transition">
          <X size={16} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Project Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter project name"
            required
            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the project"
            rows={3}
            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 outline-none text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-500 text-xs mb-1 block">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-slate-500 text-xs mb-1 block">End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Add Team Members</label>
          <div className="flex gap-2">
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-[#080c18] border border-[#1a2035] rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => {
                // Search users API call
              }}
              className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 transition"
            >
              <Search size={16} />
            </button>
          </div>
          {form.member_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.member_ids.map((id) => (
                <span key={id} className="flex items-center gap-1 bg-[#1a2035] px-2 py-1 rounded-lg text-xs text-slate-300">
                  User {id}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, member_ids: form.member_ids.filter(m => m !== id) })}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#1a2035]">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#1a2035] rounded-xl text-slate-400 hover:bg-[#1a2035] text-sm transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProject.isPending}
            className="px-5 py-2 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {createProject.isPending ? (
              <><Loader2 size={14} className="animate-spin inline mr-2" /> Creating…</>
            ) : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const projects = data?.projects ?? [];
  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusOptions = ['all', 'active', 'on_hold', 'completed', 'archived'];

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track all your projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 transition font-medium"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-[#0d1120] border border-[#1a2035] rounded-xl pl-10 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-sm transition capitalize whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#0d1120] border border-[#1a2035] text-slate-400 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} height={220} className="rounded-2xl" baseColor="#0d1120" highlightColor="#1a2035" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1120] rounded-2xl border border-[#1a2035] p-16 text-center">
          <FolderKanban size={44} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-400 mb-1">No projects found</p>
          <button onClick={() => setShowCreateModal(true)} className="text-indigo-400 text-sm hover:underline">
            Create your first project →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const pct = progressPct(p.done_count, p.milestone_count);
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group bg-[#0d1120] rounded-2xl border border-[#1a2035] p-5 hover:border-indigo-500/60 transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-snug group-hover:text-indigo-300 transition line-clamp-1">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[p.status]}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-slate-500" />
                    <span className="text-slate-400 text-xs">{p.member_count} members</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>{p.done_count}/{p.milestone_count} milestones</span>
                    <span className="text-indigo-400 font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a2035] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-[#1a2035]">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>{p.done_count} done</span>
                  </div>
                  {p.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{new Date(p.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}