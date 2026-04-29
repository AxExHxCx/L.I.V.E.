import { QueryClient } from "@tanstack/react-query";

// Renamed to queryClientInstance to match your App.jsx
export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
