import { useState } from 'react';
import { serviceRequestApi } from '../services/serviceRequestApi';
import type { ServiceRequest } from '../types';
import { toast } from 'sonner';

export const useServiceRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (request: ServiceRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const newRequest = await serviceRequestApi.create(request);
      
      toast.success('Solicitação criada com sucesso!');
      return newRequest;
    } catch (err) {
      const errorMessage = 'Erro ao criar solicitação. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createRequest,
    isSubmitting,
    error,
  };
};