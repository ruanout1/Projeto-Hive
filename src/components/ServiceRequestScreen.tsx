import { useState } from 'react';
import { Plus, Calendar, AlertTriangle, CheckCircle, Bot, Clock, Building2, Shield, TreePine, Droplets, Wrench, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import RequestsViewScreen from './RequestsViewScreen';
import React from 'react';


export default function ServiceRequestScreen() {
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'main' | 'requests'>('main');
  const [selectedCategory, setSelectedCategory] = useState('');

  const serviceOptions = [
    {
      id: 'limpeza-geral',
      name: 'Limpeza Geral',
      icon: Building2,
      description: 'Limpeza completa de ambientes internos e externos',
      estimatedTime: '4-8 horas',
      category: 'Limpeza'
    },
    {
      id: 'limpeza-pesada',
      name: 'Limpeza Pesada',
      icon: Building2,
      description: 'Limpeza profunda pós-obra ou situações especiais',
      estimatedTime: '6-12 horas',
      category: 'Limpeza'
    },
    {
      id: 'portaria',
      name: 'Portaria',
      icon: UserCheck,
      description: 'Serviços de portaria e recepção predial',
      estimatedTime: 'Período contratado',
      category: 'Segurança'
    },
    {
      id: 'seguranca-armada',
      name: 'Segurança Armada',
      icon: Shield,
      description: 'Segurança patrimonial com vigilantes armados',
      estimatedTime: 'Período contratado',
      category: 'Segurança'
    },
    {
      id: 'jardinagem',
      name: 'Jardinagem',
      icon: TreePine,
      description: 'Manutenção de jardins, podas e paisagismo',
      estimatedTime: '2-6 horas',
      category: 'Manutenção'
    },
    {
      id: 'limpeza-piscina',
      name: 'Limpeza de Piscina',
      icon: Droplets,
      description: 'Limpeza e tratamento químico de piscinas',
      estimatedTime: '2-4 horas',
      category: 'Limpeza'
    },
    {
      id: 'manutencao-predial',
      name: 'Manutenção Predial',
      icon: Wrench,
      description: 'Reparos e manutenções gerais do edifício',
      estimatedTime: 'Conforme demanda',
      category: 'Manutenção'
    },
    {
      id: 'zeladoria',
      name: 'Zeladoria',
      icon: Building2,
      description: 'Serviços de zeladoria e manutenção cotidiana',
      estimatedTime: 'Período contratado',
      category: 'Manutenção'
    }
  ];

  const initialRequests = [
    {
      id: 'REQ-2024-045',
      service: 'Limpeza Geral',
      date: '25/09/2024',
      priority: 'rotina',
      status: 'aprovado',
      requestedAt: '23/09/2024 14:30',
      description: 'Limpeza completa do escritório, incluindo todas as salas e áreas comuns.'
    },
    {
      id: 'REQ-2024-044',
      service: 'Limpeza de Piscina',
      date: '24/09/2024',
      priority: 'urgente',
      status: 'em-analise',
      requestedAt: '23/09/2024 10:15',
      description: 'Limpeza urgente da piscina devido ao acúmulo de algas.'
    },
    {
      id: 'REQ-2024-043',
      service: 'Jardinagem',
      date: '26/09/2024',
      priority: 'rotina',
      status: 'agendado',
      requestedAt: '22/09/2024 16:20',
      description: 'Poda das árvores e manutenção dos canteiros do jardim.'
    }
  ];

  const allRequests = [...initialRequests, ...myRequests];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Limpeza': return '#6400A4';
      case 'Segurança': return '#8B20EE';
      case 'Manutenção': return '#6400A4';
      default: return '#6400A4';
    }
  };

  const getCategoryStyle = (category: string) => {
    // Limpeza, Zeladoria e Manutenção com fundo roxo e texto amarelo
    if (['Limpeza', 'Manutenção', 'Zeladoria'].includes(category)) {
      return {
        backgroundColor: '#6400A4',
        color: '#FFFF20'
      };
    }
    // Segurança mantém o estilo original
    return {
      backgroundColor: getCategoryColor(category) + '20',
      color: getCategoryColor(category)
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800 border-none">Aprovado</Badge>;
      case 'em-analise':
        return <Badge className="bg-yellow-100 text-yellow-800 border-none">Em Análise</Badge>;
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-800 border-none">Agendado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800 border-none">Rejeitado</Badge>;
      case 'pendente':
        return <Badge className="bg-orange-100 text-orange-800 border-none">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-none">Pendente</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'urgente' ? (
      <Badge className="bg-red-100 text-red-800 border-none flex items-center">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Urgente
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-none flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        Rotina
      </Badge>
    );
  };

  const handleSubmitRequest = () => {
    if (selectedService && description.trim() && requestedDate && priority) {
      const newRequestId = `REQ-2024-${String(Date.now()).slice(-3)}`;
      const serviceName = serviceOptions.find(s => s.id === selectedService)?.name || selectedService;
      
      const newRequest = {
        id: newRequestId,
        service: serviceName,
        description: description.trim(),
        date: requestedDate.toLocaleDateString('pt-BR'),
        priority,
        status: 'em-analise', // Mudança: agora vai direto para em-analise
        requestedAt: new Date().toLocaleString('pt-BR')
      };

      setMyRequests(prev => [newRequest, ...prev]);

      // Toast mais chamativo com cores da marca
      toast.success('🎉 Solicitação enviada com sucesso!', {
        description: priority === 'urgente' 
          ? '⚡ Solicitação marcada como URGENTE - Nossa equipe será notificada imediatamente!' 
          : '📋 Sua solicitação está em análise. Retornaremos em até 2 horas.',
        style: {
          background: '#6400A4',
          color: 'white',
          border: '2px solid #8B20EE',
          fontSize: '16px'
        }
      });

      // Reset do formulário
      setSelectedService('');
      setDescription('');
      setRequestedDate(undefined);
      setPriority('');
      setIsRequestModalOpen(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsRequestModalOpen(true);
  };

  const handleViewRequests = (category: string) => {
    let filteredRequests = [];
    
    switch (category) {
      case 'total':
        filteredRequests = allRequests;
        break;
      case 'aprovadas':
        filteredRequests = allRequests.filter(r => r.status === 'aprovado');
        break;
      case 'urgentes':
        filteredRequests = allRequests.filter(r => r.priority === 'urgente');
        break;
      case 'em-analise':
        filteredRequests = allRequests.filter(r => r.status === 'em-analise');
        break;
      default:
        filteredRequests = allRequests;
    }
    
    setSelectedCategory(category);
    setViewMode('requests');
  };

  const selectedServiceInfo = serviceOptions.find(s => s.id === selectedService);

  if (viewMode === 'requests') {
    let filteredRequests = [];
    
    switch (selectedCategory) {
      case 'total':
        filteredRequests = allRequests;
        break;
      case 'aprovadas':
        filteredRequests = allRequests.filter(r => r.status === 'aprovado');
        break;
      case 'urgentes':
        filteredRequests = allRequests.filter(r => r.priority === 'urgente');
        break;
      case 'em-analise':
        filteredRequests = allRequests.filter(r => r.status === 'em-analise');
        break;
      default:
        filteredRequests = allRequests;
    }

    return (
      <RequestsViewScreen
        category={selectedCategory}
        requests={filteredRequests}
        onBack={() => setViewMode('main')}
      />
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Solicitação de Serviços</h1>
          <p className="text-black mb-2">
            Solicite novos serviços e acompanhe o status das suas solicitações.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Importante:</strong> Acompanhe o status da sua solicitação aqui no painel, em até 2 horas será atualizado sobre a disponibilidade dos serviços!
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2"
                style={{ backgroundColor: '#6400A4', color: 'white' }}
              >
                <Plus className="h-4 w-4" />
                <span>Nova Solicitação</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] scrollbar-hide">
              <DialogHeader>
                <DialogTitle>Solicitar Novo Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para solicitar um novo serviço. Nossa equipe entrará em contato em até 2 horas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div>
                  <Label htmlFor="service-select">Tipo de Serviço</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service-select">
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedServiceInfo && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3 mb-2">
                      <selectedServiceInfo.icon 
                        className="h-6 w-6" 
                        style={{ color: getCategoryColor(selectedServiceInfo.category) }} 
                      />
                      <div>
                        <h4 className="text-black">{selectedServiceInfo.name}</h4>
                        <Badge 
                          className="text-xs border-none"
                          style={getCategoryStyle(selectedServiceInfo.category)}
                        >
                          {selectedServiceInfo.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{selectedServiceInfo.description}</p>
                    <p className="text-xs text-gray-500">Tempo estimado: {selectedServiceInfo.estimatedTime}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva em detalhes o serviço que você precisa, incluindo especificidades, áreas de foco, materiais necessários, etc."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="requested-date">Data Desejada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        id="requested-date"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {requestedDate ? requestedDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={requestedDate}
                        onSelect={setRequestedDate}
                        disabled={(date: Date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <RadioGroup value={priority} onValueChange={setPriority} className="mt-2 space-y-3">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        priority === 'urgente' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('urgente')}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="urgente" id="urgente" />
                        <Label htmlFor="urgente" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="text-black">Urgente</div>
                            <div className="text-sm text-gray-600">Precisa ser realizado o mais rápido possível</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        priority === 'rotina' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('rotina')}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="rotina" id="rotina" />
                        <Label htmlFor="rotina" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="text-black">Serviço de Rotina</div>
                            <div className="text-sm text-gray-600">Pode ser agendado conforme disponibilidade</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={!selectedService || !description.trim() || !requestedDate || !priority}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Enviar Solicitação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Bot className="h-4 w-4" />
            <span>IA</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => handleViewRequests('total')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Solicitações</p>
                <p className="text-2xl" style={{ color: '#6400A4' }}>{allRequests.length}</p>
                <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
              </div>
              <Plus className="h-8 w-8" style={{ color: '#6400A4' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => handleViewRequests('aprovadas')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovadas</p>
                <p className="text-2xl text-green-600">
                  {allRequests.filter(r => r.status === 'aprovado').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => handleViewRequests('urgentes')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl text-red-600">
                  {allRequests.filter(r => r.priority === 'urgente').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => handleViewRequests('em-analise')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Análise</p>
                <p className="text-2xl" style={{ color: '#FFFF20', WebkitTextStroke: '1px black' }}>
                  {allRequests.filter(r => r.status === 'em-analise').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
              </div>
              <Clock className="h-8 w-8" style={{ color: '#FFFF20' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 flex-1 overflow-hidden">
        {/* Catálogo de Serviços */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black">Catálogo de Serviços Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceOptions.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Button
                    key={service.id}
                    variant="outline"
                    className="h-auto p-0 border-2 hover:border-current hover:shadow-lg transition-all overflow-hidden"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <div className="border rounded-lg p-4 w-full text-left">
                      <div className="flex items-center space-x-3 mb-3">
                        <IconComponent 
                          className="h-8 w-8" 
                          style={{ color: getCategoryColor(service.category) }} 
                        />
                        <div>
                          <h4 className="text-black truncate" title={service.name}>{service.name}</h4>
                          <Badge 
                            className="text-xs border-none"
                            style={getCategoryStyle(service.category)}
                          >
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 break-words h-10">{service.description}</p>
                      <p className="text-xs text-gray-500">⏱️ {service.estimatedTime}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Minhas Solicitações */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
                Minhas Solicitações
              </div>
              {allRequests.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800 border-none">
                  {allRequests.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            {allRequests.length > 0 ? (
              <div className="space-y-4">
                {allRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-black text-sm">{request.service}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    {request.description && (
                      <p className="text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                        {request.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">ID: {request.id}</span>
                        {getPriorityBadge(request.priority)}
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <p>Data solicitada: {request.date}</p>
                        <p>Solicitado em: {request.requestedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-black mb-1">Nenhuma solicitação ainda</p>
                <p className="text-sm text-gray-600">Suas solicitações de serviços aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}