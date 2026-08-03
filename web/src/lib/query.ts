import { QueryClient, type QueryClientConfig } from '@tanstack/react-query'

const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
}

let globalQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (typeof globalQueryClient === 'undefined') {
    globalQueryClient = new QueryClient(queryClientOptions)
  }
  return globalQueryClient
}
