import { useState } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { Service, Category, ServiceFormData } from '../types';

// Este hook gerencia o 'actionLoading' e todas as chamadas de API (POST, PUT, DELETE)
export const useCatalogMutations = (refetch: () => void) => {
  const [actionLoading, setActionLoading] = useState(false);

  // --- MUTAÇÕES DE SERVIÇO ---

  const saveService = async (
    payload: ServiceFormData,
    editingService: Service | null
  ): Promise<boolean> => {

    setActionLoading(true);
    const loadingToast = toast.loading(
      editingService ? 'Atualizando serviço...' : 'Criando serviço...'
    );

    try {
      // ✅ Normalizar payload: converter category_id para número e adicionar status
      const normalizedPayload = {
        ...payload,
        category_id: Number(payload.category_id),
        price: Number(payload.price),
        duration_value: Number(payload.duration_value),
        // ✅ Garantir status 'active' ao criar novo serviço
        ...(editingService ? {} : { status: 'active' })
      };

      if (editingService) {
        await api.put(`/service-catalog/${editingService.id}`, normalizedPayload);
        toast.success('Serviço atualizado!');
      } else {
        await api.post(`/service-catalog`, normalizedPayload);
        toast.success('Serviço criado!');
      }
      await refetch();
      return true;

    } catch (err: any) {
      console.error("Erro ao salvar serviço:", err);
      const errorMessage = err.response?.data?.message || "Não foi possível salvar o serviço.";
      toast.error("Erro ao salvar", { description: errorMessage });
      return false;
    } finally {
      toast.dismiss(loadingToast);
      setActionLoading(false);
    }
  };

  const toggleServiceStatus = async (service: Service): Promise<Service | null> => {
    if (actionLoading) return null;

    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    setActionLoading(true);
    const loadingToast = toast.loading(`${newStatus === 'active' ? 'Ativando' : 'Desativando'} serviço...`);

    try {
      await api.put(`/service-catalog/${service.id}/status`, { status: newStatus });
      toast.success(`Serviço ${newStatus === 'active' ? 'ativado' : 'desativado'}!`);
      // Retorna o serviço atualizado para o componente atualizar o estado local
      return { ...service, status: newStatus };
    } catch (err: any) {
      console.error("Erro ao mudar status:", err);
      const errorMessage = err.response?.data?.message || "Não foi possível atualizar o status.";
      toast.error("Erro ao atualizar status", { description: errorMessage });
      return null;
    } finally {
      toast.dismiss(loadingToast);
      setActionLoading(false);
    }
  };

  const deleteService = async (service: Service): Promise<boolean> => {
    if (actionLoading) return false;

    setActionLoading(true);
    const loadingToast = toast.loading('Excluindo serviço...');

    try {
      await api.delete(`/service-catalog/${service.id}`);
      toast.success('Serviço excluído!');
      await refetch();
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
      const description = err.response?.data?.message || "Não foi possível excluir o serviço.";
      toast.error("Erro ao excluir", { description });
      return false;
    } finally {
      toast.dismiss(loadingToast);
      setActionLoading(false);
    }
  };

  // --- MUTAÇÕES DE CATEGORIA ---

  const saveCategory = async (
    categoryFormData: { name: string; color: string },
    editingCategory: Category | null
  ): Promise<boolean> => {
    setActionLoading(true);
    const actionText = editingCategory ? 'Atualizando' : 'Criando';
    const loadingToast = toast.loading(`${actionText} categoria...`);

    try {
      if (editingCategory) {
        await api.put(`/service-catalog/categories/${editingCategory.id}`, categoryFormData);
        toast.success('Categoria atualizada!');
      } else {
        await api.post(`/service-catalog/categories`, categoryFormData);
        toast.success('Categoria criada!');
      }
      await refetch();
      return true;
    } catch (err: any) {
      console.error("Erro ao salvar categoria:", err);
      const errorMessage = err.response?.data?.message || "Não foi possível salvar a categoria.";
      toast.error("Erro ao salvar", { description: errorMessage });
      return false;
    } finally {
      toast.dismiss(loadingToast);
      setActionLoading(false);
    }
  };

  const deleteCategory = async (category: Category): Promise<boolean> => {
    if (actionLoading) return false;

    setActionLoading(true);
    const loadingToast = toast.loading('Excluindo categoria...');

    try {
      await api.delete(`/service-catalog/categories/${category.id}`);
      toast.success('Categoria excluída!');
      await refetch();
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar categoria:", err);
      const description = err.response?.data?.message || "Não foi possível excluir a categoria.";
      toast.error("Erro ao excluir", { description });
      return false;
    } finally {
      toast.dismiss(loadingToast);
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    saveService,
    toggleServiceStatus,
    deleteService,
    saveCategory,
    deleteCategory,
  };
};