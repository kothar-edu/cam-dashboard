import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, deletePost, getPost, listPosts, updatePost, type PostPayload } from '@/api/posts';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function usePosts(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['posts', activeTenantId, params],
    queryFn: () => listPosts(params),
    enabled: !!activeTenantId,
  });
}

export function usePost(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['post', activeTenantId, id],
    queryFn: () => getPost(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: PostPayload) => createPost(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts', activeTenantId] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PostPayload }) => updatePost(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['posts', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['post', activeTenantId, variables.id] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts', activeTenantId] }),
  });
}
