import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api';
import { useNotificationStore } from '../store';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: adminApi.getUsers,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore(s => s.addToast);

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return adminApi.updateUserStatus(userId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast('User status updated successfully', 'success');
    },
    onError: () => {
      addToast('Failed to update user status', 'error');
    },
  });
};
