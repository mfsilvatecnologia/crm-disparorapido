// useCompanies Hook - Company data management with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCompanies,
  fetchCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  fetchCompanyStats,
  fetchCompanyContacts,
  createCompanyContact,
  updateCompanyContact,
  deleteCompanyContact,
  fetchCompanyActivities,
  addCompanyActivity,
  updateCompaniesBulk,
  deleteCompaniesBulk,
  importCompanies,
  exportCompanies,
  enrichCompany,
  searchCompanies,
  getCompanySuggestions,
  findDuplicateCompanies,
  mergeCompanies
} from '../services/companies'
import type {
  CompanyFilters,
  CreateCompanyData,
  UpdateCompanyData,
  CreateContactData,
  UpdateContactData,
  CompanyActivity,
  CompanyEnrichmentRequest
} from '../types/companies'

// Main companies hook with filters
export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => fetchCompanies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Single company hook
export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompany(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Company statistics
export function useCompanyStats(filters?: Partial<CompanyFilters>) {
  return useQuery({
    queryKey: ['companies', 'stats', filters],
    queryFn: () => fetchCompanyStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Company mutations
export function useCompanyMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
      queryClient.setQueryData(['company', updatedCompany.id], updatedCompany)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<UpdateCompanyData> }) =>
      updateCompaniesBulk(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteCompaniesBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
    },
  })

  const importMutation = useMutation({
    mutationFn: importCompanies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
    },
  })

  const exportMutation = useMutation({
    mutationFn: exportCompanies,
  })

  const enrichMutation = useMutation({
    mutationFn: enrichCompany,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['company', result.companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })

  const mergeMutation = useMutation({
    mutationFn: ({ primaryId, duplicateIds }: { primaryId: string; duplicateIds: string[] }) =>
      mergeCompanies(primaryId, duplicateIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
    },
  })

  return {
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
    bulkUpdateCompanies: bulkUpdateMutation.mutateAsync,
    bulkDeleteCompanies: bulkDeleteMutation.mutateAsync,
    importCompanies: importMutation.mutateAsync,
    exportCompanies: exportMutation.mutateAsync,
    enrichCompany: enrichMutation.mutateAsync,
    mergeCompanies: mergeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
    isEnriching: enrichMutation.isPending,
    isMerging: mergeMutation.isPending,
  }
}

// Company contacts
export function useCompanyContacts(companyId: string) {
  return useQuery({
    queryKey: ['company', companyId, 'contacts'],
    queryFn: () => fetchCompanyContacts(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCompanyContactMutations(companyId: string) {
  const queryClient = useQueryClient()
  const contactsQueryKey = ['company', companyId, 'contacts']

  const createMutation = useMutation({
    mutationFn: createCompanyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsQueryKey })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCompanyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsQueryKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => deleteCompanyContact(companyId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsQueryKey })
    },
  })

  return {
    createContact: createMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

// Company activities
export function useCompanyActivities(companyId: string) {
  return useQuery({
    queryKey: ['company', companyId, 'activities'],
    queryFn: () => fetchCompanyActivities(companyId),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes for activities
  })
}

export function useCompanyActivityMutations(companyId: string) {
  const queryClient = useQueryClient()
  const activitiesQueryKey = ['company', companyId, 'activities']

  const addActivityMutation = useMutation({
    mutationFn: (activity: Omit<CompanyActivity, 'id' | 'companyId' | 'data'>) =>
      addCompanyActivity(companyId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKey })
    },
  })

  return {
    addActivity: addActivityMutation.mutateAsync,
    isAddingActivity: addActivityMutation.isPending,
  }
}

// Company search
export function useCompanySearch(query: string, limit = 10) {
  return useQuery({
    queryKey: ['companies', 'search', query, limit],
    queryFn: () => searchCompanies(query, limit),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search
  })
}

// Company suggestions for autocomplete
export function useCompanySuggestions(partialName: string, limit = 5) {
  return useQuery({
    queryKey: ['companies', 'suggestions', partialName, limit],
    queryFn: () => getCompanySuggestions(partialName, limit),
    enabled: partialName.length >= 2,
    staleTime: 60 * 1000, // 1 minute for suggestions
  })
}

// Company duplicates
export function useCompanyDuplicates(companyId?: string) {
  return useQuery({
    queryKey: ['companies', 'duplicates', companyId],
    queryFn: () => findDuplicateCompanies(companyId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Combined hook for company management
export function useCompanyManagement(filters?: CompanyFilters) {
  const companiesQuery = useCompanies(filters)
  const statsQuery = useCompanyStats(filters)
  const mutations = useCompanyMutations()

  return {
    // Data
    companies: companiesQuery.data?.companies || [],
    total: companiesQuery.data?.total || 0,
    hasMore: companiesQuery.data?.hasMore || false,
    stats: statsQuery.data,

    // Loading states
    isLoading: companiesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    error: companiesQuery.error || statsQuery.error,

    // Actions
    ...mutations,

    // Refresh
    refetch: () => {
      companiesQuery.refetch()
      statsQuery.refetch()
    },
  }
}