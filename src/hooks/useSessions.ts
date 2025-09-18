import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '@/lib/api/client'

export function useSessions() {
  const { token } = useAuth()

  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!token) return []
      return await apiClient.getSessions()
    },
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  return {
    sessions: sessions || [],
    isLoading,
    error,
    refetch
  }
}