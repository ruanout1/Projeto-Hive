import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Phone, Mail, Calendar, Clock, User, Bot, CheckCircle, 
  MoreVertical, Paperclip, Image as ImageIcon, File, X, Search
} from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import api from '../../lib/api';

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
}

export default function ClientCommunicationScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [newConvSubject, setNewConvSubject] = useState('');
  const [newConvMessage, setNewConvMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Buscar conversas do backend
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/client-portal/communications');
      
      if (response.data && Array.isArray(response.data)) {
        // Formata os dados para o formato esperado
        const formattedConversations = response.data.map((conv: any) => ({
          id: conv.id.toString(),
          subject: conv.subject,
          lastMessage: conv.lastMessage || 'Sem mensagens',
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount || 0,
          participants: conv.participants ? conv.participants.split(', ') : [],
          status: conv.status
        }));

        setConversations(formattedConversations);
        
        if (formattedConversations.length > 0) {
          selectConversation(formattedConversations[0]);
        }
        
        toast.success(`💬 ${formattedConversations.length} conversas carregadas!`);
      }
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Backend offline. Verifique se o servidor está rodando.');
      } else {
        toast.error('Erro ao carregar conversas');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Buscar mensagens de uma conversa
  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/client-portal/communications/${conversationId}/messages`);
      
      if (response.data && Array.isArray(response.data)) {
        setMessages(response.data);
        console.log(`📨 ${response.data.length} mensagens carregadas`);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoadingMessages(false);
    }
  };

  // ✅ Selecionar conversa e carregar mensagens
  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    await fetchMessages(conv.id);
    
    // Marcar como lida se tiver mensagens não lidas
    if (conv.unreadCount > 0) {
      handleMarkAsRead(conv.id);
    }
  };

  // ✅ Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageData = {
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
        type: 'text'
      };

      const response = await api.post('/client-portal/communications/message', messageData);
      
      if (response.data && response.data.data) {
        // Adiciona a nova mensagem à lista
        setMessages([...messages, response.data.data]);
        
        // Atualiza a lista de conversas (última mensagem e timestamp)
        setConversations(conversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString()
              } 
            : conv
        ));

        setNewMessage('');
        toast.success('Mensagem enviada!');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  // ✅ Marcar conversa como lida
  const handleMarkAsRead = async (conversationId: string) => {
    try {
      await api.patch(`/client-portal/communications/${conversationId}/read`);

      // Atualiza localmente
      setConversations(conversations.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // ✅ Criar nova conversa
  const handleCreateConversation = async () => {
    if (!newConvSubject.trim() || !newConvMessage.trim()) {
      toast.error('Preencha o assunto e a mensagem inicial');
      return;
    }

    try {
      const response = await api.post('/client-portal/communications', {
        subject: newConvSubject.trim(),
        initialMessage: newConvMessage.trim()
      });

      if (response.data && response.data.data) {
        toast.success('Conversa criada com sucesso!');
        
        // Fecha o modal
        setIsNewConversationOpen(false);
        setNewConvSubject('');
        setNewConvMessage('');
        
        // Recarrega as conversas
        await fetchConversations();
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  onClick={() => setIsNewConversationOpen(true)}
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
                      onClick={() => selectConversation(conv)}
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
                        {selectedConversation.participants.join(', ') || 'Equipe Hive'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8B20EE' }}></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
                      </div>
                    ) : (
                      messages.map((message) => {
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
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t">
                    <div className="flex items-end gap-2">
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
                        {sending ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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

      {/* Modal: Nova Conversa */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#8B20EE' }}>Nova Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Assunto</label>
              <Input
                placeholder="Ex: Dúvida sobre serviço..."
                value={newConvSubject}
                onChange={(e) => setNewConvSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mensagem inicial</label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newConvMessage}
                onChange={(e) => setNewConvMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConversationOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateConversation}
              style={{ backgroundColor: '#8B20EE' }}
              disabled={!newConvSubject.trim() || !newConvMessage.trim()}
            >
              Criar Conversa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}