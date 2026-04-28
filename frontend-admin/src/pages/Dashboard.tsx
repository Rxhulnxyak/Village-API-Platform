import React from 'react';
import { Users, Activity, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import { useDashboardStats, useRequestsChart, usePlanDistribution, useTopStatesByVillage } from '../hooks/useDashboard';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: reqData } = useRequestsChart(7);
  const { data: planData } = usePlanDistribution();
  const { data: topStates } = useTopStatesByVillage();

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.usersChange}
          icon={<Users size={24} />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Requests Today"
          value={(stats?.totalRequestsToday || 0).toLocaleString()}
          change={stats?.requestsChange}
          icon={<Activity size={24} />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${stats?.avgResponseTime || 0}ms`}
          change={stats?.responseTimeChange}
          icon={<Clock size={24} />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Error Rate"
          value={`${((stats?.errorRate || 0) * 100).toFixed(2)}%`}
          change={stats?.errorRateChange}
          icon={<AlertTriangle size={24} />}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">API Requests (7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reqData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top States by Coverage</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStates} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis type="category" dataKey="state" width={100} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {planData?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
