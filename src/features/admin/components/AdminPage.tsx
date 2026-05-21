import { AdminAffiliatesTab } from './AdminAffiliatesTab';

export function AdminPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="text-sm text-gray-600 mt-1">Gestão de afiliados e repasses</p>
      </div>

      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        <AdminAffiliatesTab />
      </div>
    </div>
  );
}
