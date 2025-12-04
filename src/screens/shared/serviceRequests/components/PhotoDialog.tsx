import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Camera } from 'lucide-react';

interface PhotoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentation: any;
  photoType: 'before' | 'after';
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  onTypeChange: (type: 'before' | 'after') => void;
}

export const PhotoDialog: React.FC<PhotoDialogProps> = ({
  isOpen,
  onClose,
  documentation,
  photoType,
  selectedIndex,
  onIndexChange,
  onTypeChange
}) => {
  if (!documentation) return null;

  const photos = photoType === 'before' ? documentation.beforePhotos : documentation.afterPhotos;
  const totalPhotos = photos.length;

  const nextPhoto = () => {
    if (selectedIndex < totalPhotos - 1) {
      onIndexChange(selectedIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex > 0) {
      onIndexChange(selectedIndex - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4' }}>
            Documentação Fotográfica - {photoType === 'before' ? 'Antes' : 'Depois'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Foto Principal */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={photos[selectedIndex]} 
              alt={`${photoType} ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {/* Navegação */}
            {totalPhotos > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevPhoto}
                  disabled={selectedIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextPhoto}
                  disabled={selectedIndex === totalPhotos - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                >
                  →
                </Button>
              </>
            )}
          </div>

          {/* Miniaturas */}
          <div className="grid grid-cols-6 gap-2">
            {photos.map((photo: string, idx: number) => (
              <div 
                key={idx}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                  idx === selectedIndex 
                    ? 'border-purple-600 ring-2 ring-purple-300' 
                    : 'border-gray-200'
                }`}
                onClick={() => onIndexChange(idx)}
              >
                <img 
                  src={photo} 
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => onTypeChange(photoType === 'before' ? 'after' : 'before')}
              style={{ borderColor: '#6400A4', color: '#6400A4' }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Ver Fotos "{photoType === 'before' ? 'Depois' : 'Antes'}"
            </Button>

            <div className="text-sm text-gray-600">
              {selectedIndex + 1} / {totalPhotos}
            </div>

            <Button
              onClick={onClose}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};