import { useState } from 'react';
import ScreenHeader from '../public/ScreenHeader';
import { 
  Camera, 
  CheckCircle,
  Eye, 
  FileText,
  User,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface PhotoRecord {
  id: string;
  serviceRequestId: string;
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  serviceType: string;
  serviceDescription: string;
  collaboratorName: string;
  managerName: string;
  uploadDate: string;
  sentDate: string;
  beforePhotos: string[];
  afterPhotos: string[];
  collaboratorNotes?: string;
  managerNotes?: string;
}

interface AdminPhotoHistoryScreenProps {
  onBack?: () => void;
}

export default function AdminPhotoHistoryScreen({ onBack }: AdminPhotoHistoryScreenProps) {
  const [selectedRecord, setSelectedRecord] = useState<PhotoRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<{ photos: string[], type: 'before' | 'after', index: number } | null>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterManager, setFilterManager] = useState<string>('all');

  const [photoRecords] = useState<PhotoRecord[]>([
    {
      id: 'PHOTO-003',
      serviceRequestId: 'REQ-2024-005',
      clientName: 'Escritório Tech Center',
      clientArea: 'centro',
      serviceType: 'Limpeza de Vidros',
      serviceDescription: 'Limpeza de vidraças externas',
      collaboratorName: 'João Pedro',
      managerName: 'Ana Paula Rodrigues',
      uploadDate: '20/10/2024',
      sentDate: '20/10/2024',
      beforePhotos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Limpeza completa realizada.',
      managerNotes: 'Fotos enviadas ao cliente.'
    },
    {
      id: 'PHOTO-004',
      serviceRequestId: 'REQ-2024-008',
      clientName: 'Hospital Oeste',
      clientArea: 'oeste',
      serviceType: 'Limpeza Hospitalar',
      serviceDescription: 'Desinfecção de área crítica',
      collaboratorName: 'Maria Silva',
      managerName: 'Carlos Mendes',
      uploadDate: '19/10/2024',
      sentDate: '19/10/2024',
      beforePhotos: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1631248055645-c3c67ebc6e87?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Área desinfetada seguindo todos os protocolos de segurança.',
      managerNotes: 'Trabalho aprovado e enviado ao cliente.'
    },
    {
      id: 'PHOTO-005',
      serviceRequestId: 'REQ-2024-012',
      clientName: 'Shopping Center Norte',
      clientArea: 'norte',
      serviceType: 'Limpeza Geral',
      serviceDescription: 'Limpeza de estacionamento',
      collaboratorName: 'Carlos Silva',
      managerName: 'Ana Paula Rodrigues',
      uploadDate: '18/10/2024',
      sentDate: '18/10/2024',
      beforePhotos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Estacionamento limpo e sinalizado.',
      managerNotes: 'Serviço executado conforme especificado.'
    },
    {
      id: 'PHOTO-006',
      serviceRequestId: 'REQ-2024-015',
      clientName: 'Condomínio Parque Sul',
      clientArea: 'sul',
      serviceType: 'Jardinagem',
      serviceDescription: 'Manutenção de jardins e áreas verdes',
      collaboratorName: 'Pedro Oliveira',
      managerName: 'Fernanda Costa',
      uploadDate: '17/10/2024',
      sentDate: '17/10/2024',
      beforePhotos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1599629954294-8f4a996d76e0?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1616783940314-2574568056cc?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Jardins podados e áreas limpas.',
      managerNotes: 'Excelente trabalho na manutenção.'
    },
    {
      id: 'PHOTO-007',
      serviceRequestId: 'REQ-2024-018',
      clientName: 'Prédio Comercial Leste',
      clientArea: 'leste',
      serviceType: 'Limpeza de Fachada',
      serviceDescription: 'Lavagem de fachada e vidros externos',
      collaboratorName: 'Ricardo Santos',
      managerName: 'Carlos Mendes',
      uploadDate: '16/10/2024',
      sentDate: '16/10/2024',
      beforePhotos: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Fachada lavada completamente.',
      managerNotes: 'Cliente satisfeito com o resultado.'
    }
  ]);

  const filteredRecords = photoRecords.filter(record => {
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

  const uniqueManagers = Array.from(new Set(photoRecords.map(r => r.managerName)));

  const handleOpenDetail = (record: PhotoRecord) => {
    setSelectedRecord(record);
    setIsDetailDialogOpen(true);
  };

  const handleViewPhotos = (photos: string[], type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos({ photos, type, index });
    setIsPhotoViewerOpen(true);
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

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      norte: '#3b82f6',
      sul: '#ef4444',
      leste: '#10b981',
      oeste: '#f59e0b',
      centro: '#8b5cf6'
    };
    return colors[area] || '#6b7280';
  };

  const totalPhotos = photoRecords.reduce(
    (acc, record) => acc + record.beforePhotos.length + record.afterPhotos.length, 
    0
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <ScreenHeader 
        title="Histórico de Fotos" 
        onBack={onBack}
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Envios</p>
                  <p className="text-2xl mt-1">{photoRecords.length}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                  <CheckCircle style={{ color: '#6400A4' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Fotos</p>
                  <p className="text-2xl mt-1">{totalPhotos}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                  <Camera style={{ color: '#35BAE6' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Atendidos</p>
                  <p className="text-2xl mt-1">{new Set(photoRecords.map(r => r.clientName)).size}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                  <User style={{ color: '#8B20EE' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Buscar por cliente, gestor, colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    <SelectItem value="norte">Norte</SelectItem>
                    <SelectItem value="sul">Sul</SelectItem>
                    <SelectItem value="leste">Leste</SelectItem>
                    <SelectItem value="oeste">Oeste</SelectItem>
                    <SelectItem value="centro">Centro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterManager} onValueChange={setFilterManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por gestor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os gestores</SelectItem>
                    {uniqueManagers.map(manager => (
                      <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum registro encontrado</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Left: Photo Preview */}
                    <div className="flex gap-2 flex-shrink-0">
                      {/* Before Photos Preview */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 mb-1">Antes</p>
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => handleViewPhotos(record.beforePhotos, 'before')}>
                          <img 
                            src={record.beforePhotos[0]} 
                            alt="Antes"
                            className="w-full h-full object-cover"
                          />
                          {record.beforePhotos.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              +{record.beforePhotos.length - 1}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* After Photos Preview */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 mb-1">Depois</p>
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => handleViewPhotos(record.afterPhotos, 'after')}>
                          <img 
                            src={record.afterPhotos[0]} 
                            alt="Depois"
                            className="w-full h-full object-cover"
                          />
                          {record.afterPhotos.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              +{record.afterPhotos.length - 1}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-gray-600">ID: {record.id}</p>
                            <Badge 
                              style={{ 
                                backgroundColor: `${getAreaColor(record.clientArea)}15`,
                                color: getAreaColor(record.clientArea)
                              }}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              {record.clientArea.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{record.clientName}</h3>
                          <p className="text-sm text-gray-600">{record.serviceType}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>Colaborador: <span className="text-gray-900">{record.collaboratorName}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" style={{ color: '#6400A4' }} />
                          <span>Gestor: <span className="text-gray-900">{record.managerName}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Enviado: <span className="text-gray-900">{record.sentDate}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span>Fotos: <span className="text-gray-900">{record.beforePhotos.length} antes, {record.afterPhotos.length} depois</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(record)}
                        className="whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Envio de Fotos</DialogTitle>
            <DialogDescription>
              Visualize todas as informações e fotos enviadas ao cliente
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              {/* Service Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedRecord.clientName}</p>
                    <p className="text-sm text-gray-600">{selectedRecord.serviceType}</p>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: `${getAreaColor(selectedRecord.clientArea)}15`,
                      color: getAreaColor(selectedRecord.clientArea)
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedRecord.clientArea.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedRecord.serviceDescription}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Colaborador: <span className="text-gray-900">{selectedRecord.collaboratorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" style={{ color: '#6400A4' }} />
                    Gestor: <span className="text-gray-900">{selectedRecord.managerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Upload: <span className="text-gray-900">{selectedRecord.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" style={{ color: '#16a34a' }} />
                    Enviado: <span className="text-gray-900">{selectedRecord.sentDate}</span>
                  </div>
                </div>
              </div>

              {/* Before Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Fotos Antes ({selectedRecord.beforePhotos.length})</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedRecord.beforePhotos.map((photo, index) => (
                    <div 
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleViewPhotos(selectedRecord.beforePhotos, 'before', index)}
                    >
                      <img 
                        src={photo} 
                        alt={`Antes ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* After Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Fotos Depois ({selectedRecord.afterPhotos.length})</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedRecord.afterPhotos.map((photo, index) => (
                    <div 
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleViewPhotos(selectedRecord.afterPhotos, 'after', index)}
                    >
                      <img 
                        src={photo} 
                        alt={`Depois ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                {selectedRecord.collaboratorNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Observações do Colaborador</p>
                    <p className="text-sm text-blue-800">{selectedRecord.collaboratorNotes}</p>
                  </div>
                )}
                {selectedRecord.managerNotes && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">Observações do Gestor</p>
                    <p className="text-sm text-purple-800">{selectedRecord.managerNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
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
                    onClick={handlePrevPhoto}
                    disabled={selectedPhotos.index === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleNextPhoto}
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
    </div>
  );
}
