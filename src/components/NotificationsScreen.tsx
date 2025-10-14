import { useState } from 'react';
import { Bell, Check, Trash2, Filter, ChevronRight, MessageSquare, Star, Calendar, Users, FileText, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import React from 'react';


interface Notification {
  id: string;
  type: 'message' | 'rating' | 'service' | 'team' | 'document' | 'alert';
  title: string;
  description: string;
  time: string;
  read: boolean;
  sender?: string;
  fullContent?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nova mensagem de João Silva',
    description: 'Solicitação sobre orçamento para manutenção',
    time: '5 min atrás',
    read: false,
    sender: 'João Silva',
    fullContent: 'Olá, gostaria de solicitar um orçamento para manutenção preventiva do sistema de ar-condicionado da minha empresa. Temos 5 unidades que precisam de revisão completa. Gostaríamos de agendar para a próxima semana, se possível. Aguardo retorno com disponibilidade e valores.'
  },
  {
    id: '2',
    type: 'team',
    title: 'Equipe Beta respondeu',
    description: 'Confirmação de disponibilidade para serviço',
    time: '15 min atrás',
    read: false,
    sender: 'Equipe Beta',
    fullContent: 'A Equipe Beta confirmou disponibilidade para o serviço de instalação elétrica solicitado. A equipe estará disponível na quinta-feira das 9h às 17h. O responsável será o técnico Carlos Mendes. Todos os materiais necessários já foram separados e estão prontos para a instalação.'
  },
  {
    id: '3',
    type: 'rating',
    title: 'Nova avaliação recebida',
    description: 'Cliente Maria deu 5 estrelas para serviço',
    time: '1 hora atrás',
    read: false,
    sender: 'Maria Santos',
    fullContent: 'Avaliação: ⭐⭐⭐⭐⭐\n\nComentário: "Serviço excelente! A equipe foi muito profissional, pontual e cuidadosa. O trabalho de manutenção foi realizado com perfeição e em menos tempo do que o estimado. Recomendo muito e com certeza voltarei a contratar para futuros serviços. Parabéns à toda equipe!"'
  },
  {
    id: '4',
    type: 'service',
    title: 'Serviço agendado confirmado',
    description: 'Manutenção elétrica agendada para amanhã às 14h',
    time: '2 horas atrás',
    read: true,
    sender: 'Sistema',
    fullContent: 'Confirmação de Agendamento:\n\nServiço: Manutenção Elétrica Preventiva\nData: 01/10/2025\nHorário: 14:00\nLocal: Rua das Flores, 123 - Centro\nEquipe: Equipe Alpha\nResponsável: Técnico José Silva\n\nPor favor, certifique-se de que alguém estará no local para receber a equipe. Em caso de necessidade de reagendamento, entre em contato com pelo menos 24 horas de antecedência.'
  },
  {
    id: '5',
    type: 'message',
    title: 'Resposta de Pedro Costa',
    description: 'Dados bancários atualizados com sucesso',
    time: '3 horas atrás',
    read: true,
    sender: 'Pedro Costa',
    fullContent: 'Olá! Confirmo que os dados bancários foram atualizados com sucesso no sistema. A partir do próximo pagamento, os valores serão depositados na nova conta informada. Qualquer dúvida, estou à disposição. Obrigado!'
  },
  {
    id: '6',
    type: 'document',
    title: 'Novo documento disponível',
    description: 'Contrato de prestação de serviços foi enviado',
    time: '5 horas atrás',
    read: true,
    sender: 'Administração',
    fullContent: 'Um novo documento foi adicionado ao seu perfil:\n\nDocumento: Contrato de Prestação de Serviços - Manutenção Anual\nData de emissão: 30/09/2025\nValidade: 12 meses\n\nPor favor, revise o documento e, caso esteja de acordo, assine digitalmente através do sistema. O contrato inclui manutenções preventivas trimestrais e atendimento prioritário para emergências. Entre em contato caso tenha alguma dúvida sobre as cláusulas.'
  },
  {
    id: '7',
    type: 'alert',
    title: 'Atualização do sistema',
    description: 'Nova versão disponível com melhorias de segurança',
    time: '1 dia atrás',
    read: true,
    sender: 'Sistema',
    fullContent: 'Atualização do Sistema Hive - Versão 2.5.0\n\nMelhorias implementadas:\n• Novos protocolos de segurança\n• Interface de notificações redesenhada\n• Melhor performance no carregamento de dados\n• Correção de bugs reportados\n• Sistema de backup automático aprimorado\n\nA atualização será aplicada automaticamente. Nenhuma ação é necessária de sua parte.'
  },
  {
    id: '8',
    type: 'team',
    title: 'Nova equipe atribuída',
    description: 'Você foi adicionado à Equipe Gamma',
    time: '2 dias atrás',
    read: true,
    sender: 'Recursos Humanos',
    fullContent: 'Bem-vindo à Equipe Gamma!\n\nVocê foi adicionado como membro da Equipe Gamma, especializada em serviços de climatização. A equipe é composta por 6 profissionais e atende principalmente a região central da cidade.\n\nLíder da equipe: Ana Paula Rodrigues\nEspecialidade: Instalação e manutenção de sistemas de ar-condicionado\nReunião de equipe: Toda segunda-feira às 8h\n\nBem-vindo ao time!'
  },
  {
    id: '9',
    type: 'service',
    title: 'Serviço concluído',
    description: 'Instalação de ar-condicionado finalizada',
    time: '3 dias atrás',
    read: true,
    sender: 'Equipe Alpha',
    fullContent: 'Relatório de Conclusão de Serviço:\n\nServiço: Instalação de Ar-condicionado Split 12.000 BTUs\nCliente: Empresa XYZ Ltda\nData: 27/09/2025\nDuração: 4 horas\n\nAtividades realizadas:\n• Instalação da unidade interna e externa\n• Passagem de tubulação e fiação\n• Teste de funcionamento e vazamento\n• Orientação ao cliente sobre uso\n\nEquipamento instalado com sucesso e em perfeito funcionamento. Cliente orientado sobre manutenção preventiva.'
  },
  {
    id: '10',
    type: 'rating',
    title: 'Feedback de cliente',
    description: 'Carlos deixou um comentário sobre o serviço',
    time: '3 dias atrás',
    read: true,
    sender: 'Carlos Mendes',
    fullContent: 'Avaliação: ⭐⭐⭐⭐\n\nComentário: "Serviço bom no geral. A equipe foi educada e o trabalho ficou bem feito. Única observação é que demoraram um pouco mais do que o previsto, mas no final ficou tudo certo. O técnico explicou tudo direitinho sobre a manutenção. Recomendo!"'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-5 w-5" style={{ color: '#6400A4' }} />;
    case 'rating':
      return <Star className="h-5 w-5" style={{ color: '#FFFF20', fill: '#FFFF20' }} />;
    case 'service':
      return <Calendar className="h-5 w-5" style={{ color: '#6400A4' }} />;
    case 'team':
      return <Users className="h-5 w-5" style={{ color: '#8B20EE' }} />;
    case 'document':
      return <FileText className="h-5 w-5" style={{ color: '#6400A4' }} />;
    case 'alert':
      return <AlertCircle className="h-5 w-5" style={{ color: '#35BAE6' }} />;
    default:
      return <Bell className="h-5 w-5" style={{ color: '#6400A4' }} />;
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'todas') return true;
    if (activeFilter === 'nao-lidas') return !n.read;
    if (activeFilter === 'lidas') return n.read;
    return n.type === activeFilter;
  });

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <Bell className="h-6 w-6" style={{ color: '#6400A4' }} />
              </div>
              <div>
                <h1 className="hive-screen-title">Notificações</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? (
                    <>Você tem <span style={{ color: '#6400A4' }}>{unreadCount} notificações não lidas</span></>
                  ) : (
                    'Todas as notificações foram lidas'
                  )}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-2"
                style={{ borderColor: '#6400A4', color: '#6400A4' }}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="todas"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Todas
              </TabsTrigger>
              <TabsTrigger 
                value="nao-lidas"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                Não lidas
                {unreadCount > 0 && (
                  <Badge className="ml-2" style={{ backgroundColor: '#FFFF20', color: '#000' }}>
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="lidas"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                Lidas
              </TabsTrigger>
              <TabsTrigger 
                value="message"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensagens
              </TabsTrigger>
              <TabsTrigger 
                value="rating"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                <Star className="h-4 w-4 mr-2" />
                Avaliações
              </TabsTrigger>
              <TabsTrigger 
                value="service"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Serviços
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="data-[state=active]:bg-[#6400A4] data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Equipe
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-gray-100"
                style={!notification.read ? { backgroundColor: 'rgba(255, 255, 32, 0.05)' } : {}}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div 
                    className="flex-shrink-0 p-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)' }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 
                          className="mb-1"
                          style={{ color: '#6400A4' }}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {notification.description}
                        </p>
                      </div>
                      {!notification.read && (
                        <div 
                          className="flex-shrink-0 w-3 h-3 rounded-full ml-3"
                          style={{ backgroundColor: '#FFFF20' }}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        {notification.sender && (
                          <span className="text-xs text-gray-500">
                            De: <span style={{ color: '#6400A4' }}>{notification.sender}</span>
                          </span>
                        )}
                        <span className="text-xs" style={{ color: '#8B20EE' }}>
                          {notification.time}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-8 px-3"
                            style={{ color: '#6400A4' }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            openNotification(notification);
                          }}
                          className="h-8 px-3"
                          style={{ color: '#6400A4' }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#6400A4' }}>{filteredNotifications.length}</span> de{' '}
              <span style={{ color: '#6400A4' }}>{notifications.length}</span> notificações
            </p>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div 
                      className="flex-shrink-0 p-3 rounded-xl"
                      style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)' }}
                    >
                      {getNotificationIcon(selectedNotification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="modal-title-purple text-left">
                        {selectedNotification.title}
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        Detalhes da notificação
                      </DialogDescription>
                      <div className="flex items-center space-x-3 mt-2">
                        {selectedNotification.sender && (
                          <span className="text-sm text-gray-600">
                            De: <span style={{ color: '#6400A4' }}>{selectedNotification.sender}</span>
                          </span>
                        )}
                        <span className="text-sm" style={{ color: '#8B20EE' }}>
                          {selectedNotification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {selectedNotification.fullContent || selectedNotification.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className="capitalize"
                      style={{ borderColor: '#6400A4', color: '#6400A4' }}
                    >
                      {selectedNotification.type === 'message' && 'Mensagem'}
                      {selectedNotification.type === 'rating' && 'Avaliação'}
                      {selectedNotification.type === 'service' && 'Serviço'}
                      {selectedNotification.type === 'team' && 'Equipe'}
                      {selectedNotification.type === 'document' && 'Documento'}
                      {selectedNotification.type === 'alert' && 'Alerta'}
                    </Badge>
                    {selectedNotification.read && (
                      <Badge 
                        variant="outline"
                        style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
                      >
                        Lida
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        deleteNotification(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedNotification(null)}
                      style={{ backgroundColor: '#6400A4', color: 'white' }}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}