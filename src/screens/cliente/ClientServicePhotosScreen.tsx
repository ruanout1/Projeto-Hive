import { ArrowLeft, Camera, Download, ZoomIn, X, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';

interface ClientServicePhotosScreenProps {
  onBack: () => void;
  serviceId?: string;
}

export default function ClientServicePhotosScreen({ onBack, serviceId = "OS-2024-089" }: ClientServicePhotosScreenProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'before' | 'after' | 'progress'>('all');

  // Mock data - em produção viria da API
  const serviceInfo = {
    id: serviceId,
    title: "Limpeza Geral - Escritório Corporate",
    date: "23/09/2024",
    duration: "8h",
    location: "Unidade Centro - Sala 401",
    team: "Equipe Alpha",
    status: "Concluído"
  };

  const photos = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1591609168360-45982552b94a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBjbGVhbmluZyUyMGJlZm9yZXxlbnwxfHx8fDE3NjA2NTY2MDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "before",
      timestamp: "08:00",
      description: "Estado inicial da sala de reuniões",
      photographer: "João Silva"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1745970347652-8f22f5d7d3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG1vZGVybiUyMG9mZmljZXxlbnwxfHx8fDE3NjA2MDg5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "after",
      timestamp: "16:00",
      description: "Sala de reuniões após limpeza completa",
      photographer: "João Silva"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1603985585179-3d71c35a537c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2MDU5MTUxNnww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "before",
      timestamp: "08:15",
      description: "Área de trabalho antes da limpeza",
      photographer: "Maria Santos"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjA1OTEzNDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "after",
      timestamp: "16:15",
      description: "Área de trabalho limpa e organizada",
      photographer: "Maria Santos"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1668589744814-d16e7b0e140e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHByb2dyZXNzJTIwd29ya3xlbnwxfHx8fDE3NjA2NTY2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "progress",
      timestamp: "12:00",
      description: "Processo de limpeza em andamento",
      photographer: "João Silva"
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1636125659769-0803b11bee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBidWlsZGluZyUyMGdsYXNzfGVufDF8fHx8MTc2MDYwODc1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "progress",
      timestamp: "14:00",
      description: "Limpeza dos vidros e fachada",
      photographer: "Maria Santos"
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1695891583421-3cbbf1c2e3bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBzcGFjZXxlbnwxfHx8fDE3NjA2NTY2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "before",
      timestamp: "08:30",
      description: "Corredor e área comum antes da limpeza",
      photographer: "João Silva"
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1555340627-20a4c7029632?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvcmtzcGFjZSUyMGNsZWFufGVufDF8fHx8MTc2MDY1NjYwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "after",
      timestamp: "16:30",
      description: "Espaço corporativo finalizado",
      photographer: "João Silva"
    }
  ];

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  const categoryLabels: Record<string, string> = {
    all: 'Todas',
    before: 'Antes',
    after: 'Depois',
    progress: 'Progresso'
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'before':
        return '#8B20EE';
      case 'after':
        return '#35BAE6';
      case 'progress':
        return '#FFFF20';
      default:
        return '#6400A4';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4" style={{ borderColor: 'rgba(100, 0, 164, 0.2)' }}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: '#6400A4' }} />
          </Button>
          <div>
            <h1 className="text-black flex items-center gap-2">
              <Camera className="h-6 w-6" style={{ color: '#6400A4' }} />
              Fotos do Serviço
            </h1>
            <p className="text-sm text-gray-600">{serviceInfo.title}</p>
          </div>
        </div>
      </div>

      {/* Service Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <Calendar className="h-4 w-4" style={{ color: '#6400A4' }} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Data</p>
                <p className="text-sm text-black">{serviceInfo.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Duração</p>
                <p className="text-sm text-black">{serviceInfo.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                <MapPin className="h-4 w-4" style={{ color: '#35BAE6' }} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Local</p>
                <p className="text-sm text-black">{serviceInfo.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <User className="h-4 w-4" style={{ color: '#6400A4' }} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Equipe</p>
                <p className="text-sm text-black">{serviceInfo.team}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600">Filtrar por:</span>
            {(['all', 'before', 'after', 'progress'] as const).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all"
                style={
                  selectedCategory === category
                    ? { backgroundColor: '#6400A4', color: 'white' }
                    : { borderColor: '#6400A4', color: '#6400A4' }
                }
              >
                {categoryLabels[category]} ({photos.filter(p => category === 'all' || p.category === category).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Camera className="h-5 w-5" style={{ color: '#6400A4' }} />
            Galeria de Fotos ({filteredPhotos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-lg"
                style={{ borderColor: 'rgba(100, 0, 164, 0.2)' }}
                onClick={() => setSelectedPhoto(photo.url)}
              >
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={photo.description}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className="text-xs border-none text-white"
                      style={{ backgroundColor: getCategoryColor(photo.category) }}
                    >
                      {categoryLabels[photo.category]}
                    </Badge>
                  </div>

                  {/* Timestamp */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {photo.timestamp}
                  </div>
                </div>

                {/* Photo Info */}
                <div className="p-3 bg-white">
                  <p className="text-sm text-black mb-1">{photo.description}</p>
                  <p className="text-xs text-gray-600">Por: {photo.photographer}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">Nenhuma foto encontrada nesta categoria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black" aria-describedby="photo-description">
          <DialogTitle className="sr-only">Visualização de Foto do Serviço</DialogTitle>
          <DialogDescription id="photo-description" className="sr-only">
            Foto ampliada do serviço com opção de download
          </DialogDescription>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-5 w-5" style={{ color: '#6400A4' }} />
            </Button>
            
            {selectedPhoto && (
              <div className="relative">
                <img
                  src={selectedPhoto}
                  alt="Foto ampliada"
                  className="w-full max-h-[80vh] object-contain"
                />
                
                {/* Download button */}
                <Button
                  variant="default"
                  size="sm"
                  className="absolute bottom-4 right-4 gap-2"
                  style={{ backgroundColor: '#6400A4' }}
                  onClick={() => {
                    // Implementar download
                    console.log('Download foto:', selectedPhoto);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
