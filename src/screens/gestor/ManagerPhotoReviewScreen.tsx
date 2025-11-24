import { useState } from 'react';
import ScreenHeader from '../public/ScreenHeader';
import { 
  Camera, 
  Send,
  Clock, 
  Eye, 
  FileText,
  User,
  MapPin,
  Calendar,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  X,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

interface PhotoSubmission {
  id: string;
  serviceRequestId: string;
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  serviceType: string;
  serviceDescription: string;
  collaboratorName: string;
  collaboratorId: string;
  uploadDate: string;
  uploadTime: string;
  beforePhotos: string[];
  afterPhotos: string[];
  collaboratorNotes?: string;
  status: 'pending' | 'sent';
  managerNotes?: string;
  sentDate?: string;
  sentBy?: string;
}

interface ManagerPhotoReviewScreenProps {
  onBack?: () => void;
}

export default function ManagerPhotoReviewScreen({ onBack }: ManagerPhotoReviewScreenProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'sent' | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<PhotoSubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<{ photos: string[], type: 'before' | 'after', index: number } | null>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([
    {
      id: 'PHOTO-001',
      serviceRequestId: 'REQ-2024-001',
      clientName: 'Shopping Center Norte',
      clientArea: 'norte',
      serviceType: 'Limpeza Geral',
      serviceDescription: 'Limpeza completa do piso térreo e estacionamento',
      collaboratorName: 'Carlos Silva',
      collaboratorId: 'COL-001',
      uploadDate: '21/10/2024',
      uploadTime: '14:30',
      beforePhotos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Serviço concluído conforme solicitado. Utilizados produtos especiais para o piso.',
      status: 'pending'
    },
    {
      id: 'PHOTO-002',
      serviceRequestId: 'REQ-2024-003',
      clientName: 'Condomínio Parque Sul',
      clientArea: 'sul',
      serviceType: 'Jardinagem',
      serviceDescription: 'Poda de árvores e manutenção do jardim',
      collaboratorName: 'Pedro Oliveira',
      collaboratorId: 'COL-005',
      uploadDate: '21/10/2024',
      uploadTime: '11:15',
      beforePhotos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1599629954294-8f4a996d76e0?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1616783940314-2574568056cc?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Poda realizada. Recolhido todo material.',
      status: 'pending'
    },
    {
      id: 'PHOTO-003',
      serviceRequestId: 'REQ-2024-005',
      clientName: 'Escritório Tech Center',
      clientArea: 'centro',
      serviceType: 'Limpeza de Vidros',
      serviceDescription: 'Limpeza de vidraças externas',
      collaboratorName: 'João Pedro',
      collaboratorId: 'COL-003',
      uploadDate: '20/10/2024',
      uploadTime: '16:45',
      beforePhotos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      afterPhotos: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'],
      collaboratorNotes: 'Limpeza completa realizada.',
      status: 'sent',
      managerNotes: 'Fotos enviadas ao cliente.',
      sentDate: '20/10/2024',
      sentBy: 'Ana Paula Rodrigues'
    }
  ]);

  const getStatusConfig = (status: PhotoSubmission['status']) => {
    const configs = {
      'pending': {
        label: 'Pendente Revisão',
        style: { backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' },
        icon: Clock
      },
      'sent': {
        label: 'Enviado ao Cliente',
        style: { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
        icon: CheckCircle
      }
    };
    return configs[status];
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesTab = activeTab === 'all' || sub.status === activeTab;
    const matchesSearch = searchTerm === '' || 
      sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statusCounts = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    sent: submissions.filter(s => s.status === 'sent').length
  };

  const handleOpenReview = (submission: PhotoSubmission) => {
    setSelectedSubmission(submission);
    setReviewNotes(submission.managerNotes || '');
    setIsReviewDialogOpen(true);
  };

  const handleSendToClient = () => {
    if (selectedSubmission) {
      // Verifica se ainda há fotos para enviar
      if (selectedSubmission.beforePhotos.length === 0 && selectedSubmission.afterPhotos.length === 0) {
        toast.error('Não há fotos para enviar. Adicione pelo menos uma foto antes de enviar ao cliente.');
        return;
      }

      const updatedSubmission = {
        ...selectedSubmission,
        status: 'sent' as const,
        managerNotes: reviewNotes || 'Fotos enviadas ao cliente.',
        sentDate: new Date().toLocaleDateString('pt-BR'),
        sentBy: 'Ana Paula Rodrigues'
      };
      
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id ? updatedSubmission : s
      ));
      
      toast.success('Fotos enviadas com sucesso ao cliente e disponíveis no histórico!');
      setIsReviewDialogOpen(false);
      setReviewNotes('');
      setSelectedSubmission(null);
    }
  };

  const handleDeletePhoto = (type: 'before' | 'after', photoUrl: string) => {
    if (!selectedSubmission) return;

    const updatedSubmission = {
      ...selectedSubmission,
      [type === 'before' ? 'beforePhotos' : 'afterPhotos']: 
        selectedSubmission[type === 'before' ? 'beforePhotos' : 'afterPhotos'].filter(
          photo => photo !== photoUrl
        )
    };

    setSelectedSubmission(updatedSubmission);
    setSubmissions(submissions.map(s => 
      s.id === selectedSubmission.id ? updatedSubmission : s
    ));

    toast.success('Foto excluída com sucesso!');
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <ScreenHeader 
        title="Revisão de Fotos" 
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
                  <p className="text-2xl mt-1">{statusCounts.total}</p>
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
                  <p className="text-sm text-gray-600">Pendentes Revisão</p>
                  <p className="text-2xl mt-1">{statusCounts.pending}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
                  <Clock style={{ color: '#ca8a04' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enviados ao Cliente</p>
                  <p className="text-2xl mt-1">{statusCounts.sent}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <CheckCircle style={{ color: '#16a34a' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cliente, colaborador, serviço ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="w-full md:w-auto">
                <TabsList className="grid grid-cols-3 w-full md:w-[300px]">
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="sent">Enviados</TabsTrigger>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum envio de fotos encontrado</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => {
              const statusConfig = getStatusConfig(submission.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Left: Photo Preview */}
                      <div className="flex gap-2 flex-shrink-0">
                        {/* Before Photos Preview */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 mb-1">Antes</p>
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                               onClick={() => handleViewPhotos(submission.beforePhotos, 'before')}>
                            <img 
                              src={submission.beforePhotos[0]} 
                              alt="Antes"
                              className="w-full h-full object-cover"
                            />
                            {submission.beforePhotos.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                +{submission.beforePhotos.length - 1}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* After Photos Preview */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 mb-1">Depois</p>
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                               onClick={() => handleViewPhotos(submission.afterPhotos, 'after')}>
                            <img 
                              src={submission.afterPhotos[0]} 
                              alt="Depois"
                              className="w-full h-full object-cover"
                            />
                            {submission.afterPhotos.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                +{submission.afterPhotos.length - 1}
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
                              <p className="text-sm text-gray-600">ID: {submission.id}</p>
                              <Badge 
                                style={statusConfig.style}
                                className="flex items-center gap-1"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                              <Badge 
                                style={{ 
                                  backgroundColor: `${getAreaColor(submission.clientArea)}15`,
                                  color: getAreaColor(submission.clientArea)
                                }}
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {submission.clientArea.toUpperCase()}
                              </Badge>
                            </div>
                            <h3 className="font-medium">{submission.clientName}</h3>
                            <p className="text-sm text-gray-600">{submission.serviceType}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Colaborador: <span className="text-gray-900">{submission.collaboratorName}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Enviado: <span className="text-gray-900">{submission.uploadDate} às {submission.uploadTime}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>Serviço: <span className="text-gray-900">{submission.serviceRequestId}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ImageIcon className="h-4 w-4" />
                            <span>Fotos: <span className="text-gray-900">{submission.beforePhotos.length} antes, {submission.afterPhotos.length} depois</span></span>
                          </div>
                        </div>

                        {submission.collaboratorNotes && (
                          <div className="text-sm bg-blue-50 p-3 rounded-lg">
                            <p className="font-medium text-blue-900 mb-1">Observações do Colaborador:</p>
                            <p className="text-blue-800">{submission.collaboratorNotes}</p>
                          </div>
                        )}

                        {submission.managerNotes && submission.status === 'sent' && (
                          <div className="text-sm bg-purple-50 p-3 rounded-lg">
                            <p className="font-medium text-purple-900 mb-1">Observações do Gestor:</p>
                            <p className="text-purple-800">{submission.managerNotes}</p>
                            {submission.sentDate && (
                              <p className="text-xs text-purple-600 mt-1">
                                Enviado em {submission.sentDate} por {submission.sentBy}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReview(submission)}
                          className="whitespace-nowrap"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {submission.status === 'pending' ? 'Revisar e Enviar' : 'Visualizar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.status === 'pending' ? 'Revisar e Enviar Fotos' : 'Visualizar Fotos Enviadas'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission?.status === 'pending' 
                ? 'Revise as fotos e exclua as que não forem aceitáveis. Depois envie para o cliente.'
                : 'Fotos já enviadas ao cliente e disponíveis no histórico.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Service Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedSubmission.clientName}</p>
                    <p className="text-sm text-gray-600">{selectedSubmission.serviceType}</p>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: `${getAreaColor(selectedSubmission.clientArea)}15`,
                      color: getAreaColor(selectedSubmission.clientArea)
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedSubmission.clientArea.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedSubmission.serviceDescription}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedSubmission.collaboratorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedSubmission.uploadDate} às {selectedSubmission.uploadTime}
                  </span>
                </div>
              </div>

              {/* Before Photos */}
              <div>
                <Label className="text-base mb-2 block">
                  Fotos Antes ({selectedSubmission.beforePhotos.length})
                </Label>
                {selectedSubmission.beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedSubmission.beforePhotos.map((photo, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        <img 
                          src={photo} 
                          alt={`Antes ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleViewPhotos(selectedSubmission.beforePhotos, 'before', index)}
                        />
                        {selectedSubmission.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto('before', photo);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Nenhuma foto "antes" disponível</p>
                  </div>
                )}
              </div>

              {/* After Photos */}
              <div>
                <Label className="text-base mb-2 block">
                  Fotos Depois ({selectedSubmission.afterPhotos.length})
                </Label>
                {selectedSubmission.afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedSubmission.afterPhotos.map((photo, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        <img 
                          src={photo} 
                          alt={`Depois ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleViewPhotos(selectedSubmission.afterPhotos, 'after', index)}
                        />
                        {selectedSubmission.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto('after', photo);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Nenhuma foto "depois" disponível</p>
                  </div>
                )}
              </div>

              {/* Collaborator Notes */}
              {selectedSubmission.collaboratorNotes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="text-sm mb-2 block text-blue-900">Observações do Colaborador</Label>
                  <p className="text-sm text-blue-800">{selectedSubmission.collaboratorNotes}</p>
                </div>
              )}

              {/* Manager Notes */}
              {selectedSubmission.status === 'pending' ? (
                <div>
                  <Label htmlFor="review-notes">
                    Observações (Opcional)
                  </Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Adicione observações sobre as fotos (opcional)..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              ) : (
                selectedSubmission.managerNotes && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Label className="text-sm mb-2 block text-purple-900">Observações do Gestor</Label>
                    <p className="text-sm text-purple-800">{selectedSubmission.managerNotes}</p>
                  </div>
                )
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              {selectedSubmission?.status === 'pending' ? 'Cancelar' : 'Fechar'}
            </Button>
            {selectedSubmission?.status === 'pending' && (
              <Button 
                onClick={handleSendToClient}
                style={{ backgroundColor: '#6400A4', color: '#fff' }}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar para Cliente
              </Button>
            )}
          </DialogFooter>
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
