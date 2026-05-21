import type { User, ComputedPermissions } from '@/features/authentication/types/auth';

function normalizeRole(user: User | null): string {
  if (!user) return 'usuario';
  const r = user.role?.toString().trim().toLowerCase();
  return r || 'usuario';
}

/**
 * Deriva permissões do CRM a partir do papel em `empresa_user` (ex.: admin, gerente).
 * Alinhado à matriz em specs/ant/001-definir-os-acessos (sessão web implícita no CRM).
 */
export function derivePermissionsFromUser(user: User | null): ComputedPermissions {
  const role = normalizeRole(user);
  const isAdmin = role === 'admin';
  const isManager =
    role === 'gerente' || role === 'org_admin' || role === 'empresa_admin' || role === 'empresa admin';

  const elevated = isAdmin || isManager;

  if (!elevated) {
    return {
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewAllLeads: false,
      canCreateLeads: false,
      canEditLeads: false,
      canDeleteLeads: false,
      canManageCampaigns: false,
      canViewReports: false,
      canAccessAdmin: false,
      canManageSessions: false,
      canViewAuditLogs: false,
      scopeToOrganization: true,
    };
  }

  return {
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: isAdmin,
    canViewAllLeads: true,
    canCreateLeads: true,
    canEditLeads: true,
    canDeleteLeads: true,
    canManageCampaigns: true,
    canViewReports: true,
    canAccessAdmin: true,
    canManageSessions: true,
    canViewAuditLogs: isAdmin,
    scopeToOrganization: !isAdmin,
  };
}
