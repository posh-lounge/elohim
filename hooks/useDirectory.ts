'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import type { DirectoryPerson } from '@/lib/types';

export function useDirectory() {
  return useQuery({
    queryKey: ['directory'],
    queryFn: () => apiRequest<{ people: DirectoryPerson[] }>('/api/directory'),
    select: (data) => data.people,
    staleTime: 60_000,
  });
}
