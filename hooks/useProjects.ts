// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  project_key: string;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived' | 'on_hold';
  start_date: string | null;
  end_date: string | null;
  created_by_user_id: number;
  created_by_role_id: number;
  created_at: string;
  updated_at: string;
  member_count: number;
  milestone_count: number;
  done_count: number;
  created_by_name: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  joined_at: string;
  invited_by_user_id: number;
  name: string;
  email: string;
  phone: string;
  role_key: string;
  role_label: string;
  position: string | null;
}

export interface MilestoneComment {
  id: number;
  milestone_id: number;
  user_id: number;
  role_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  name: string;
  role_label: string;
}

export interface MilestoneAttachment {
  id: number;
  milestone_id: number;
  user_id: number;
  role_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  is_compressed: number;
  compressed_size: number | null;
  created_at: string;
  name: string;
}

export interface MilestoneHistory {
  id: number;
  milestone_id: number;
  user_id: number;
  old_status: string | null;
  new_status: string | null;
  comment: string | null;
  created_at: string;
  name: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee_user_id: number | null;
  created_by_user_id: number;
  created_by_role_id: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee_name: string | null;
  created_by_name: string;
  created_by_role_label: string;
  comments: MilestoneComment[];
  attachments: MilestoneAttachment[];
  history: MilestoneHistory[];
}

export type MilestoneStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface ProjectDiscussion {
  id: number;
  project_id: number;
  user_id: number;
  role_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  name: string;
  role_label: string;
}

export interface ProjectAttachment {
  id: number;
  project_id: number;
  user_id: number;
  role_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  is_compressed: number;
  compressed_size: number | null;
  created_at: string;
  name: string;
}

export interface ProjectDetail {
  project: Project;
  milestones: Milestone[];
  discussions: ProjectDiscussion[];
  attachments: ProjectAttachment[];
  members: ProjectMember[];
}

// ─── Query Hooks ────────────────────────────────────────────────────────────

export const useProjects = (scope?: string, status?: string) => {
  let url = '/api/projects';
  const params = new URLSearchParams();
  if (scope) params.append('scope', scope);
  if (status) params.append('status', status);
  if (params.toString()) url += `?${params.toString()}`;

  return useQuery({
    queryKey: ['projects', scope, status],
    queryFn: () => apiRequest<{ projects: Project[] }>(url, {
      method: 'GET',
    }),
  });
};

export const useProjectDetail = (projectId: number) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiRequest<ProjectDetail>(`/api/projects/${projectId}`, {
      method: 'GET',
    }),
    enabled: !!projectId,
  });
};

export const useProjectMembers = (projectId: number) => {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => apiRequest<{ members: ProjectMember[] }>(`/api/projects/${projectId}/members`, {
      method: 'GET',
    }),
    enabled: !!projectId,
  });
};

export const useAvailableUsers = (projectId: number, search?: string) => {
  let url = `/api/projects/${projectId}/available-users`;
  if (search && search.length > 1) {
    url += `?search=${encodeURIComponent(search)}`;
  }

  return useQuery({
    queryKey: ['available-users', projectId, search],
    queryFn: () => apiRequest<{ users: any[] }>(url, {
      method: 'GET',
    }),
    enabled: !!projectId && !!search && search.length > 1,
  });
};

// ─── Mutation Hooks ────────────────────────────────────────────────────────

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest<{ id: number; project_key: string }>('/api/projects', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
    },
    onError: (err) => toast.error('Failed to create project', {
      description: (err as Error).message,
    }),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      apiRequest<{ ok: boolean }>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully!');
    },
    onError: (err) => toast.error('Failed to update project', {
      description: (err as Error).message,
    }),
  });
};

export const useAddProjectMembers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, user_ids, role }: { projectId: number; user_ids: number[]; role?: string }) =>
      apiRequest<{ added: number[]; count: number }>(`/api/projects/${projectId}/members`, {
        method: 'POST',
        body: { user_ids, role },
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      toast.success('Members added successfully!');
    },
    onError: (err) => toast.error('Failed to add members', {
      description: (err as Error).message,
    }),
  });
};

export const useUpdateProjectMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: number; userId: number; role: string }) =>
      apiRequest<{ ok: boolean }>(`/api/projects/${projectId}/members/${userId}`, {
        method: 'PATCH',
        body: { role },
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', vars.projectId] });
      toast.success('Member role updated!');
    },
    onError: (err) => toast.error('Failed to update member role', {
      description: (err as Error).message,
    }),
  });
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: number; userId: number }) =>
      apiRequest<{ ok: boolean }>(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      toast.success('Member removed!');
    },
    onError: (err) => toast.error('Failed to remove member', {
      description: (err as Error).message,
    }),
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...data }: { projectId: number; [key: string]: any }) =>
      apiRequest<{ id: number }>(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      toast.success('Milestone created!');
    },
    onError: (err) => toast.error('Failed to create milestone', {
      description: (err as Error).message,
    }),
  });
};

export const useUpdateMilestoneStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, status, comment }: { milestoneId: number; status: string; comment?: string }) =>
      apiRequest<{ ok: boolean }>(`/api/milestones/${milestoneId}/status`, {
        method: 'PATCH',
        body: { status, comment },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Milestone status updated!');
    },
    onError: (err) => toast.error('Failed to update milestone status', {
      description: (err as Error).message,
    }),
  });
};

export const useAddMilestoneComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, comment }: { milestoneId: number; comment: string }) =>
      apiRequest<{ id: number }>(`/api/milestones/${milestoneId}/comments`, {
        method: 'POST',
        body: { comment },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Comment added!');
    },
    onError: (err) => toast.error('Failed to add comment', {
      description: (err as Error).message,
    }),
  });
};

export const useAddMilestoneAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, file }: { milestoneId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`/api/milestones/${milestoneId}/attachments`, {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload');
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('File uploaded successfully!');
    },
    onError: (err) => toast.error('Failed to upload file', {
      description: (err as Error).message,
    }),
  });
};

export const useAddProjectDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, comment }: { projectId: number; comment: string }) =>
      apiRequest<{ id: number }>(`/api/projects/${projectId}/discussions`, {
        method: 'POST',
        body: { comment },
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      toast.success('Discussion comment added!');
    },
    onError: (err) => toast.error('Failed to add discussion comment', {
      description: (err as Error).message,
    }),
  });
};

export const useAddProjectAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`/api/projects/${projectId}/attachments`, {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload');
        return data;
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      toast.success('File uploaded successfully!');
    },
    onError: (err) => toast.error('Failed to upload file', {
      description: (err as Error).message,
    }),
  });
};

export const useDeleteProjectAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, attachmentId }: { projectId: number; attachmentId: number }) =>
      apiRequest<{ ok: boolean }>(`/api/projects/${projectId}/attachments?attachmentId=${attachmentId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      toast.success('File deleted!');
    },
    onError: (err) => toast.error('Failed to delete file', {
      description: (err as Error).message,
    }),
  });
};