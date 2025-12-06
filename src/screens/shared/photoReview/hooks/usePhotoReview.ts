import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { PhotoSubmission, PhotoReviewFilters } from '../types';

export const usePhotoReview = () => {
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PhotoReviewFilters>({
    status: 'pending', // Padrão: mostrar pendentes
    search: ''
  });

  // 1. BUSCAR DADOS
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      // Monta a query string baseada nos filtros
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/photo-review?${params.toString()}`);
      setSubmissions(response.data);

    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      toast.error("Erro ao carregar galeria de fotos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 2. APROVAR / ENVIAR AO CLIENTE - TAMBÉM USADA PARA EDITAR
  const approveSubmission = async (id: string, notes: string) => {
    try {
      let cleanId = id;
      console.log("Tentando aprovar/editar ID:", cleanId);

      await api.put(`/photo-review/${cleanId}/send`, { notes });
      
      return true;
    } catch (error: any) {
      console.error("Erro no approveSubmission:", error);
      const msg = error.response?.data?.message || "Erro ao enviar/editar fotos.";
      toast.error(msg);
      return false;
    }
  };
  
  // 3. EXCLUIR UMA FOTO ESPECÍFICA (mesmo após envio)
  const deletePhoto = async (photoUrl: string, submissionId: string, isSent: boolean = false) => {
    try {
      await api.post(`/photo-review/photo/delete`, { 
        photoUrl, 
        submissionId,
        isSent // Flag para indicar se é um envio já realizado
      });
      
      // Atualiza estado local para feedback instantâneo
      setSubmissions(prev => prev.map(sub => {
        if (sub.id === submissionId) {
            return {
                ...sub,
                beforePhotos: sub.beforePhotos.filter(p => p !== photoUrl),
                afterPhotos: sub.afterPhotos.filter(p => p !== photoUrl)
            };
        }
        return sub;
      }));
      
      toast.success("Foto excluída.");
      return true;
    } catch (error) {
      toast.error("Erro ao excluir foto.");
      return false;
    }
  };

  // Efeito para carregar quando o filtro muda
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Stats calculados no front para os cards
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    sent: submissions.filter(s => s.status === 'sent').length
  };

  return {
    submissions,
    loading,
    filters,
    setFilters,
    stats,
    approveSubmission, // Única função para enviar e editar
    deletePhoto,
    refresh: fetchSubmissions
  };
};