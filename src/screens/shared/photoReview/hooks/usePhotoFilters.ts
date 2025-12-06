import { useState, useMemo } from 'react';
import { PhotoSubmission, PhotoReviewFilters } from '../types';

export const usePhotoFilters = (submissions: PhotoSubmission[], originalFilters: PhotoReviewFilters) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterManager, setFilterManager] = useState<string>('all');

  // Converter submissions para formato compatível com o protótipo
  const photoRecords = useMemo(() => 
    submissions.map(sub => ({
      id: sub.id,
      serviceRequestId: sub.serviceRequestId,
      clientName: sub.clientName,
      clientArea: sub.clientArea.toLowerCase() as 'norte' | 'sul' | 'leste' | 'oeste' | 'centro',
      serviceType: sub.serviceType,
      serviceDescription: sub.serviceDescription || `${sub.serviceType} - ${sub.clientName}`,
      collaboratorName: sub.collaboratorName,
      managerName: sub.sentBy || 'Não informado',
      uploadDate: sub.uploadDate,
      sentDate: sub.status === 'sent' ? (sub.sentDate || sub.uploadDate) : 'Pendente',
      beforePhotos: sub.beforePhotos,
      afterPhotos: sub.afterPhotos,
      collaboratorNotes: sub.collaboratorNotes,
      managerNotes: sub.managerNotes,
      status: sub.status,
      originalSubmission: sub // Mantém o submission original para referência
    })), [submissions]);

  const filteredRecords = useMemo(() => {
    // Primeiro filtra pelo status (backend + frontend)
    let filtered = photoRecords;
    
    if (originalFilters.status !== 'all') {
      filtered = filtered.filter(record => record.status === originalFilters.status);
    }
    
    // Depois aplica os filtros adicionais (área, gestor, busca)
    return filtered.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesArea = filterArea === 'all' || record.clientArea === filterArea;
      const matchesManager = filterManager === 'all' || record.managerName === filterManager;
      
      return matchesSearch && matchesArea && matchesManager;
    });
  }, [photoRecords, originalFilters.status, searchTerm, filterArea, filterManager]);

  const uniqueManagers = useMemo(() => 
    Array.from(new Set(photoRecords.map(r => r.managerName))), 
    [photoRecords]
  );

  return {
    searchTerm,
    filterArea,
    filterManager,
    setSearchTerm,
    setFilterArea,
    setFilterManager,
    filteredRecords,
    uniqueManagers,
    photoRecords
  };
};