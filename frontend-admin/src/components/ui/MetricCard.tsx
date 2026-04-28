import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

export default function MetricCard({ title, value, change, icon, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  const isPositive = change && change > 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}% from last period
          </p>
        )}
      </div>
    </div>
  );
}
