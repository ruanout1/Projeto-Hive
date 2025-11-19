import { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Phone, Mail, Calendar, Clock, User, Bot, CheckCircle, 
  MoreVertical, Paperclip, Image as ImageIcon, File, X, Search
} from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { toast } from 'sonner';
import api from '../../lib/api'; // ✅ Preparado para usar api.ts quando backend estiver pronto

// ============================================
// 🔧 STATUS: MOCK DATA (Backend ainda não implementado)
// ✅ Estrutura preparada para integração futura
// ✅ api.ts importado e pronto para uso
// ⏳ Aguardando implementação do backend
// ============================================

interface Message {
  id: string;
  sender: 'client' | 'team' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
}

interface Conversation {
  id: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: string[];
  status: 'active' | 'archived' | 'closed';
  messages: Message[];
}

export default function ClientCommunicationScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // ⏳ TODO: Implementar quando backend estiver pronto
      // const response = await api.get('/client-portal/communications');
      // setConversations(response.data.data);

      // MOCK DATA temporário
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula loading
      setConversations(mockConversations);
      
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageData = {
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
        type: 'text'
      };

      // ⏳ TODO: Implementar quando backend estiver pronto
      // const response = await api.post('/client-portal/communications/message', messageData);
      // const newMsg = response.data.data;

      // MOCK: Adiciona mensagem localmente
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'client',
        senderName: 'Você',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'text',
        read: true
      };

      // Atualiza conversação selecionada
      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMsg],
        lastMessage: newMsg.content,
        lastMessageTime: newMsg.timestamp
      };

      // Atualiza lista de conversas
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id ? updatedConversation : conv
      ));

      setSelectedConversation(updatedConversation);
      setNewMessage('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (conversationId: string) => {
    try {
      // ⏳ TODO: Implementar quando backend estiver pronto
      // await api.patch(`/client-portal/communications/${conversationId}/read`);

      // MOCK: Atualiza localmente
      setConversations(conversations.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleStartNewConversation = async () => {
    try {
      // ⏳ TODO: Implementar modal para nova conversa
      toast.info('Funcionalidade em desenvolvimento');
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSenderInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSenderColor = (sender: string) => {
    if (sender === 'system') return '#9CA3AF';
    if (sender === 'team') return '#8B20EE';
    return '#35BAE6';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ScreenHeader title="Comunicações" subtitle="Converse com nossa equipe" />
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#8B20EE' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScreenHeader title="Comunicações" subtitle="Converse com nossa equipe" />

      <div className="p-6 max-w-7xl mx-auto">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 h-[600px]">
            {/* Conversations List */}
            <div className="col-span-4 border-r bg-white">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleStartNewConversation}
                  style={{ backgroundColor: '#8B20EE' }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
              </div>

              <div className="overflow-y-auto h-[calc(600px-120px)]">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 text-sm">Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        if (conv.unreadCount > 0) {
                          handleMarkAsRead(conv.id);
                        }
                      }}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conv.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' }}>
                            <MessageSquare className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">{conv.subject}</h4>
                            {conv.unreadCount > 0 && (
                              <Badge 
                                style={{ 
                                  backgroundColor: '#8B20EE',
                                  color: 'white',
                                  fontSize: '10px',
                                  padding: '2px 6px'
                                }}
                              >
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(conv.lastMessageTime).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="col-span-8 flex flex-col bg-gray-50">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 bg-white border-b flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedConversation.subject}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.participants.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isClient = message.sender === 'client';
                      const isSystem = message.sender === 'system';

                      if (isSystem) {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-gray-200 rounded-full px-4 py-1 text-xs text-gray-600">
                              {message.content}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={message.id} 
                          className={`flex gap-3 ${isClient ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="flex-shrink-0">
                            <AvatarFallback 
                              style={{ 
                                backgroundColor: `${getSenderColor(message.sender)}20`,
                                color: getSenderColor(message.sender)
                              }}
                            >
                              {isClient ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 max-w-[70%] ${isClient ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {message.senderName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div 
                              className={`rounded-lg p-3 ${
                                isClient 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-white border'
                              }`}
                            >
                              {message.type === 'text' ? (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              ) : message.type === 'image' ? (
                                <div>
                                  <img 
                                    src={message.fileUrl} 
                                    alt="Imagem enviada" 
                                    className="max-w-full rounded mb-2"
                                  />
                                  {message.content && (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <File className="h-5 w-5" />
                                  <div>
                                    <p className="text-sm font-medium">{message.fileName}</p>
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="h-auto p-0 text-xs"
                                    >
                                      Baixar arquivo
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                            {message.read && isClient && (
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <CheckCircle className="h-3 w-3 text-blue-600" />
                                <span className="text-xs text-gray-500">Lida</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t">
                    <div className="flex items-end gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Textarea
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        style={{ backgroundColor: '#8B20EE' }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-500">
                      Escolha uma conversa à esquerda para começar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// MOCK DATA (Temporário - até backend estar pronto)
// ============================================

const mockConversations: Conversation[] = [
  {
    id: '1',
    subject: 'Dúvida sobre próximo serviço',
    lastMessage: 'Obrigado pela resposta! Ficou esclarecido.',
    lastMessageTime: '2024-11-18T10:30:00',
    unreadCount: 0,
    participants: ['Você', 'Equipe Hive'],
    status: 'active',
    messages: [
      {
        id: 'm1',
        sender: 'client',
        senderName: 'Você',
        content: 'Olá! Gostaria de saber se vocês podem adiantar o serviço agendado para semana que vem?',
        timestamp: '2024-11-18T09:00:00',
        type: 'text',
        read: true
      },
      {
        id: 'm2',
        sender: 'team',
        senderName: 'Maria Silva',
        content: 'Olá! Sim, podemos verificar a disponibilidade da equipe. Qual dia seria melhor para você?',
        timestamp: '2024-11-18T09:15:00',
        type: 'text',
        read: true
      },
      {
        id: 'm3',
        sender: 'client',
        senderName: 'Você',
        content: 'Quarta-feira pela manhã seria perfeito!',
        timestamp: '2024-11-18T09:20:00',
        type: 'text',
        read: true
      },
      {
        id: 'm4',
        sender: 'team',
        senderName: 'Maria Silva',
        content: 'Perfeito! Já reagendei para quarta-feira às 09:00. Você receberá uma confirmação por e-mail em breve.',
        timestamp: '2024-11-18T10:00:00',
        type: 'text',
        read: true
      },
      {
        id: 'm5',
        sender: 'client',
        senderName: 'Você',
        content: 'Obrigado pela resposta! Ficou esclarecido.',
        timestamp: '2024-11-18T10:30:00',
        type: 'text',
        read: true
      }
    ]
  },
  {
    id: '2',
    subject: 'Solicitação de orçamento',
    lastMessage: 'Vou enviar o orçamento detalhado até o final do dia.',
    lastMessageTime: '2024-11-17T14:20:00',
    unreadCount: 1,
    participants: ['Você', 'Equipe Hive'],
    status: 'active',
    messages: [
      {
        id: 'm6',
        sender: 'client',
        senderName: 'Você',
        content: 'Boa tarde! Preciso de um orçamento para limpeza pós-obra.',
        timestamp: '2024-11-17T13:00:00',
        type: 'text',
        read: true
      },
      {
        id: 'm7',
        sender: 'team',
        senderName: 'João Santos',
        content: 'Boa tarde! Claro, posso ajudar. Você teria fotos do local?',
        timestamp: '2024-11-17T13:30:00',
        type: 'text',
        read: true
      },
      {
        id: 'm8',
        sender: 'client',
        senderName: 'Você',
        content: 'Sim, vou enviar algumas fotos agora.',
        timestamp: '2024-11-17T14:00:00',
        type: 'text',
        read: true
      },
      {
        id: 'm9',
        sender: 'team',
        senderName: 'João Santos',
        content: 'Vou enviar o orçamento detalhado até o final do dia.',
        timestamp: '2024-11-17T14:20:00',
        type: 'text',
        read: false
      }
    ]
  },
  {
    id: '3',
    subject: 'Feedback sobre serviço',
    lastMessage: 'Muito obrigado pelo feedback positivo!',
    lastMessageTime: '2024-11-15T16:45:00',
    unreadCount: 0,
    participants: ['Você', 'Equipe Hive'],
    status: 'closed',
    messages: [
      {
        id: 'm10',
        sender: 'client',
        senderName: 'Você',
        content: 'Gostaria de parabenizar a equipe pelo excelente trabalho realizado ontem!',
        timestamp: '2024-11-15T16:00:00',
        type: 'text',
        read: true
      },
      {
        id: 'm11',
        sender: 'team',
        senderName: 'Carlos Mendes',
        content: 'Muito obrigado pelo feedback positivo! Ficamos muito felizes em saber que você gostou do nosso trabalho. 😊',
        timestamp: '2024-11-15T16:45:00',
        type: 'text',
        read: true
      }
    ]
  }
];