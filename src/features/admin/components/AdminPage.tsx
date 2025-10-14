// AdminPage Component - Main admin interface with tabbed navigation
// COMENTADO: Sistema de permissões será implementado no backend
import React, { useState } from 'react'
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
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  // TEMPORÁRIO: Todas as abas estão disponíveis até backend implementar permissões
  const tabs: TabConfig[] = [
    {
      id: 'users',
      label: 'Usuários',
      icon: '👥',
      component: <UserManagement />
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: '🔑',
      component: <RoleManagement />
    },
    {
      id: 'sessions',
      label: 'Sessões',
      icon: '🔗',
      component: <SessionManagement />
    },
    {
      id: 'audit',
      label: 'Auditoria',
      icon: '📋',
      component: <AuditLogViewer />
    }
  ]

  const activeTabConfig = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerenciar usuários, roles e configurações do sistema
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {/* TEMPORÁRIO: Remover indicação de role específica */}
            Administrador
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {activeTabConfig?.component}
      </div>
    </div>
  )
}

// TODO: Quando o backend implementar permissões, descomentar:
// - Importar usePermissions
// - Adicionar requiredPermission aos tabs
// - Filtrar tabs baseado em permissions[tab.requiredPermission]
// - Adicionar verificação de isAdmin/isCompanyAdmin
// - Reativar debug logging do useEffect