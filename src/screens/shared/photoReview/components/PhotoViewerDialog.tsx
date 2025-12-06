import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';

interface PhotoViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPhotos: { photos: string[], type: 'before' | 'after', index: number } | null;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
}

export function PhotoViewerDialog({
  isOpen,
  onOpenChange,
  selectedPhotos,
  onNextPhoto,
  onPrevPhoto
}: PhotoViewerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {selectedPhotos?.type === 'before' ? 'Fotos Antes' : 'Fotos Depois'} 
            {' - '} 
            {selectedPhotos && `${selectedPhotos.index + 1} de ${selectedPhotos.photos.length}`}
          </DialogTitle>
          <DialogDescription>
            Use as setas para navegar entre as fotos
          </DialogDescription>
        </DialogHeader>
        
        {selectedPhotos && (
          <div className="relative">
            <img 
              src={selectedPhotos.photos[selectedPhotos.index]} 
              alt={`${selectedPhotos.type} ${selectedPhotos.index + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            
            {/* Navigation Buttons */}
            {selectedPhotos.photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onPrevPhoto}
                  disabled={selectedPhotos.index === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onNextPhoto}
                  disabled={selectedPhotos.index === selectedPhotos.photos.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}