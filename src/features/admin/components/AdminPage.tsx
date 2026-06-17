import { Tabs, TabsContent } from '@/shared/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { AdminAffiliatesTab } from './AdminAffiliatesTab';
import { AdminClientsTab } from './AdminClientsTab';
import { AdminFinancialTab } from './AdminFinancialTab';
import { AdminIntegrationsTab } from './AdminIntegrationsTab';
import { AdminHomeTab } from './AdminHomeTab';

export const ADMIN_TABS = ['home', 'afiliados', 'clientes', 'financeiro', 'integracoes'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

export function isAdminTab(value: string | null): value is AdminTab {
  return ADMIN_TABS.includes(value as AdminTab);
}

export function AdminPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: AdminTab = isAdminTab(tabParam) ? tabParam : 'home';

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gestão de clientes, financeiro, integrações e afiliados
        </p>
      </div>

      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="home">
            <AdminHomeTab />
          </TabsContent>
          <TabsContent value="afiliados">
            <AdminAffiliatesTab />
          </TabsContent>
          <TabsContent value="clientes">
            <AdminClientsTab />
          </TabsContent>
          <TabsContent value="financeiro">
            <AdminFinancialTab />
          </TabsContent>
          <TabsContent value="integracoes">
            <AdminIntegrationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
