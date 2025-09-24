// AdminPage Component - Main admin interface with tabbed navigation
import React, { useState } from 'react'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { UserManagement } from './UserManagement'
import { RoleManagement } from './RoleManagement'
import { SessionManagement } from './SessionManagement'
import { AuditLogViewer } from './AuditLogViewer'

type AdminTab = 'users' | 'roles' | 'sessions' | 'audit'

interface TabConfig {
  id: AdminTab
  label: string
  icon: string
  component: React.ReactNode
  requiredPermission: keyof ReturnType<typeof usePermissions>
}

export function AdminPage() {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  const tabs: TabConfig[] = [
    {
      id: 'users',
      label: 'Usuários',
      icon: '👥',
      component: <UserManagement />,
      requiredPermission: 'canCreateUsers' as keyof ReturnType<typeof usePermissions>
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: '🔐',
      component: <RoleManagement />,
      requiredPermission: 'canManageRoles' as keyof ReturnType<typeof usePermissions>
    },
    {
      id: 'sessions',
      label: 'Sessões',
      icon: '🖥️',
      component: <SessionManagement />,
      requiredPermission: 'canManageSessions' as keyof ReturnType<typeof usePermissions>
    },
    {
      id: 'audit',
      label: 'Auditoria',
      icon: '📋',
      component: <AuditLogViewer />,
      requiredPermission: 'canViewAuditLogs' as keyof ReturnType<typeof usePermissions>
    }
  ]

  // Filter tabs based on user permissions
  const availableTabs = tabs.filter(tab => {
    const hasPermission = permissions[tab.requiredPermission]
    return typeof hasPermission === 'boolean' ? hasPermission : false
  })

  // Set first available tab as default if current tab is not accessible
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id)
    }
  }, [availableTabs, activeTab])

  // Debug logging for admin access
  React.useEffect(() => {
    console.log('AdminPage: Access check', {
      isAdmin: permissions.isAdmin,
      isCompanyAdmin: permissions.isCompanyAdmin,
      permissions: permissions.permissions,
      isLoading: permissions.isLoading,
      error: permissions.error
    });
  }, [permissions]);

  if (!permissions.isAdmin && !permissions.isCompanyAdmin) {
    console.log('AdminPage: Access denied - user is not admin or company admin');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-4xl text-gray-400 mb-4">🚫</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar a área administrativa.
          </p>
        </div>
      </div>
    )
  }

  if (availableTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-4xl text-gray-400 mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Nenhuma Funcionalidade Disponível
          </h1>
          <p className="text-gray-600">
            Você não tem permissões para nenhuma funcionalidade administrativa.
          </p>
        </div>
      </div>
    )
  }

  const activeTabConfig = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <div className="text-sm text-gray-500">
                {permissions.isAdmin ? 'Administrador do Sistema' : 'Administrador da Empresa'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTabConfig?.component}
        </div>
      </div>
    </div>
  )
}