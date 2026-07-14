'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { queryKeys } from '@/lib/queryKeys';
import type { Role } from '@/lib/types';

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => apiRequest<{ roles: Role[] }>('/api/roles'),
    staleTime: 5 * 60 * 1000, // role dossiers barely change; cache for 5 min
    select: (data) => data.roles,
  });
}
