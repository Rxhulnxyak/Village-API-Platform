/**
 * Mock API Layer — Interface-First Development
 * WHY MOCK FIRST: Frontend and backend developed simultaneously.
 */
import { DashboardStats, ChartDataPoint, User } from '../types/admin';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(Math.random() * 500 + 300);
    return {
      totalUsers: 142,
      usersChange: 12.5,
      totalRequestsToday: 145020,
      requestsChange: 5.2,
      avgResponseTime: 42,
      responseTimeChange: -2.1,
      errorRate: 0.05,
      errorRateChange: -0.01
    };
  },
  
  getRequestsChart: async (days: number): Promise<ChartDataPoint[]> => {
    await delay(400);
    const data: ChartDataPoint[] = [];
    for(let i=days; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // simulate weekend dips
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const base = isWeekend ? 50000 : 150000;
      data.push({
        date: d.toISOString().split('T')[0],
        requests: base + Math.random() * 20000,
        avgResponseTime: 40 + Math.random() * 15
      });
    }
    return data;
  },

  getUsers: async (): Promise<User[]> => {
    await delay(600);
    return [
      { id: '1', email: 'tech@swiggy.in', businessName: 'Swiggy', planType: 'UNLIMITED', status: 'ACTIVE', createdAt: '2023-01-15T10:00:00Z' },
      { id: '2', email: 'logistics@delhivery.com', businessName: 'Delhivery', planType: 'PRO', status: 'ACTIVE', createdAt: '2023-02-20T14:30:00Z' },
      { id: '3', email: 'dev@zepto.com', businessName: 'Zepto', planType: 'PREMIUM', status: 'PENDING', createdAt: '2023-11-10T09:15:00Z' }
    ];
  }
};
