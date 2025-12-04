import { useState } from 'react';
import { FileText, Upload, Download, Eye, Edit, Trash2, Plus, Search, Filter, File, FileCheck, EyeOff, X } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

type DocumentType = 'contrato' | 'nota-fiscal' | 'ordem-servico' | 'outros';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  clientId: string;
  clientName: string;
  uploadDate: string;
  fileSize: string;
  availableToClient: boolean;
  serviceId?: string;
}

const mockDocuments: Document[] = [
  {
    id: 'DOC-001',
    name: 'Contrato de Prestação de Serviços - Shopping Norte',
    type: 'contrato',
    clientId: 'CLI-001',
    clientName: 'Shopping Center Norte',
    uploadDate: '01/10/2024',
    fileSize: '2.5 MB',
    availableToClient: true
  },
  {
    id: 'DOC-002',
    name: 'NF-2024-089 - Hospital Central',
    type: 'nota-fiscal',
    clientId: 'CLI-002',
    clientName: 'Hospital Central',
    uploadDate: '15/10/2024',
    fileSize: '156 KB',
    availableToClient: true,
    serviceId: 'REQ-2024-005'
  },
  {
    id: 'DOC-003',
    name: 'Contrato Adicional - Escritório Corporate',
    type: 'contrato',
    clientId: 'CLI-003',
    clientName: 'Escritório Corporate',
    uploadDate: '05/10/2024',
    fileSize: '1.8 MB',
    availableToClient: false
  },
  {
    id: 'DOC-004',
    name: 'NF-2024-076 - Shopping Norte',
    type: 'nota-fiscal',
    clientId: 'CLI-001',
    clientName: 'Shopping Center Norte',
    uploadDate: '20/09/2024',
    fileSize: '142 KB',
    availableToClient: true,
    serviceId: 'REQ-2024-002'
  },
  {
    id: 'DOC-005',
    name: 'Certificado de Conformidade - Hospital Central',
    type: 'outros',
    clientId: 'CLI-002',
    clientName: 'Hospital Central',
    uploadDate: '12/10/2024',
    fileSize: '890 KB',
    availableToClient: true
  },
  {
    id: 'DOC-006',
    name: 'Relatório de Serviços - Condomínio Residencial',
    type: 'outros',
    clientId: 'CLI-004',
    clientName: 'Condomínio Residencial',
    uploadDate: '08/10/2024',
    fileSize: '3.2 MB',
    availableToClient: false
  }
];

interface DocumentsScreenProps {
  onBack?: () => void;
}

export default function DocumentsScreen({ onBack }: DocumentsScreenProps) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [originalDocument, setOriginalDocument] = useState<Document | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'contrato' as DocumentType,
    clientId: '',
    clientName: '',
    file: null as File | null
  });

  const handleUploadDocument = () => {
    if (!newDocument.name || !newDocument.clientName || !newDocument.file) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const document: Document = {
      id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
      name: newDocument.name,
      type: newDocument.type,
      clientId: newDocument.clientId || `CLI-${String(documents.length + 1).padStart(3, '0')}`,
      clientName: newDocument.clientName,
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      fileSize: `${(newDocument.file.size / 1024 / 1024).toFixed(2)} MB`,
      availableToClient: false
    };

    setDocuments([document, ...documents]);
    setIsUploadDialogOpen(false);
    setNewDocument({
      name: '',
      type: 'contrato',
      clientId: '',
      clientName: '',
      file: null
    });
    toast.success('Documento anexado com sucesso!');
  };

  const handleEditDocument = () => {
    if (!selectedDocument) return;

    setDocuments(documents.map(doc => 
      doc.id === selectedDocument.id ? selectedDocument : doc
    ));
    setIsEditDialogOpen(false);
    setSelectedDocument(null);
    toast.success('Documento atualizado com sucesso!');
  };

  const handleDeleteDocument = () => {
    if (!selectedDocument) return;

    setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
    setIsDeleteDialogOpen(false);
    setSelectedDocument(null);
    toast.success('Documento excluído com sucesso!');
  };

  const handleToggleVisibility = (document: Document) => {
    const updatedDoc = {
      ...document,
      availableToClient: !document.availableToClient
    };
    setDocuments(documents.map(doc => doc.id === document.id ? updatedDoc : doc));
    toast.success(updatedDoc.availableToClient ? 'Documento disponibilizado para o cliente' : 'Documento ocultado do cliente');
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleDownloadDocument = (document: Document) => {
    // Em produção, isso faria o download do arquivo real
    toast.success(`Download iniciado: ${document.name}`);
    
    // Simular download
    const link = window.document.createElement('a');
    link.href = '#'; // Em produção, seria a URL real do arquivo
    link.download = document.name;
    // link.click(); // Descomentado em produção
  };

  const openEditDialog = (document: Document) => {
    setSelectedDocument(document);
    setOriginalDocument({...document}); // Salvar estado original
    setIsEditDialogOpen(true);
  };

  const hasChanges = () => {
    if (!selectedDocument || !originalDocument) return false;
    return JSON.stringify(selectedDocument) !== JSON.stringify(originalDocument);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesVisibility = visibilityFilter === 'all' || 
      (visibilityFilter === 'visible' && doc.availableToClient) ||
      (visibilityFilter === 'hidden' && !doc.availableToClient);
    
    return matchesSearch && matchesType && matchesVisibility;
  });

  const getTypeConfig = (type: DocumentType) => {
    const configs = {
      'contrato': {
        label: 'Contrato',
        color: '#6400A4',
        bgColor: 'rgba(100, 0, 164, 0.1)',
        icon: FileCheck
      },
      'nota-fiscal': {
        label: 'Nota Fiscal',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: FileText
      },
      'ordem-servico': {
        label: 'Ordem de Serviço',
        color: '#8B20EE',
        bgColor: 'rgba(139, 32, 238, 0.1)',
        icon: FileText
      },
      'outros': {
        label: 'Outros',
        color: '#35BAE6',
        bgColor: 'rgba(53, 186, 230, 0.1)',
        icon: File
      }
    };
    return configs[type];
  };

  const documentCounts = {
    total: documents.length,
    contratos: documents.filter(d => d.type === 'contrato').length,
    notasFiscais: documents.filter(d => d.type === 'nota-fiscal').length,
    ordensServico: documents.filter(d => d.type === 'ordem-servico').length,
    outros: documents.filter(d => d.type === 'outros').length,
    visible: documents.filter(d => d.availableToClient).length,
    hidden: documents.filter(d => !d.availableToClient).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Documentos"
                description="Gerencie contratos, notas fiscais e outros documentos dos clientes."
                onBack={() => onBack?.()}
              />
            </div>
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Anexar Documento
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{documentCounts.total}</p>
                </div>
                <FileText className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contratos</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{documentCounts.contratos}</p>
                </div>
                <FileCheck className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Notas Fiscais</p>
                  <p className="text-2xl text-green-600">{documentCounts.notasFiscais}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ordens de Serviço</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{documentCounts.ordensServico}</p>
                </div>
                <FileText className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outros</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{documentCounts.outros}</p>
                </div>
                <File className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visíveis</p>
                  <p className="text-2xl text-green-600">{documentCounts.visible}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ocultos</p>
                  <p className="text-2xl text-gray-600">{documentCounts.hidden}</p>
                </div>
                <EyeOff className="h-8 w-8 text-gray-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-auto">
              <TabsList className="grid grid-cols-5 w-full md:w-auto">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="contrato">Contratos</TabsTrigger>
                <TabsTrigger value="nota-fiscal">NFs</TabsTrigger>
                <TabsTrigger value="ordem-servico">OSs</TabsTrigger>
                <TabsTrigger value="outros">Outros</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Visibility Filter */}
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="visible">Visíveis ao Cliente</SelectItem>
                <SelectItem value="hidden">Ocultos do Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhum documento encontrado</p>
            </div>
          ) : (
            filteredDocuments.map((document) => {
              const typeConfig = getTypeConfig(document.type);
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={document.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Document Info */}
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: typeConfig.bgColor }}
                      >
                        <TypeIcon className="h-6 w-6" style={{ color: typeConfig.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 style={{ color: '#6400A4' }} className="truncate">
                            {document.name}
                          </h3>
                          <Badge
                            style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                            className="border-none flex-shrink-0"
                          >
                            {typeConfig.label}
                          </Badge>
                          <Badge
                            variant={document.availableToClient ? 'default' : 'secondary'}
                            style={document.availableToClient ? { backgroundColor: '#10B981', color: 'white' } : {}}
                            className="border-none flex items-center gap-1 flex-shrink-0"
                          >
                            {document.availableToClient ? (
                              <>
                                <Eye className="h-3 w-3" />
                                Visível ao Cliente
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Oculto
                              </>
                            )}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate">ID: {document.id}</span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#35BAE6' }} />
                            <span className="truncate">{document.clientName}</span>
                          </div>
                          {document.serviceId && (
                            <div className="flex items-center space-x-2 min-w-0">
                              <FileCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                              <span className="truncate">Serviço: {document.serviceId}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>Enviado em: {document.uploadDate}</span>
                          <span>•</span>
                          <span>Tamanho: {document.fileSize}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVisibility(document)}
                        className="whitespace-nowrap"
                        style={document.availableToClient ? { borderColor: '#10B981', color: '#10B981' } : {}}
                      >
                        {document.availableToClient ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Visível
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Oculto
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(document)}
                        className="whitespace-nowrap"
                        style={{ borderColor: '#6400A4', color: '#6400A4' }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(document)}
                        className="whitespace-nowrap"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="whitespace-nowrap"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDocument(document);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 whitespace-nowrap"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>Anexar Novo Documento</DialogTitle>
            <DialogDescription>
              Faça upload de contratos, notas fiscais ou outros documentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tipo de Documento*</Label>
              <Select 
                value={newDocument.type} 
                onValueChange={(value) => setNewDocument({...newDocument, type: value as DocumentType})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="nota-fiscal">Nota Fiscal</SelectItem>
                  <SelectItem value="ordem-servico">Ordem de Serviço</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome do Documento*</Label>
              <Input
                value={newDocument.name}
                onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                placeholder="Ex: Contrato de Prestação de Serviços - Cliente X"
              />
            </div>

            <div>
              <Label>Cliente*</Label>
              <Input
                value={newDocument.clientName}
                onChange={(e) => setNewDocument({...newDocument, clientName: e.target.value})}
                placeholder="Nome do cliente"
              />
            </div>

            <div>
              <Label>Arquivo*</Label>
              <Input
                type="file"
                onChange={(e) => setNewDocument({...newDocument, file: e.target.files?.[0] || null})}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadDocument} style={{ backgroundColor: '#6400A4', color: 'white' }}>
              <Upload className="h-4 w-4 mr-2" />
              Anexar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>Editar Documento</DialogTitle>
            <DialogDescription>
              {selectedDocument?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <Label>Tipo de Documento</Label>
                <Select 
                  value={selectedDocument.type} 
                  onValueChange={(value) => setSelectedDocument({...selectedDocument, type: value as DocumentType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="nota-fiscal">Nota Fiscal</SelectItem>
                    <SelectItem value="ordem-servico">Ordem de Serviço</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nome do Documento</Label>
                <Input
                  value={selectedDocument.name}
                  onChange={(e) => setSelectedDocument({...selectedDocument, name: e.target.value})}
                />
              </div>

              <div>
                <Label>Cliente</Label>
                <Input
                  value={selectedDocument.clientName}
                  onChange={(e) => setSelectedDocument({...selectedDocument, clientName: e.target.value})}
                />
              </div>

              <div>
                <Label>Substituir Arquivo (opcional)</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para manter o arquivo atual
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedDocument(null);
              setOriginalDocument(null);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditDocument} 
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              disabled={!hasChanges()}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {selectedDocument?.name}
            </DialogTitle>
            <DialogDescription>
              Visualização completa do documento
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm" style={{ color: '#6400A4' }}>
                    {getTypeConfig(selectedDocument.type).label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm text-gray-900">{selectedDocument.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="text-sm text-gray-900">{selectedDocument.uploadDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tamanho</p>
                  <p className="text-sm text-gray-900">{selectedDocument.fileSize}</p>
                </div>
              </div>

              {/* Document Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div 
                    className="h-24 w-24 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: getTypeConfig(selectedDocument.type).bgColor }}
                  >
                    <FileText className="h-12 w-12" style={{ color: getTypeConfig(selectedDocument.type).color }} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-2">Visualização de Documento</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {selectedDocument.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Em produção, o documento seria exibido aqui<br />
                      (PDF, imagem ou visualizador apropriado)
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    style={{ backgroundColor: '#10B981', color: 'white' }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Documento
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{selectedDocument?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDocument}
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
