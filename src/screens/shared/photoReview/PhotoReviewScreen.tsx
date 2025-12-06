import { useState, useEffect } from 'react';
import ScreenHeader from '../../public/ScreenHeader';
import { toast } from 'sonner';
import { usePhotoReview } from './hooks/usePhotoReview';
import { usePhotoFilters } from './hooks/usePhotoFilters';
import { PhotoStats } from './components/PhotoStats';
import { PhotoFilters } from './components/PhotoFilters';
import { PhotoList } from './components/PhotoList';
import { PhotoDetailDialog } from './components/PhotoDetailDialog';
import { PhotoViewerDialog } from './components/PhotoViewerDialog';
import { PhotoSubmission } from './types';

interface PhotoReviewScreenProps {
  onBack?: () => void;
  userRole: 'admin' | 'manager';
}

export default function PhotoReviewScreen({ onBack, userRole }: PhotoReviewScreenProps) {
  const { 
    submissions, 
    loading, 
    filters: originalFilters, 
    setFilters: setOriginalFilters,
    stats, 
    approveSubmission,
    deletePhoto,
    refresh 
  } = usePhotoReview(); // Removi editSubmission daqui

  const {
    searchTerm,
    filterArea,
    filterManager,
    setSearchTerm,
    setFilterArea,
    setFilterManager,
    filteredRecords,
    uniqueManagers
  } = usePhotoFilters(submissions, originalFilters);

  const [selectedSubmission, setSelectedSubmission] = useState<PhotoSubmission | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<{ photos: string[], type: 'before' | 'after', index: number } | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = userRole === 'admin';
  const screenTitle = isAdmin ? 'Histórico de Fotos' : 'Revisão de Fotos';
  const screenDescription = isAdmin 
    ? 'Visualize todas as informações e fotos enviadas ao cliente' 
    : 'Revise, edite e envie as fotos dos serviços para os clientes';

  // Ajusta filtro inicial para Admin (mostrar tudo)
  useEffect(() => {
    if (isAdmin && originalFilters.status === 'pending') {
      setOriginalFilters({ ...originalFilters, status: 'all' });
    }
  }, [isAdmin]);

  const handleOpenDetail = (submission: PhotoSubmission) => {
    setSelectedSubmission(submission);
    setReviewNotes(submission.managerNotes || '');
    setIsEditing(false); // Reseta modo edição
    setIsDetailDialogOpen(true);
  };

  const handleSaveOrSend = async () => {
    if (isAdmin || !selectedSubmission) return;
    
    // Usa a mesma função approveSubmission tanto para enviar quanto para editar
    const success = await approveSubmission(selectedSubmission.id, reviewNotes);
    
    if (success) {
      setIsDetailDialogOpen(false);
      setReviewNotes('');
      setSelectedSubmission(null);
      setIsEditing(false);
      refresh();
      
      // Mensagem diferente baseada no status
      if (selectedSubmission.status === 'pending') {
        toast.success("Fotos enviadas ao cliente com sucesso!");
      } else {
        toast.success("Revisão atualizada com sucesso!");
      }
    }
  };

  const handleViewPhotos = (photos: string[], type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos({ photos, type, index });
    setIsPhotoViewerOpen(true);
  };

  const handleDeletePhoto = async (type: 'before' | 'after', photoUrl: string) => {
    if (isAdmin || !selectedSubmission) return;

    const isSent = selectedSubmission.status === 'sent';
    const success = await deletePhoto(photoUrl, selectedSubmission.id, isSent);
    if (success) {
      // Atualiza o submission localmente
      const updatedSubmission = {
        ...selectedSubmission,
        [type === 'before' ? 'beforePhotos' : 'afterPhotos']: 
          selectedSubmission[type === 'before' ? 'beforePhotos' : 'afterPhotos'].filter(p => p !== photoUrl)
      };
      setSelectedSubmission(updatedSubmission);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotos && selectedPhotos.index < selectedPhotos.photos.length - 1) {
      setSelectedPhotos({
        ...selectedPhotos,
        index: selectedPhotos.index + 1
      });
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotos && selectedPhotos.index > 0) {
      setSelectedPhotos({
        ...selectedPhotos,
        index: selectedPhotos.index - 1
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <ScreenHeader 
        title={screenTitle}
        description={screenDescription}
        onBack={onBack}
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <PhotoStats stats={stats} submissions={submissions} />

        {/* Filters */}
        <PhotoFilters
          searchTerm={searchTerm}
          filterArea={filterArea}
          filterManager={filterManager}
          uniqueManagers={uniqueManagers}
          onSearchChange={setSearchTerm}
          onAreaChange={setFilterArea}
          onManagerChange={setFilterManager}
          originalFilters={originalFilters}
          setOriginalFilters={setOriginalFilters}
          isAdmin={isAdmin}
        />

        {/* Records List */}
        <PhotoList
          loading={loading}
          records={filteredRecords}
          isAdmin={isAdmin}
          onViewDetail={handleOpenDetail}
          onViewPhotos={handleViewPhotos}
        />
      </div>

      {/* Detail Dialog */}
      {selectedSubmission && (
        <PhotoDetailDialog
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          submission={selectedSubmission}
          isAdmin={isAdmin}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          reviewNotes={reviewNotes}
          onReviewNotesChange={setReviewNotes}
          onSaveOrSend={handleSaveOrSend} // Função única para salvar/enviar
          onViewPhotos={handleViewPhotos}
          onDeletePhoto={handleDeletePhoto}
        />
      )}

      {/* Photo Viewer Dialog */}
      <PhotoViewerDialog
        isOpen={isPhotoViewerOpen}
        onOpenChange={setIsPhotoViewerOpen}
        selectedPhotos={selectedPhotos}
        onNextPhoto={handleNextPhoto}
        onPrevPhoto={handlePrevPhoto}
      />
    </div>
  );
}