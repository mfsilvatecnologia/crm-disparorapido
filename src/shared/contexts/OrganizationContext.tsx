import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/client';
import { useAuth } from './AuthContext';
import type { Organization } from '../types';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
  refreshOrganization: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const CURRENT_ORG_KEY = 'current_organization_id';

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  // Fetch organizations list
  const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiClient.getOrganizations(),
    enabled: isAuthenticated,
  });

  // Fetch current organization details
  const { data: currentOrganization, isLoading: isLoadingCurrentOrg, refetch: refetchCurrentOrg } = useQuery({
    queryKey: ['organization', currentOrgId],
    queryFn: () => apiClient.getOrganization(currentOrgId!),
    enabled: !!currentOrgId && isAuthenticated,
  });

  const isLoading = isLoadingOrgs || isLoadingCurrentOrg;

  // Initialize current organization
  useEffect(() => {
    if (!isAuthenticated || !user || organizations.length === 0) {
      return;
    }

    // Try to restore previously selected organization
    const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
    const validOrgId = savedOrgId && organizations.find(org => org.id === savedOrgId) 
      ? savedOrgId 
      : user.organizationId; // Fallback to user's organization

    setCurrentOrgId(validOrgId);
    apiClient.setOrganizationId(validOrgId);
  }, [isAuthenticated, user, organizations]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) {
      console.error('Organization not found:', orgId);
      return;
    }

    setCurrentOrgId(orgId);
    apiClient.setOrganizationId(orgId);
    localStorage.setItem(CURRENT_ORG_KEY, orgId);
  };

  const refreshOrganization = () => {
    refetchCurrentOrg();
  };

  const value: OrganizationContextType = {
    currentOrganization: currentOrganization || null,
    organizations,
    isLoading,
    switchOrganization,
    refreshOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}