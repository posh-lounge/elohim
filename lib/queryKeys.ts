import type { TaskScope } from './types';

export const queryKeys = {
  roles: ['roles'] as const,
  tasks: (scope: TaskScope) => ['tasks', scope] as const,
  me: ['me'] as const,
};
