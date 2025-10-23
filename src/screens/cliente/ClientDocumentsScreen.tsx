import { useState } from 'react';
import { FileText, Download, Eye, Search, Filter, File, FileCheck, Calendar, X } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

type DocumentType = 'contrato' | 'nota-fiscal' | 'ordem-servico' | 'outros';

interface ClientDocument {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  fileSize: string;
  serviceId?: string;
  value?: number;
  paymentStatus?: 'paid' | 'pending';
  period?: string;
}

const mockDocuments: ClientDocument[] = [
  {
    id: 'OS-2024-001',
    name: 'Ordem de Serviço - Outubro (1ª Quinzena)',
    type: 'ordem-servico',
    uploadDate: '16/10/2024',
    fileSize: '245 KB',
    value: 10250.00,
    paymentStatus: 'paid',
    period: '01/10/2024 a 15/10/2024'
  },
  {
    id: 'DOC-001',
    name: 'Contrato de Prestação de Serviços',
    type: 'contrato',
    uploadDate: '01/10/2024',
    fileSize: '2.5 MB'
  },
  {
    id: 'DOC-002',
    name: 'NF-2024-089',
    type: 'nota-fiscal',
    uploadDate: '15/10/2024',
    fileSize: '156 KB',
    serviceId: 'REQ-2024-005'
  },
  {
    id: 'DOC-004',
    name: 'NF-2024-076',
    type: 'nota-fiscal',
    uploadDate: '20/09/2024',
    fileSize: '142 KB',
    serviceId: 'REQ-2024-002'
  },
  {
    id: 'DOC-005',
    name: 'Certificado de Conformidade',
    type: 'outros',
    uploadDate: '12/10/2024',
    fileSize: '890 KB'
  },
  {
    id: 'DOC-007',
    name: 'NF-2024-063',
    type: 'nota-fiscal',
    uploadDate: '15/09/2024',
    fileSize: '142 KB',
    serviceId: 'REQ-2024-001'
  },
  {
    id: 'DOC-008',
    name: 'Relatório de Serviços - Setembro',
    type: 'outros',
    uploadDate: '05/09/2024',
    fileSize: '3.2 MB'
  },
  {
    id: 'DOC-009',
    name: 'NF-2024-050',
    type: 'nota-fiscal',
    uploadDate: '05/08/2024',
    fileSize: '138 KB',
    serviceId: 'REQ-2024-000'
  }
];

interface ClientDocumentsScreenProps {
  onBack?: () => void;
}

export default function ClientDocumentsScreen({ onBack }: ClientDocumentsScreenProps) {
  const [documents] = useState<ClientDocument[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewingDocument, setViewingDocument] = useState<ClientDocument | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.serviceId && doc.serviceId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesType;
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
    outros: documents.filter(d => d.type === 'outros').length
  };

  // Cálculo de estatísticas de notas fiscais
  const totalInvoiceAmount = 34000; // Mock - em produção, viria da API
  const paidInvoices = documents.filter(d => d.type === 'nota-fiscal').length - 1;
  const pendingInvoices = 1;

  const handleViewDocument = (document: ClientDocument) => {
    setViewingDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleDownloadDocument = (document: ClientDocument) => {
    // Em produção, isso faria o download do arquivo real
    toast.success(`Download iniciado: ${document.name}`);
    
    // Simular download
    const link = window.document.createElement('a');
    link.href = '#'; // Em produção, seria a URL real do arquivo
    link.download = document.name;
    // link.click(); // Descomentado em produção
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <ScreenHeader 
            title="Meus Documentos"
            description="Acesse seus contratos, notas fiscais e outros documentos."
            onBack={() => onBack?.()}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="text-sm text-gray-600">Ordens</p>
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
                placeholder="Buscar por nome, ID ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="contrato">Contratos</TabsTrigger>
                <TabsTrigger value="ordem-servico">Ordens de Serviço</TabsTrigger>
                <TabsTrigger value="nota-fiscal">Notas Fiscais</TabsTrigger>
                <TabsTrigger value="outros">Outros</TabsTrigger>
              </TabsList>
            </Tabs>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate">ID: {document.id}</span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: '#35BAE6' }} />
                            <span className="truncate">Enviado em: {document.uploadDate}</span>
                          </div>
                          {document.serviceId && (
                            <div className="flex items-center space-x-2 min-w-0">
                              <FileCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                              <span className="truncate">Serviço: {document.serviceId}</span>
                            </div>
                          )}
                          {document.period && (
                            <div className="flex items-center space-x-2 min-w-0">
                              <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                              <span className="truncate">Período: {document.period}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>Tamanho: {document.fileSize}</span>
                          {document.value && (
                            <>
                              <span>•</span>
                              <span className="font-medium" style={{ color: '#6400A4' }}>
                                Valor: R$ {document.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Badge
                                style={{
                                  backgroundColor: document.paymentStatus === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                  color: document.paymentStatus === 'paid' ? '#16a34a' : '#ca8a04'
                                }}
                              >
                                {document.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap"
                        style={{ borderColor: '#6400A4', color: '#6400A4' }}
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        style={{ backgroundColor: '#10B981', color: 'white' }}
                        className="whitespace-nowrap"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {viewingDocument?.name}
            </DialogTitle>
          </DialogHeader>

          {viewingDocument && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm" style={{ color: '#6400A4' }}>
                    {getTypeConfig(viewingDocument.type).label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ID</p>
                  <p className="text-sm text-gray-900">{viewingDocument.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="text-sm text-gray-900">{viewingDocument.uploadDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tamanho</p>
                  <p className="text-sm text-gray-900">{viewingDocument.fileSize}</p>
                </div>
              </div>

              {/* Document Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div 
                    className="h-24 w-24 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: getTypeConfig(viewingDocument.type).bgColor }}
                  >
                    <FileText className="h-12 w-12" style={{ color: getTypeConfig(viewingDocument.type).color }} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-2">Visualização de Documento</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {viewingDocument.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Em produção, o documento seria exibido aqui<br />
                      (PDF, imagem ou visualizador apropriado)
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadDocument(viewingDocument)}
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
    </div>
  );
}
