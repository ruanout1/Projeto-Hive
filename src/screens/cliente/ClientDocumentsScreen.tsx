import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, File, FileCheck, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import api from '../../lib/api';

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

// ✅ DADOS MOCK MOVIDOS PARA FORA (FALLBACK)
const FALLBACK_DOCUMENTS: ClientDocument[] = [
  { id: 'OS-2024-001', name: 'Ordem de Serviço - Outubro (1ª Quinzena)', type: 'ordem-servico', uploadDate: '16/10/2024', fileSize: '245 KB', value: 10250.00, paymentStatus: 'paid', period: '01/10/2024 a 15/10/2024' },
  { id: 'DOC-001', name: 'Contrato de Prestação de Serviços', type: 'contrato', uploadDate: '01/10/2024', fileSize: '2.5 MB' },
  { id: 'DOC-002', name: 'NF-2024-089', type: 'nota-fiscal', uploadDate: '15/10/2024', fileSize: '156 KB', serviceId: 'REQ-2024-005' },
  { id: 'DOC-004', name: 'NF-2024-076', type: 'nota-fiscal', uploadDate: '20/09/2024', fileSize: '142 KB', serviceId: 'REQ-2024-002' },
  { id: 'DOC-005', name: 'Certificado de Conformidade', type: 'outros', uploadDate: '12/10/2024', fileSize: '890 KB' },
];

export default function ClientDocumentsScreen({ onBack }: { onBack?: () => void }) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewingDocument, setViewingDocument] = useState<ClientDocument | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ClientDocument | null>(null);
  const [loading, setLoading] = useState(true); // ✅ ADICIONADO

  // ✅ CORRIGIDO: useEffect com api.ts e URL correta
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // ✅ CORRETO: Usando api.ts + URL /client-portal
        const response = await api.get('/client-portal/documents');
        
        if (response.data && Array.isArray(response.data)) {
          setDocuments(response.data);
          toast.success(' Documentos carregados do backend!');
        } else {
          setDocuments(FALLBACK_DOCUMENTS);
          toast.info('Usando dados de exemplo');
        }
      } catch (error: any) {
        console.error('⚠️ Erro ao buscar documentos:', error);
        
        if (error.code === 'ERR_NETWORK') {
          toast.info('Backend offline - usando dados de exemplo');
        } else {
          toast.error('Erro ao carregar documentos');
        }
        
        setDocuments(FALLBACK_DOCUMENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filtros
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.serviceId && doc.serviceId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeConfig = (type: DocumentType) => {
    const configs = {
      contrato: { label: 'Contrato', color: '#6400A4', bgColor: 'rgba(100,0,164,0.1)', icon: FileCheck },
      'nota-fiscal': { label: 'Nota Fiscal', color: '#10B981', bgColor: 'rgba(16,185,129,0.1)', icon: FileText },
      'ordem-servico': { label: 'Ordem de Serviço', color: '#8B20EE', bgColor: 'rgba(139,32,238,0.1)', icon: FileText },
      outros: { label: 'Outros', color: '#35BAE6', bgColor: 'rgba(53,186,230,0.1)', icon: File }
    };
    return configs[type];
  };

  const handleViewDocument = (doc: ClientDocument) => {
    setViewingDocument(doc);
    setIsViewDialogOpen(true);
  };

  // ✅ CORRIGIDO: Download usando api.ts
  const handleDownloadDocument = async (doc: ClientDocument) => {
    if (doc.type === 'nota-fiscal') {
      try {
        const idNum = doc.id.replace('DOC-', '').replace('NF-', '');
        
        // ✅ CORRETO: Usando api.ts para pegar o PDF
        const response = await api.get(`/client-portal/invoices/${idNum}/pdf`, {
          responseType: 'blob' // Para arquivos binários
        });
        
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${doc.name}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('Download iniciado!');
      } catch (error) {
        console.error('Erro no download:', error);
        toast.error('Erro ao baixar documento');
      }
    } else {
      toast.info(`⬇ Download simulado: ${doc.name}`);
    }
  };

  const confirmDelete = (doc: ClientDocument) => {
    setDocumentToDelete(doc);
    setIsDeleteConfirmOpen(true);
  };

  // ✅ CORRIGIDO: Delete usando api.ts
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      // ✅ CORRETO: Usando api.ts + URL /client-portal
      await api.delete(`/client-portal/documents/${documentToDelete.id}`);
      
      setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
      toast.success(' Documento excluído com sucesso!');
      setIsDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao remover documento do backend.');
    }
  };

  // ✅ ADICIONADO: Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 animate-spin text-purple-600" />
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <ScreenHeader
            title="Meus Documentos"
            description="Acesse seus contratos, notas fiscais e outros documentos."
            onBack={onBack}
          />

          {/* Barra de busca e filtro */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, ID ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={typeFilter} onValueChange={setTypeFilter}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="contrato">Contratos</TabsTrigger>
                <TabsTrigger value="ordem-servico">Ordens</TabsTrigger>
                <TabsTrigger value="nota-fiscal">Notas</TabsTrigger>
                <TabsTrigger value="outros">Outros</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="max-w-7xl mx-auto p-6 space-y-3">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => {
            const config = getTypeConfig(doc.type);
            const Icon = config.icon;
            return (
              <div key={doc.id} className="bg-white rounded-2xl p-5 border hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                      <Icon className="h-6 w-6" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#6400A4]">{doc.name}</h3>
                      <p className="text-sm text-gray-600">Enviado em {doc.uploadDate}</p>
                      <Badge 
                        className="mt-1 border-none text-xs"
                        style={{ backgroundColor: config.bgColor, color: config.color }}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      style={{ borderColor: '#6400A4', color: '#6400A4' }} 
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Visualizar
                    </Button>
                    <Button 
                      style={{ backgroundColor: '#10B981', color: 'white' }} 
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button 
                      variant="outline" 
                      style={{ borderColor: '#FF4B4B', color: '#FF4B4B' }} 
                      onClick={() => confirmDelete(doc)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Nenhum documento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>{viewingDocument?.name}</DialogTitle>
            <DialogDescription>
              Detalhes do documento selecionado
            </DialogDescription>
          </DialogHeader>
          {viewingDocument && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p><strong>ID:</strong> {viewingDocument.id}</p>
              <p><strong>Tipo:</strong> {getTypeConfig(viewingDocument.type).label}</p>
              <p><strong>Enviado em:</strong> {viewingDocument.uploadDate}</p>
              <p><strong>Tamanho:</strong> {viewingDocument.fileSize}</p>
              {viewingDocument.serviceId && (
                <p><strong>Serviço Vinculado:</strong> {viewingDocument.serviceId}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita
            </DialogDescription>
          </DialogHeader>
          <p className="text-gray-700 mb-4">
            Tem certeza que deseja excluir o documento <strong>{documentToDelete?.name}</strong>?<br />
            Essa ação não poderá ser desfeita.
          </p>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button style={{ backgroundColor: '#FF4B4B', color: 'white' }} onClick={handleDeleteDocument}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}