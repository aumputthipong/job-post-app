import { QueryClient } from "@tanstack/react-query";

// Firestore listeners (4.3) will write straight into this cache, so screens
// read with useQuery and get realtime updates with no explicit refetch.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});
