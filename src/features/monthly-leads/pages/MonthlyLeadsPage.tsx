import { MonthlyLeadsPanel } from '../components/MonthlyLeadsPanel';

export function MonthlyLeadsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MonthlyLeadsPanel />
      </div>
    </div>
  );
}
