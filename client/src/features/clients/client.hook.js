import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientApi from './client.api.js';
import toast from 'react-hot-toast';

export const useClients = (params) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientApi.getAll(params),
  });
};

export const useClient = (id) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => clientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Müvekkil başarıyla oluşturuldu');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil oluşturulamadı');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => clientApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client', variables.id]);
      toast.success('Müvekkil başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil güncellenemedi');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => clientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Müvekkil başarıyla silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil silinemedi');
    },
  });
};