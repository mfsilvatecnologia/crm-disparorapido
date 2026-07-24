import { Tabs, TabsContent } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminAffiliatesTab } from './AdminAffiliatesTab';
import { AdminClientsTab } from './AdminClientsTab';
import { AdminFinancialTab } from './AdminFinancialTab';
import { AdminIntegrationsTab } from './AdminIntegrationsTab';
import { AdminHomeTab } from './AdminHomeTab';
import { AdminReportsTab } from './AdminReportsTab';
import { AdminPrivacyProvider, useAdminPrivacy } from '../context/AdminPrivacyContext';

export const ADMIN_TABS = ['home', 'afiliados', 'clientes', 'financeiro', 'relatorios', 'integracoes'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

export function isAdminTab(value: string | null): value is AdminTab {
  return ADMIN_TABS.includes(value as AdminTab);
}

function AdminPageHeader() {
  const { hidden, toggle } = useAdminPrivacy();

  return (
    <div className="flex items-center gap-2 bg-white border-b border-gray-200 px-6 py-4">
      <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-slate-500 hover:text-slate-800"
        onClick={toggle}
        aria-label={hidden ? 'Mostrar informações sensíveis' : 'Ocultar informações sensíveis'}
        title={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      >
        {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>
    </div>
  );
}

export function AdminPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: AdminTab = isAdminTab(tabParam) ? tabParam : 'home';

  return (
    <AdminPrivacyProvider>
      <div className="h-full flex flex-col">
        <AdminPageHeader />

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
            <TabsContent value="relatorios">
              <AdminReportsTab />
            </TabsContent>
            <TabsContent value="integracoes">
              <AdminIntegrationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminPrivacyProvider>
  );
}
