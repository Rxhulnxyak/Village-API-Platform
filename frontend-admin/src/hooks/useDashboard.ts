import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api';

// Refetch every 60s
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: adminApi.getDashboardStats,
    refetchInterval: 60000
  });
};

export const useRequestsChart = (days: number) => {
  return useQuery({
    queryKey: ['requestsChart', days],
    queryFn: () => adminApi.getRequestsChart(days),
    staleTime: 300000 
  });
};

// 1hr stale time
export const usePlanDistribution = () => {
  return useQuery({
    queryKey: ['planDistribution'],
    queryFn: adminApi.getPlanDistribution,
    staleTime: 3600000
  });
};

// Infinity stale time (states never change)
export const useTopStatesByVillage = () => {
  return useQuery({
    queryKey: ['topStates'],
    queryFn: adminApi.getTopStates,
    staleTime: 3600000 // 1 hour
  });
};
