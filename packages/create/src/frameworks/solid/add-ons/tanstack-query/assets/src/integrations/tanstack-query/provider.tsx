import { QueryClient } from '@tanstack/solid-query'

export function getContext() {
  const queryClient = new QueryClient();
  return {
    queryClient
  };
}