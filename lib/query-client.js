import { QueryClient } from "@tanstack/react-query";

// This creates the 'manager' that handles your data fetching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
