import { useState, useEffect, useMemo } from 'react';
import { FileText, Upload, Download, Eye, Edit, Trash2, Plus, Search, File, FileCheck, EyeOff, Loader2 } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

// ============================================================================
// TYPES - De acordo com o banco de dados
// ============================================================================
type DocumentType = 'contract' | 'invoice' | 'service_order' | 'other';

interface Document {
  document_id: number;
  document_number: string;
  document_type: DocumentType;
  name: string;
  description?: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  client_id: number;
  client_name?: string;
  service_order_id?: number;
  is_available_to_client: boolean;
  uploaded_at: string;
  uploaded_by_name?: string;
}

interface Client {
  client_id: number;
  main_company_name: string;
  full_name: string;
  email: string;
}

interface AdminDocumentsScreenProps {
  onBack?: () => void;
}

// ============================================================================
// API CONFIG - PORTA 3000
// ============================================================================
const API_BASE = 'http://localhost:3000/api/documents';

// Função para obter headers com autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function AdminDocumentsScreen({ onBack }: AdminDocumentsScreenProps) {
  // ==========================================================================
  // STATE
  // ==========================================================================
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [originalDocument, setOriginalDocument] = useState<Document | null>(null);
  
  // Dialogs
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  // New document form
  const [newDocument, setNewDocument] = useState({
    name: '',
    description: '',
    document_type: 'contract' as DocumentType,
    client_id: '',
    file: null as File | null
  });

  // ==========================================================================
  // FETCH DOCUMENTS
  // ==========================================================================
  const fetchDocuments = async () => {
    console.log('🔄 Buscando documentos...');
    setLoading(true);
    
    try {
      const res = await fetch(API_BASE, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }
      
      const json = await res.json();
      console.log('📦 Resposta:', json);
      
      if (!json.success) {
        throw new Error(json.message || 'Erro ao carregar');
      }
      
      if (!Array.isArray(json.data)) {
        throw new Error('Formato inválido');
      }
      
      const normalized = json.data.map((doc: any) => ({
        ...doc,
        is_available_to_client: Boolean(doc.is_available_to_client)
      }));
      
      console.log('✅ Carregados:', normalized.length);
      setDocuments(normalized);
      
    } catch (err) {
      console.error('❌ Erro:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // FETCH CLIENTS
  // ==========================================================================
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch(`${API_BASE}/clients`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }
      
      const json = await res.json();
      
      if (!json.success) {
        throw new Error(json.message || 'Erro ao carregar clientes');
      }
      
      setClients(json.data || []);
      
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
      toast.error('Não foi possível carregar lista de clientes');
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // ==========================================================================
  // UPLOAD DOCUMENT
  // ==========================================================================
  const handleUploadDocument = async () => {
    if (!newDocument.name.trim()) {
      toast.error('Preencha o nome do documento');
      return;
    }
    
    if (!newDocument.client_id.trim()) {
      toast.error('Selecione um cliente');
      return;
    }
    
    const clientIdNum = parseInt(newDocument.client_id);
    if (isNaN(clientIdNum) || clientIdNum <= 0) {
      toast.error('Cliente inválido');
      return;
    }
    
    if (!newDocument.file) {
      toast.error('Selecione um arquivo');
      return;
    }

    try {
      setSaving(true);
      
      // Simular URL de arquivo (em produção, fazer upload real)
      const fakeFileUrl = `/uploads/${Date.now()}_${newDocument.file.name}`;
      
      const payload = {
        document_type: newDocument.document_type,
        name: newDocument.name.trim(),
        description: newDocument.description.trim() || undefined,
        file_url: fakeFileUrl,
        file_size: newDocument.file.size,
        mime_type: newDocument.file.type,
        client_id: clientIdNum,
        uploaded_by_user_id: null,
        is_available_to_client: false
      };

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || `Erro HTTP: ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Erro ao criar');
      }

      toast.success('✅ Documento criado!');
      
      setIsUploadDialogOpen(false);
      setNewDocument({
        name: '',
        description: '',
        document_type: 'contract',
        client_id: '',
        file: null
      });
      
      await fetchDocuments();
      
    } catch (err) {
      console.error('❌ Erro:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao criar');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================================
  // EDIT DOCUMENT
  // ==========================================================================
  const handleEditDocument = async () => {
    if (!selectedDocument) return;
    
    if (!selectedDocument.name.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        name: selectedDocument.name.trim(),
        description: selectedDocument.description?.trim() || undefined,
        document_type: selectedDocument.document_type,
        is_available_to_client: selectedDocument.is_available_to_client
      };

      const res = await fetch(`${API_BASE}/${selectedDocument.document_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Erro ao atualizar');
      }

      toast.success('✅ Atualizado!');
      
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
      setOriginalDocument(null);
      
      await fetchDocuments();
      
    } catch (err) {
      console.error('❌ Erro:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================================
  // DELETE DOCUMENT
  // ==========================================================================
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      const res = await fetch(`${API_BASE}/${selectedDocument.document_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Erro ao excluir');
      }

      toast.success('✅ Excluído!');
      
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
      
      await fetchDocuments();
      
    } catch (err) {
      console.error('❌ Erro:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  // ==========================================================================
  // TOGGLE VISIBILITY
  // ==========================================================================
  const handleToggleVisibility = async (document: Document) => {
    try {
      const res = await fetch(`${API_BASE}/${document.document_id}/toggle-visibility`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Erro');
      }

      toast.success(
        !document.is_available_to_client ? 
        '✅ Disponibilizado' : 
        '🔒 Ocultado'
      );
      
      await fetchDocuments();
      
    } catch (err) {
      console.error('❌ Erro:', err);
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  // ==========================================================================
  // VIEW & DOWNLOAD
  // ==========================================================================
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleDownloadDocument = (document: Document) => {
    toast.success(`📥 Download: ${document.name}`);
  };

  // ==========================================================================
  // EDIT DIALOG
  // ==========================================================================
  const openEditDialog = (document: Document) => {
    setSelectedDocument({...document});
    setOriginalDocument({...document});
    setIsEditDialogOpen(true);
  };

  const hasChanges = () => {
    if (!selectedDocument || !originalDocument) return false;
    return JSON.stringify(selectedDocument) !== JSON.stringify(originalDocument);
  };

  // ==========================================================================
  // FILTERED DOCUMENTS
  // ==========================================================================
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
      
      const matchesVisibility = visibilityFilter === 'all' || 
        (visibilityFilter === 'visible' && doc.is_available_to_client === true) ||
        (visibilityFilter === 'hidden' && doc.is_available_to_client === false);
      
      return matchesSearch && matchesType && matchesVisibility;
    });
  }, [documents, searchTerm, typeFilter, visibilityFilter]);

  // ==========================================================================
  // DOCUMENT COUNTS
  // ==========================================================================
  const documentCounts = useMemo(() => ({
    total: documents.length,
    contratos: documents.filter(d => d.document_type === 'contract').length,
    notasFiscais: documents.filter(d => d.document_type === 'invoice').length,
    ordensServico: documents.filter(d => d.document_type === 'service_order').length,
    outros: documents.filter(d => d.document_type === 'other').length,
    visible: documents.filter(d => d.is_available_to_client === true).length,
    hidden: documents.filter(d => d.is_available_to_client === false).length
  }), [documents]);

  // ==========================================================================
  // TYPE CONFIG
  // ==========================================================================
  const getTypeConfig = (type: DocumentType) => {
    const configs = {
      'contract': {
        label: 'Contrato',
        color: '#6400A4',
        bgColor: 'rgba(100, 0, 164, 0.1)',
        icon: FileCheck
      },
      'invoice': {
        label: 'Nota Fiscal',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: FileText
      },
      'service_order': {
        label: 'Ordem de Serviço',
        color: '#8B20EE',
        bgColor: 'rgba(139, 32, 238, 0.1)',
        icon: FileText
      },
      'other': {
        label: 'Outros',
        color: '#35BAE6',
        bgColor: 'rgba(53, 186, 230, 0.1)',
        icon: File
      }
    };
    return configs[type];
  };

  // ==========================================================================
  // FORMATTERS
  // ==========================================================================
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================
  useEffect(() => {
    fetchDocuments();
    fetchClients();
  }, []);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
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

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-xl font-bold" style={{ color: '#6400A4' }}>{documentCounts.total}</p>
                </div>
                <FileText className="h-6 w-6" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Contratos</p>
                  <p className="text-xl font-bold" style={{ color: '#6400A4' }}>{documentCounts.contratos}</p>
                </div>
                <FileCheck className="h-6 w-6" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">NFs</p>
                  <p className="text-xl font-bold text-green-600">{documentCounts.notasFiscais}</p>
                </div>
                <FileText className="h-6 w-6 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">OSs</p>
                  <p className="text-xl font-bold" style={{ color: '#8B20EE' }}>{documentCounts.ordensServico}</p>
                </div>
                <FileText className="h-6 w-6" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Outros</p>
                  <p className="text-xl font-bold" style={{ color: '#35BAE6' }}>{documentCounts.outros}</p>
                </div>
                <File className="h-6 w-6" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Visíveis</p>
                  <p className="text-xl font-bold text-green-600">{documentCounts.visible}</p>
                </div>
                <Eye className="h-6 w-6 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Ocultos</p>
                  <p className="text-xl font-bold text-gray-600">{documentCounts.hidden}</p>
                </div>
                <EyeOff className="h-6 w-6 text-gray-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
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
                <TabsTrigger value="contract">Contratos</TabsTrigger>
                <TabsTrigger value="invoice">NFs</TabsTrigger>
                <TabsTrigger value="service_order">OSs</TabsTrigger>
                <TabsTrigger value="other">Outros</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos</option>
              <option value="visible">Visíveis ao Cliente</option>
              <option value="hidden">Ocultos do Cliente</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENTS LIST */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#6400A4' }} />
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">
                {documents.length === 0 ? 'Nenhum documento cadastrado' : 'Nenhum resultado'}
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => {
              const typeConfig = getTypeConfig(document.document_type);
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={document.document_id}
                  className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: typeConfig.bgColor }}
                      >
                        <TypeIcon className="h-6 w-6" style={{ color: typeConfig.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 className="font-semibold truncate" style={{ color: '#6400A4' }}>
                            {document.name}
                          </h3>
                          
                          <Badge
                            style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                            className="border-none flex-shrink-0"
                          >
                            {typeConfig.label}
                          </Badge>
                          
                          <Badge
                            variant={document.is_available_to_client === true ? 'default' : 'secondary'}
                            style={document.is_available_to_client === true ? { backgroundColor: '#10B981', color: 'white' } : {}}
                            className="border-none flex items-center gap-1 flex-shrink-0"
                          >
                            {document.is_available_to_client === true ? (
                              <>
                                <Eye className="h-3 w-3" />
                                Visível
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Oculto
                              </>
                            )}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate">ID: {document.document_number}</span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#35BAE6' }} />
                            <span className="truncate">{document.client_name || 'Cliente não informado'}</span>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>Enviado em: {formatDate(document.uploaded_at)}</span>
                          <span>•</span>
                          <span>Tamanho: {formatFileSize(document.file_size)}</span>
                          {document.uploaded_by_name && (
                            <>
                              <span>•</span>
                              <span>Por: {document.uploaded_by_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVisibility(document)}
                        className="whitespace-nowrap"
                        style={document.is_available_to_client === true ? { borderColor: '#10B981', color: '#10B981' } : {}}
                      >
                        {document.is_available_to_client === true ? (
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
                        Ver
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

      {/* UPLOAD DIALOG */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsUploadDialogOpen(false);
          setNewDocument({
            name: '',
            description: '',
            document_type: 'contract',
            client_id: '',
            file: null
          });
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>Anexar Novo Documento</DialogTitle>
            <DialogDescription>Faça upload de contratos, notas fiscais ou outros documentos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tipo de Documento*</Label>
              <select
                value={newDocument.document_type}
                onChange={(e) => setNewDocument({...newDocument, document_type: e.target.value as DocumentType})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="contract">Contrato</option>
                <option value="invoice">Nota Fiscal</option>
                <option value="service_order">Ordem de Serviço</option>
                <option value="other">Outros</option>
              </select>
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
              <Label>Descrição</Label>
              <Input
                value={newDocument.description}
                onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                placeholder="Descrição opcional"
              />
            </div>

            <div>
              <Label>Cliente*</Label>
              {loadingClients ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                  Carregando clientes...
                </div>
              ) : (
                <select
                  value={newDocument.client_id}
                  onChange={(e) => setNewDocument({...newDocument, client_id: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.main_company_name || client.full_name} - {client.email}
                    </option>
                  ))}
                </select>
              )}
              {clients.length === 0 && !loadingClients && (
                <p className="text-xs text-red-500 mt-1">
                  Nenhum cliente cadastrado
                </p>
              )}
            </div>

            <div>
              <Label>Arquivo*</Label>
              <Input
                type="file"
                onChange={(e) => setNewDocument({...newDocument, file: e.target.files?.[0] || null})}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
              </p>
              {newDocument.file && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {newDocument.file.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUploadDocument} 
              disabled={saving}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Anexando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false);
          setSelectedDocument(null);
          setOriginalDocument(null);
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>Editar Documento</DialogTitle>
            <DialogDescription>{selectedDocument?.document_number}</DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <Label>Tipo de Documento*</Label>
                <select
                  value={selectedDocument.document_type}
                  onChange={(e) => setSelectedDocument({...selectedDocument, document_type: e.target.value as DocumentType})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="contract">Contrato</option>
                  <option value="invoice">Nota Fiscal</option>
                  <option value="service_order">Ordem de Serviço</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div>
                <Label>Nome do Documento*</Label>
                <Input
                  value={selectedDocument.name}
                  onChange={(e) => setSelectedDocument({...selectedDocument, name: e.target.value})}
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={selectedDocument.description || ''}
                  onChange={(e) => setSelectedDocument({...selectedDocument, description: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditDocument} 
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              disabled={!hasChanges() || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsViewDialogOpen(false);
          setSelectedDocument(null);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>{selectedDocument?.name}</DialogTitle>
            <DialogDescription>Visualização completa do documento</DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm font-semibold" style={{ color: '#6400A4' }}>
                    {getTypeConfig(selectedDocument.document_type).label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm text-gray-900">{selectedDocument.client_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedDocument.uploaded_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tamanho</p>
                  <p className="text-sm text-gray-900">{formatFileSize(selectedDocument.file_size)}</p>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div 
                    className="h-24 w-24 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: getTypeConfig(selectedDocument.document_type).bgColor }}
                  >
                    <FileText className="h-12 w-12" style={{ color: getTypeConfig(selectedDocument.document_type).color }} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-2">Visualização de Documento</h3>
                    <p className="text-sm text-gray-500 mb-4">{selectedDocument.name}</p>
                    <p className="text-xs text-gray-400">
                      Em produção, o documento seria exibido aqui
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    style={{ backgroundColor: '#10B981', color: 'white' }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDeleteDialogOpen(false);
          setSelectedDocument(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#6400A4' }}>Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedDocument?.name}"? Esta ação não pode ser desfeita.
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