import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createJerseyWindow,
  deleteJerseyWindow,
  listJerseyOrders,
  listJerseyWindows,
  reviewJerseyOrder,
  updateJerseyWindow,
  type CreateJerseyWindowPayload,
  type ReviewJerseyOrderPayload,
} from '@/api/jersey';
import type { ListParams } from '@/api/pagination';

export function useJerseyWindows(params?: ListParams & { tournament?: string }) {
  return useQuery({
    queryKey: ['jerseyWindows', params],
    queryFn: () => listJerseyWindows(params),
  });
}

export function useJerseyOrders(params?: ListParams & { tournament?: string }) {
  return useQuery({
    queryKey: ['jerseyOrders', params],
    queryFn: () => listJerseyOrders(params),
  });
}

export function useOpenJerseyWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJerseyWindowPayload) => createJerseyWindow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jerseyWindows'] });
    },
  });
}

export function useUpdateJerseyWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ windowId, payload }: { windowId: number; payload: Partial<CreateJerseyWindowPayload> }) =>
      updateJerseyWindow(windowId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jerseyWindows'] });
    },
  });
}

export function useDeleteJerseyWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (windowId: number) => deleteJerseyWindow(windowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jerseyWindows'] });
    },
  });
}

export function useReviewJerseyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewJerseyOrderPayload) => reviewJerseyOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jerseyOrders'] });
    },
  });
}
