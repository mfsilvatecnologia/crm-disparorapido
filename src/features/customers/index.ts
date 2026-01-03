export type { Customer, CustomerFilters, CustomerSegment, CustomerStatus } from './types/customer';
export type { TimelineEvent, HealthScoreResponse } from './types/timeline';

export {
  useCustomers,
  useCustomer,
  useUpdateCustomer,
  useUpdateCustomerStatus,
  useCustomerTimeline,
  useHealthScore,
} from './api/customers';

export { CustomersPage } from './pages/CustomersPage';
export { CustomerDetailPage } from './pages/CustomerDetailPage';
