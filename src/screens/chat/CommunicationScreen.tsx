import { useState, useRef, useEffect } from 'react';
import { Send, Search, Plus, Phone, Video, MoreVertical, Paperclip, ChevronDown, ChevronRight, AlertCircle, AlertTriangle, UserX, HelpCircle, UserMinus, FileText, Bell, Edit, X, Info, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import React from 'react';


interface Contact {
  id: number;
  name: string;
  role: string;
  position?: string;
  status: 'online' | 'away' | 'offline';
  category: 'gestores' | 'colaboradores' | 'clientes' | 'administradores';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

interface CommunicationScreenProps {
  userType: string;
}

export default function CommunicationScreen({ userType }: CommunicationScreenProps) {
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos'); // novo filtro
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['gestores', 'colaboradores', 'clientes', 'administradores']);
  const [isTyping, setIsTyping] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionDescription, setActionDescription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data de contatos baseado no tipo de usuário
  const getAllContacts = (): Contact[] => {
    const contacts: Contact[] = [];

    // Administradores podem ver todos
    if (userType === 'administrador') {
      contacts.push(
        { id: 1, name: 'Ana Paula Rodrigues', role: 'Gestor', category: 'gestores', status: 'online', lastMessage: 'Equipe Alpha está pronta', lastMessageTime: '10:30', unreadCount: 2 },
        { id: 2, name: 'Fernanda Lima', role: 'Gestor', category: 'gestores', status: 'away', lastMessage: 'Preciso falar sobre orçamento', lastMessageTime: '09:15', unreadCount: 0 },
        { id: 3, name: 'Pedro Costa', role: 'Gestor', category: 'gestores', status: 'online', lastMessage: 'Relatório enviado', lastMessageTime: 'Ontem', unreadCount: 1 },
        { id: 4, name: 'Carlos Mendes', role: 'Colaborador', position: 'Faxineiro(a)', category: 'colaboradores', status: 'online', lastMessage: 'Turno concluído', lastMessageTime: '16:45', unreadCount: 0 },
        { id: 5, name: 'Marina Oliveira', role: 'Colaborador', position: 'Serviços Gerais', category: 'colaboradores', status: 'offline', lastMessage: 'Ok, obrigada!', lastMessageTime: 'Ontem', unreadCount: 0 },
        { id: 6, name: 'João Silva', role: 'Cliente', category: 'clientes', status: 'online', lastMessage: 'Quando começa o serviço?', lastMessageTime: '11:00', unreadCount: 3 },
        { id: 7, name: 'Maria Santos', role: 'Cliente', category: 'clientes', status: 'away', lastMessage: 'Obrigada pelo atendimento', lastMessageTime: '08:30', unreadCount: 0 }
      );
    }
    // Gestores podem falar com todos
    else if (userType === 'gestor') {
      contacts.push(
        { id: 1, name: 'Sistema Admin', role: 'Administrador', category: 'administradores', status: 'online', lastMessage: 'Novos colaboradores disponíveis', lastMessageTime: '09:00', unreadCount: 1 },
        { id: 2, name: 'Ana Paula Rodrigues', role: 'Gestor', category: 'gestores', status: 'online', lastMessage: 'Podemos trocar experiências', lastMessageTime: '10:30', unreadCount: 0 },
        { id: 4, name: 'Carlos Mendes', role: 'Colaborador', position: 'Faxineiro(a)', category: 'colaboradores', status: 'online', lastMessage: 'Turno concluído', lastMessageTime: '16:45', unreadCount: 0 },
        { id: 5, name: 'Marina Oliveira', role: 'Colaborador', position: 'Serviços Gerais', category: 'colaboradores', status: 'offline', lastMessage: 'Ok, obrigada!', lastMessageTime: 'Ontem', unreadCount: 0 },
        { id: 8, name: 'Roberto Silva', role: 'Colaborador', position: 'Porteiro', category: 'colaboradores', status: 'online', lastMessage: 'Entendido', lastMessageTime: '14:20', unreadCount: 0 },
        { id: 6, name: 'João Silva', role: 'Cliente', category: 'clientes', status: 'online', lastMessage: 'Quando começa o serviço?', lastMessageTime: '11:00', unreadCount: 3 },
        { id: 7, name: 'Maria Santos', role: 'Cliente', category: 'clientes', status: 'away', lastMessage: 'Obrigada pelo atendimento', lastMessageTime: '08:30', unreadCount: 0 }
      );
    }
    // Colaboradores só falam com gestores
    else if (userType === 'colaborador') {
      contacts.push(
        { id: 1, name: 'Ana Paula Rodrigues', role: 'Gestor', category: 'gestores', status: 'online', lastMessage: 'Ótimo trabalho hoje!', lastMessageTime: '17:30', unreadCount: 1 },
        { id: 2, name: 'Fernanda Lima', role: 'Gestor', category: 'gestores', status: 'away', lastMessage: 'Amanhã preciso que chegue mais cedo', lastMessageTime: '16:15', unreadCount: 0 }
      );
    }
    // Clientes falam com Admin
    else if (userType === 'cliente') {
      contacts.push(
        { id: 1, name: 'Sistema Hive', role: 'Administrador', category: 'administradores', status: 'online', lastMessage: 'Seu serviço foi agendado', lastMessageTime: '08:45', unreadCount: 1 },
        { id: 2, name: 'Ana Paula Rodrigues', role: 'Gestor Responsável', category: 'gestores', status: 'online', lastMessage: 'Chegarei às 9h', lastMessageTime: '07:30', unreadCount: 0 }
      );
    }

    return contacts;
  };

  const contacts = getAllContacts();

  // Mock de mensagens
  const [conversations, setConversations] = useState<{ [key: number]: Message[] }>({
    1: [
      { id: 1, senderId: 1, senderName: 'Ana Paula Rodrigues', content: 'Bom dia! Como está o andamento dos serviços hoje?', timestamp: '09:00', isOwn: false },
      { id: 2, senderId: 0, senderName: 'Você', content: 'Bom dia, Ana! Tudo correndo bem, equipe está motivada.', timestamp: '09:05', isOwn: true },
      { id: 3, senderId: 1, senderName: 'Ana Paula Rodrigues', content: 'Perfeito! Precisamos manter esse ritmo.', timestamp: '09:10', isOwn: false },
      { id: 4, senderId: 1, senderName: 'Ana Paula Rodrigues', content: 'Equipe Alpha está pronta', timestamp: '10:30', isOwn: false }
    ],
    6: [
      { id: 1, senderId: 6, senderName: 'João Silva', content: 'Olá, gostaria de confirmar o horário do serviço.', timestamp: '10:45', isOwn: false },
      { id: 2, senderId: 6, senderName: 'João Silva', content: 'Recebi a notificação mas queria confirmar pessoalmente.', timestamp: '10:47', isOwn: false },
      { id: 3, senderId: 6, senderName: 'João Silva', content: 'Quando começa o serviço?', timestamp: '11:00', isOwn: false }
    ]
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const currentMessages = selectedContactId ? (conversations[selectedContactId] || []) : [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Filtrar contatos por busca e categoria
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todos' || contact.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Agrupar contatos por categoria
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.category]) {
      acc[contact.category] = [];
    }
    acc[contact.category].push(contact);
    return acc;
  }, {} as { [key: string]: Contact[] });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const labels = {
    gestores: 'Gestores',
    colaboradores: 'Colaboradores',
    clientes: 'Clientes',
    administradores: 'Administradores'
  };
  
  const getCategoryLabel = (category: keyof typeof labels) => {
    return labels[category];
  };

  const getCategoryIcon = (category: string) => {
    const count = groupedContacts[category]?.length || 0;
    return (
      <Badge variant="secondary" className="ml-2">
        {count}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContactId) return;

    const newMessage: Message = {
      id: Date.now(),
      senderId: 0,
      senderName: 'Você',
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setConversations(prev => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMessage]
    }));

    setMessageInput('');

    // Simular resposta automática
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoReply: Message = {
        id: Date.now() + 1,
        senderId: selectedContactId,
        senderName: selectedContact?.name || 'Contato',
        content: 'Recebi sua mensagem! Vou responder em breve.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      setConversations(prev => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] || []), autoReply]
      }));
    }, 2000);
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContactId) {
      const newMessage: Message = {
        id: Date.now(),
        senderId: 0,
        senderName: 'Você',
        content: `Arquivo enviado: ${file.name}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        attachment: {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`
        }
      };

      setConversations(prev => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] || []), newMessage]
      }));

      toast.success('Arquivo anexado com sucesso!', {
        description: `O arquivo "${file.name}" foi enviado.`
      });
    }
  };

  const getQuickActions = () => {
    const actions = [];

    if (userType === 'gestor') {
      actions.push(
        { id: 'reportar-problema', label: 'Reportar Problema', icon: AlertCircle },
        { id: 'reportar-incidente', label: 'Reportar Incidente', icon: AlertTriangle },
        { id: 'reportar-falta', label: 'Reportar Falta', icon: UserX }
      );
    } else if (userType === 'colaborador') {
      actions.push(
        { id: 'solicitar-ajuda', label: 'Solicitar Ajuda', icon: HelpCircle },
        { id: 'avisar-ausencia', label: 'Avisar Ausência', icon: UserMinus }
      );
    } else if (userType === 'cliente') {
      actions.push(
        { id: 'abrir-chamado', label: 'Abrir Chamado', icon: FileText },
        { id: 'reportar-problema', label: 'Reportar Problema', icon: AlertCircle }
      );
    } else if (userType === 'administrador') {
      actions.push(
        { id: 'reportar-incidente', label: 'Reportar Incidente', icon: AlertTriangle },
        { id: 'enviar-aviso', label: 'Enviar Aviso', icon: Bell },
        { id: 'corrigir-informacao', label: 'Corrigir Informação', icon: Edit }
      );
    }

    return actions;
  };

  const handleQuickAction = (actionId: string) => {
    setSelectedAction(actionId);
    setActionDialogOpen(true);
  };

  const handleSubmitAction = () => {
    if (!actionDescription.trim()) {
      toast.error('Por favor, descreva a situação');
      return;
    }

    const actionLabels = {
      'reportar-problema': 'Problema reportado',
      'reportar-incidente': 'Incidente reportado',
      'reportar-falta': 'Falta reportada',
      'solicitar-ajuda': 'Ajuda solicitada',
      'avisar-ausencia': 'Ausência avisada',
      'abrir-chamado': 'Chamado aberto',
      'enviar-aviso': 'Aviso enviado',
      'corrigir-informacao': 'Informação corrigida'
    };

    const label = actionLabels[selectedAction as keyof typeof actionLabels] || 'Ação realizada';

    if (selectedContactId) {
      const newMessage: Message = {
        id: Date.now(),
        senderId: 0,
        senderName: 'Você',
        content: `🔔 ${label}:\n${actionDescription}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };

      setConversations(prev => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] || []), newMessage]
      }));
    }

    toast.success(label, {
      description: 'A mensagem foi enviada com sucesso.'
    });

    setActionDialogOpen(false);
    setActionDescription('');
    setSelectedAction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Ausente';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Obter categorias disponíveis
  const availableCategories = Array.from(new Set(contacts.map(c => c.category)));

  const categoryFilters = [
    { id: 'todos', label: 'Todos', color: '#6400A4' },
    { id: 'gestores', label: 'Gestores', color: '#8B20EE' },
    { id: 'colaboradores', label: 'Colaboradores', color: '#35BAE6' },
    { id: 'clientes', label: 'Clientes', color: '#FFFF20' },
    { id: 'administradores', label: 'Admins', color: '#6400A4' }
  ].filter(filter => filter.id === 'todos' || availableCategories.includes(filter.id as any));

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="max-w-full mx-auto">
          <h1 className="hive-screen-title">Central de Comunicação</h1>
          <p className="text-sm text-gray-600">
            {userType === 'administrador' && 'Comunique-se com gestores, colaboradores e clientes.'}
            {userType === 'gestor' && 'Coordene sua equipe e atenda clientes.'}
            {userType === 'colaborador' && 'Mantenha contato com seus gestores.'}
            {userType === 'cliente' && 'Entre em contato com o suporte e seu gestor.'}
          </p>
        </div>
      </div>

      {/* Main Content - Fixed Height */}
      <div className="flex flex-1 min-h-0">
        {/* Lista de Contatos - Coluna Esquerda */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header da Lista - Fixed */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ color: '#6400A4' }}>Contatos</h2>
              <Button
                size="sm"
                onClick={() => toast.info('Adicionar Contato', { description: 'Funcionalidade em desenvolvimento' })}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filtros de Categoria */}
            <div className="flex flex-wrap gap-2 mb-3">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setCategoryFilter(filter.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    categoryFilter === filter.id
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={categoryFilter === filter.id ? {
                    backgroundColor: filter.color,
                    ...(filter.id === 'clientes' && { color: '#000' })
                  } : {}}
                >
                  {filter.label}
                  {filter.id !== 'todos' && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 px-1.5 py-0"
                      style={categoryFilter === filter.id ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: filter.id === 'clientes' ? '#000' : '#fff'
                      } : {}}
                    >
                      {contacts.filter(c => c.category === filter.id).length}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Contatos Agrupada - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-2">
              {Object.entries(groupedContacts).map(([category, categoryContacts]) => (
                <div key={category} className="mb-2">
                  {/* Header da Categoria */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      {expandedCategories.includes(category) ? (
                        <ChevronDown className="h-4 w-4 mr-2" style={{ color: '#6400A4' }} />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" style={{ color: '#6400A4' }} />
                      )}
                      <span className="text-sm" style={{ color: '#6400A4' }}>
                        {getCategoryLabel(category)}
                      </span>
                      {getCategoryIcon(category)}
                    </div>
                  </button>

                  {/* Contatos da Categoria */}
                  {expandedCategories.includes(category) && (
                    <div className="ml-2 mt-1 space-y-1">
                      {categoryContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedContactId(contact.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedContactId === contact.id
                              ? 'border-2 border-l-4'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          style={selectedContactId === contact.id ? {
                            backgroundColor: 'rgba(100, 0, 164, 0.05)',
                            borderColor: '#6400A4',
                            borderLeftColor: '#6400A4'
                          } : {}}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-10 w-10" style={{ backgroundColor: '#6400A4' }}>
                                <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                                  {getInitials(contact.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm truncate" style={{ color: '#6400A4' }}>
                                  {contact.name}
                                </p>
                                {contact.lastMessageTime && (
                                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {contact.lastMessageTime}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                {contact.role}
                                {contact.position && ` • ${contact.position}`}
                              </p>
                              {contact.lastMessage && (
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500 truncate flex-1">
                                    {contact.lastMessage}
                                  </p>
                                  {contact.unreadCount && contact.unreadCount > 0 && (
                                    <Badge
                                      className="ml-2 flex-shrink-0"
                                      style={{ backgroundColor: '#FFFF20', color: '#000' }}
                                    >
                                      {contact.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum contato encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área de Conversa - Coluna Central */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          {selectedContact ? (
            <>
              {/* Header da Conversa - Fixed */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                        <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                          {getInitials(selectedContact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(selectedContact.status)}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 style={{ color: '#6400A4' }} className="truncate">{selectedContact.name}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600 truncate">
                          {selectedContact.role}
                          {selectedContact.position && ` • ${selectedContact.position}`}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          • {getStatusText(selectedContact.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Chamada de Áudio', { description: 'Funcionalidade em desenvolvimento' })}
                      style={{ borderColor: '#6400A4', color: '#6400A4' }}
                      className="hover:bg-purple-50"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Chamada de Vídeo', { description: 'Funcionalidade em desenvolvimento' })}
                      style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
                      className="hover:bg-blue-50"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                      className="hover:bg-purple-50"
                    >
                      <Info className="h-4 w-4" />
                    </Button>

                    {/* Menu de Ações Rápidas */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ borderColor: '#6400A4', color: '#6400A4' }}
                          className="hover:bg-purple-50"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5">
                          <p className="text-xs text-gray-500">Ações Rápidas</p>
                        </div>
                        <DropdownMenuSeparator />
                        {getQuickActions().map((action) => {
                          const Icon = action.icon;
                          return (
                            <DropdownMenuItem
                              key={action.id}
                              onClick={() => handleQuickAction(action.id)}
                              className="cursor-pointer"
                            >
                              <Icon className="h-4 w-4 mr-2" style={{ color: '#6400A4' }} />
                              {action.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Mensagens - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-[70%] ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!message.isOwn && (
                          <Avatar className="h-8 w-8 flex-shrink-0" style={{ backgroundColor: '#6400A4' }}>
                            <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontSize: '0.75rem' }}>
                              {getInitials(message.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="min-w-0">
                          {!message.isOwn && (
                            <p className="text-xs text-gray-500 mb-1 ml-2">{message.senderName}</p>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl break-words ${
                              message.isOwn
                                ? 'rounded-br-sm text-white'
                                : 'bg-gray-100 text-black rounded-bl-sm'
                            }`}
                            style={message.isOwn ? { backgroundColor: '#6400A4' } : {}}
                          >
                            {message.attachment ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/10">
                                  <Paperclip className="h-4 w-4 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{message.attachment.name}</p>
                                    <p className="text-xs opacity-75">{message.attachment.size}</p>
                                  </div>
                                </div>
                                {message.content && <p className="text-sm">{message.content}</p>}
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                            <p className={`text-xs mt-1 ${message.isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Indicador de digitação */}
                  {isTyping && (
                    <div className="flex items-end space-x-2">
                      <Avatar className="h-8 w-8" style={{ backgroundColor: '#6400A4' }}>
                        <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontSize: '0.75rem' }}>
                          {selectedContact ? getInitials(selectedContact.name) : ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Barra de Envio - Fixed */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <div className="flex items-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAttachFile}
                    style={{ borderColor: '#6400A4', color: '#6400A4' }}
                    className="hover:bg-purple-50 flex-shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    style={{ backgroundColor: '#6400A4', color: 'white' }}
                    className="hover:opacity-90 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                  <Send className="h-12 w-12" style={{ color: '#6400A4' }} />
                </div>
                <h3 className="text-xl mb-2" style={{ color: '#6400A4' }}>
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha um contato na lista para iniciar ou continuar uma conversa
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Painel de Informações do Contato - Coluna Direita */}
        {showContactInfo && selectedContact && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 style={{ color: '#6400A4' }}>Informações do Contato</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowContactInfo(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
              {/* Perfil do Contato */}
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3" style={{ backgroundColor: '#6400A4' }}>
                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontSize: '1.5rem' }}>
                    {getInitials(selectedContact.name)}
                  </AvatarFallback>
                </Avatar>
                <h4 style={{ color: '#6400A4' }}>{selectedContact.name}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedContact.role}
                  {selectedContact.position && ` • ${selectedContact.position}`}
                </p>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: selectedContact.status === 'online' ? '#10B981' : selectedContact.status === 'away' ? '#F59E0B' : '#9CA3AF',
                    color: selectedContact.status === 'online' ? '#10B981' : selectedContact.status === 'away' ? '#F59E0B' : '#9CA3AF'
                  }}
                >
                  {getStatusText(selectedContact.status)}
                </Badge>
              </div>

              <Separator />

              {/* Ações Rápidas */}
              <div>
                <p className="text-sm mb-3" style={{ color: '#6400A4' }}>Ações Rápidas</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.info('Chamada de Áudio', { description: 'Funcionalidade em desenvolvimento' })}
                  >
                    <Phone className="h-4 w-4 mr-2" style={{ color: '#6400A4' }} />
                    Ligar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.info('Chamada de Vídeo', { description: 'Funcionalidade em desenvolvimento' })}
                  >
                    <Video className="h-4 w-4 mr-2" style={{ color: '#35BAE6' }} />
                    Videochamada
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.info('Enviar Relatório', { description: 'Funcionalidade em desenvolvimento' })}
                  >
                    <FileText className="h-4 w-4 mr-2" style={{ color: '#8B20EE' }} />
                    Enviar Relatório
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Histórico Resumido */}
              <div>
                <p className="text-sm mb-3" style={{ color: '#6400A4' }}>Histórico de Interações</p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#6400A4' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Última conversa</p>
                      <p className="text-xs text-gray-500">Hoje às {selectedContact.lastMessageTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#35BAE6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">3 relatórios enviados</p>
                      <p className="text-xs text-gray-500">Este mês</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#8B20EE' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Localização</p>
                      <p className="text-xs text-gray-500">São Paulo, SP</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projetos Relacionados */}
              {selectedContact.category === 'colaboradores' && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm mb-3" style={{ color: '#6400A4' }}>Projetos Ativos</p>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">Condomínio Vista Verde</p>
                        <p className="text-xs text-gray-500">Limpeza • 5 dias/semana</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">Edifício Empresarial</p>
                        <p className="text-xs text-gray-500">Portaria • Turno noturno</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Ações Rápidas */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {selectedAction && getQuickActions().find(a => a.id === selectedAction)?.label}
            </DialogTitle>
            <DialogDescription>
              Descreva a situação para que possamos processar sua solicitação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="action-description" style={{ color: '#6400A4' }}>Descrição *</Label>
              <Textarea
                id="action-description"
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                placeholder="Descreva a situação em detalhes..."
                rows={5}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false);
                setActionDescription('');
                setSelectedAction(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitAction}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
              disabled={!actionDescription.trim()}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}