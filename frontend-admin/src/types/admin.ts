/**
 * Admin Panel Types
 */

export interface User {
  id: string;
  email: string;
  businessName: string;
  phone?: string;
  gstNumber?: string;
  planType: 'FREE' | 'PREMIUM' | 'PRO' | 'UNLIMITED';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  apiKeys?: ApiKey[];
  stateAccess?: StateAccessMatrix[];
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  createdAt: string;
}

export interface ChartDataPoint {
  date: string;
  requests: number;
  avgResponseTime: number;
}

export interface HeatMapCell {
  hour: number; // 0-23
  day: number; // 0-6 (0=Sun)
  value: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface DashboardStats {
  totalUsers: number;
  usersChange: number;
  totalRequestsToday: number;
  requestsChange: number;
  avgResponseTime: number;
  responseTimeChange: number;
  errorRate: number;
  errorRateChange: number;
}

export interface StateAccessMatrix {
  stateId: string;
  stateName: string;
  hasAccess: boolean;
}

export interface TableColumn<T> {
  header: string;
  accessorKey?: keyof T | string;
  id?: string;
  cell?: (info: { row: { original: T } }) => React.ReactNode;
}
