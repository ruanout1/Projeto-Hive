import { Clock, CheckSquare, Calendar, MapPin, User, Bot, PlayCircle, StopCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import AIAssistant from '../public/AIAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

interface CollaboratorDashboardProps {
  onSectionChange?: (section: string, params?: any) => void;
}

export default function CollaboratorDashboard({ onSectionChange }: CollaboratorDashboardProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimeClockDialogOpen, setIsTimeClockDialogOpen] = useState(false);
  const [isFinishTaskDialogOpen, setIsFinishTaskDialogOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState({ address: 'Shopping Center Norte, São Paulo - SP' });
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [currentDate] = useState(new Date(2025, 9, 20)); // Segunda-feira, 20 de outubro de 2025
  
  // Estados das tarefas
  const [currentTaskStarted, setCurrentTaskStarted] = useState(true); // Já iniciada (em andamento)
  const [currentTaskFinished, setCurrentTaskFinished] = useState(false);
  const [nextTaskStarted, setNextTaskStarted] = useState(false);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleOpenTimeClockDialog = () => {
    // Simular captura de localização GPS
    const location = { address: 'Shopping Center Norte, São Paulo - SP' };
    setPendingLocation(location);
    setIsTimeClockDialogOpen(true);
  };
  
  const handleConfirmTimeClock = () => {
    const time = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setIsTimeClockDialogOpen(false);
    toast.success('Ponto registrado com sucesso!', {
      description: `Hora: ${time} | Local: ${pendingLocation.address}`
    });
  };
  
  const handleStartCurrentTask = () => {
    setCurrentTaskStarted(true);
    toast.success('Tarefa iniciada!', {
      description: 'Limpeza do Piso Térreo - Shopping Center Norte'
    });
  };
  
  const handleFinishCurrentTask = () => {
    setIsFinishTaskDialogOpen(true);
  };
  
  const handleConfirmFinishTask = () => {
    setCurrentTaskFinished(true);
    setIsFinishTaskDialogOpen(false);
    toast.success('Tarefa finalizada!', {
      description: 'Tarefa concluída com sucesso. Você pode iniciar a próxima tarefa.'
    });
  };
  
  const handleStartNextTask = () => {
    setNextTaskStarted(true);
    toast.success('Tarefa iniciada!', {
      description: 'Limpeza dos Banheiros - 2º Andar'
    });
  };
  
  const handleViewFullSchedule = () => {
    if (onSectionChange) {
      onSectionChange('minha-agenda');
    }
  };

  const handleNavigateToTimeClock = () => {
    if (onSectionChange) {
      onSectionChange('meu-ponto');
    }
  };
  const currentTask = {
    id: "T-2024-087",
    title: "Limpeza do Piso Térreo - Shopping Center Norte",
    location: "Av. Otaviano Alves de Lima, 4400",
    startTime: "09:00",
    endTime: "12:00",
    progress: 65,
    team: "Equipe Alpha",
    leader: "Carlos Silva"
  };

  const nextTask = {
    id: "T-2024-088", 
    title: "Limpeza dos Banheiros - 2º Andar",
    location: "Shopping Center Norte",
    startTime: "13:00",
    endTime: "15:00",
    team: "Equipe Alpha"
    
    
  };

  const todaySchedule = [
    { 
      startTime: "09:00", 
      endTime: "12:00",
      task: "Limpeza do Piso Térreo - Shopping Center Norte", 
      status: "current",
      team: "Equipe Alpha",
      type: "service" // serviço agendado
    },
    { 
      startTime: "13:00", 
      endTime: "15:00",
      task: "Limpeza dos Banheiros - 2º Andar", 
      status: "pending",
      team: "Equipe Alpha",
      type: "service"
    },
    { 
      startTime: "15:30", 
      endTime: "17:30",
      task: "Limpeza da Praça de Alimentação", 
      status: "pending",
      team: "Equipe Alpha",
      type: "service"
    }
  ];

  const weekSchedule = {
    'Segunda': [
      { startTime: "08:00", endTime: "10:00", task: "Reunião de Planejamento Semanal", type: "meeting", team: "Equipe Alpha" },
      { startTime: "10:30", endTime: "13:00", task: "Limpeza Geral - Bloco A", type: "service", team: "Equipe Alpha" },
      { startTime: "14:00", endTime: "17:00", task: "Manutenção de Jardins", type: "completed", team: "Equipe Alpha" },
    ],
    'Terça': [
      { startTime: "09:00", endTime: "12:00", task: "Limpeza do Piso Térreo", type: "service", team: "Equipe Alpha" },
      { startTime: "13:00", endTime: "15:00", task: "Limpeza dos Banheiros", type: "service", team: "Equipe Alpha" },
    ],
    'Quarta': [
      { startTime: "08:00", endTime: "09:00", task: "Alinhamento com Gestor", type: "meeting", team: "Equipe Alpha" },
      { startTime: "09:30", endTime: "12:30", task: "Limpeza de Vidraças", type: "service", team: "Equipe Alpha" },
    ],
    'Quinta': [
      { startTime: "09:00", endTime: "13:00", task: "Limpeza Profunda - Banheiros", type: "service", team: "Equipe Alpha" },
    ],
    'Sexta': [
      { startTime: "08:00", endTime: "12:00", task: "Inspeção de Qualidade", type: "completed", team: "Equipe Alpha" },
      { startTime: "14:00", endTime: "15:00", task: "Reunião de Feedback", type: "meeting", team: "Equipe Alpha" }
    ],
    'Sábado': [],
    'Domingo': []
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return { bg: '#35BAE6', light: 'rgba(53, 186, 230, 0.1)', text: '#0369a1' };
      case 'meeting': return { bg: '#6400A4', light: 'rgba(100, 0, 164, 0.1)', text: '#6400A4' };
      case 'completed': return { bg: '#22c55e', light: 'rgba(34, 197, 94, 0.1)', text: '#166534' };
      default: return { bg: '#e5e7eb', light: '#f9fafb', text: '#374151' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'service': return 'Serviço Agendado';
      case 'meeting': return 'Reunião';
      case 'completed': return 'Concluído';
      default: return 'Outro';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'current': return '#6400A4';
      case 'pending': return '#e5e7eb';
      default: return '#e5e7eb';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'current': return <Clock className="h-4 w-4" style={{ color: '#6400A4' }} />;
      case 'pending': return <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />;
      default: return <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />;
    }
  };

  return (
    <div className="p-6 overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Painel de Atividades</h1>
          <p className="text-black">
            Suas tarefas e agenda do dia - Mantenha-se organizado e produtivo.
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          style={{ backgroundColor: '#6400A4', color: 'white' }}
          onClick={() => setIsAIOpen(true)}
        >
          <Bot className="h-4 w-4" />
          <span>IA</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tarefa Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Clock className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Tarefa Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-black mb-2">{currentTask.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-black mb-2">
                <MapPin className="h-4 w-4" />
                <span>{currentTask.location}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-black mb-3">
                <span>⏰ {currentTask.startTime} - {currentTask.endTime}</span>
                <Badge className="border-none" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' }}>
                  {currentTask.team}
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-black">Progresso</span>
                <span style={{ color: '#6400A4' }}>{currentTask.progress}%</span>
              </div>
              <Progress value={currentTask.progress} className="w-full [&>div]:bg-[#6400A4]" />
            </div>

            <div className="flex items-center space-x-2 text-sm text-black">
              <User className="h-4 w-4" />
              <span>Líder: {currentTask.leader}</span>
            </div>
            
            <div className="flex gap-2 mt-4">
              {!currentTaskStarted && (
                <Button
                  onClick={handleStartCurrentTask}
                  className="flex-1"
                  style={{ backgroundColor: '#10B981', color: 'white' }}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Iniciar Tarefa
                </Button>
              )}
              
              {currentTaskStarted && !currentTaskFinished && (
                <Button
                  onClick={handleFinishCurrentTask}
                  style={{ backgroundColor: '#EF4444', color: 'white' }}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Finalizar Tarefa
                </Button>
              )}
              
              {currentTaskFinished && (
                <div className="flex-1 p-3 rounded-lg bg-green-50 border-2 border-green-200 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">Tarefa Finalizada</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próxima Tarefa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
              Próxima Tarefa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-black mb-2">{nextTask.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-black mb-2">
                <MapPin className="h-4 w-4" />
                <span>{nextTask.location}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-black mb-3">
                <span>⏰ {nextTask.startTime} - {nextTask.endTime}</span>
                <Badge className="border-none" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' }}>
                  {nextTask.team}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-black">Progresso</span>
                <span style={{ color: '#8B20EE' }}>0%</span>
              </div>
              <Progress value={0} className="w-full [&>div]:bg-[#8B20EE]" />
            </div>

            <div className="flex items-center space-x-2 text-sm text-black">
              <User className="h-4 w-4" />
              
            </div>
            
            <div className="flex gap-2 mt-4">
              {!nextTaskStarted && (
                <Button
                  onClick={handleStartNextTask}
                  disabled={!currentTaskFinished}
                  className="flex-1"
                  style={{ 
                    backgroundColor: !currentTaskFinished ? '#9CA3AF' : '#10B981', 
                    color: 'white' 
                  }}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Iniciar Tarefa
                </Button>
              )}
              
              {nextTaskStarted && (
                <div className="flex-1 p-3 rounded-lg bg-green-50 border-2 border-green-200 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">Tarefa Iniciada</span>
                </div>
              )}
              
              {!currentTaskFinished && !nextTaskStarted && (
                <p className="text-xs text-gray-500 text-center mt-2 w-full">
                  Finalize a tarefa atual para iniciar esta tarefa
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black flex items-center">
                <Calendar className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                {viewMode === 'daily' && 'Agenda do Dia'}
                {viewMode === 'weekly' && 'Agenda da Semana'}
              </CardTitle>
              
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={viewMode === 'daily' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('daily')}
                  className="h-7 px-2 text-xs"
                  style={viewMode === 'daily' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
                >
                  Dia
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('weekly')}
                  className="h-7 px-2 text-xs"
                  style={viewMode === 'weekly' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
                >
                  Semana
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visualização por Dia */}
            {viewMode === 'daily' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
                  <h3 className="text-lg" style={{ color: '#6400A4' }}>
                    {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </h3>
                  <p className="text-xl">
                    {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {todaySchedule.length} {todaySchedule.length === 1 ? 'atividade agendada' : 'atividades agendadas'}
                  </p>
                </div>

                {todaySchedule.map((item, index) => {
                  const colors = getTypeColor(item.type);
                  return (
                    <div 
                      key={index} 
                      className="border-2 rounded-lg p-3"
                      style={{ 
                        borderColor: colors.bg,
                        backgroundColor: colors.light 
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge 
                              className="border-none text-xs"
                              style={{ backgroundColor: colors.bg, color: 'white' }}
                            >
                              {getTypeLabel(item.type)}
                            </Badge>
                            {item.status === 'current' && (
                              <Badge className="border-none text-xs bg-yellow-100 text-yellow-800">
                                EM ANDAMENTO
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-black text-sm">{item.task}</h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>⏰ {item.startTime} - {item.endTime}</span>
                        <Badge className="bg-gray-100 text-gray-800 border-none text-xs">
                          {item.team}
                        </Badge>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                  <p className="text-sm" style={{ color: '#0369a1' }}>
                    💡 <strong>Legenda:</strong> Azul = Serviços | Roxo = Reuniões | Verde = Concluídos
                  </p>
                </div>
              </div>
            )}

            {/* Visualização por Semana */}
            {viewMode === 'weekly' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
                  <h3 className="text-lg" style={{ color: '#6400A4' }}>
                    Semana de 20 a 26 de outubro de 2025
                  </h3>
                </div>

                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, dayIndex) => {
                  const dayEvents = weekSchedule[day as keyof typeof weekSchedule];
                  const dateNum = 20 + dayIndex;
                  
                  return (
                    <div key={day} className="border-2 rounded-lg p-3 bg-gray-50" style={{ borderColor: dayIndex === 0 ? '#6400A4' : '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-black">{day} - {dateNum}/10</h4>
                        <Badge className="text-xs bg-gray-200 text-gray-700 border-none">
                          {dayEvents.length} {dayEvents.length === 1 ? 'atividade' : 'atividades'}
                        </Badge>
                      </div>
                      
                      {dayEvents.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-2">Sem atividades agendadas</p>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.map((item, idx) => {
                            const colors = getTypeColor(item.type);
                            return (
                              <div 
                                key={idx}
                                className="p-2 rounded border-l-4"
                                style={{ 
                                  borderLeftColor: colors.bg,
                                  backgroundColor: colors.light
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-xs text-black">{item.task}</p>
                                    <p className="text-xs text-gray-500">{item.startTime} - {item.endTime}</p>
                                  </div>
                                  <Badge 
                                    className="text-xs border-none ml-2"
                                    style={{ backgroundColor: colors.bg, color: 'white' }}
                                  >
                                    {getTypeLabel(item.type).split(' ')[0]}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                  <p className="text-sm" style={{ color: '#0369a1' }}>
                    💡 <strong>Legenda:</strong> Azul = Serviços | Roxo = Reuniões | Verde = Concluídos
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                className="w-full justify-start"
                variant="outline"
                style={{ borderColor: '#6400A4', color: '#6400A4' }}
                onClick={handleNavigateToTimeClock}
              >
                <Clock className="h-4 w-4 mr-2" />
                Registrar Ponto
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                style={{ borderColor: '#FFFF20', color: '#black', backgroundColor: '#FFFF2010' }}
                onClick={handleViewFullSchedule}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ver Agenda Completa
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-black mb-3">Status da Equipe</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">Membros Ativos</span>
                  <Badge className="bg-green-100 text-green-800 border-none">8/8</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">Líder da Equipe</span>
                  <span className="text-black">Carlos Silva</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">Próxima Reunião</span>
                  <span className="text-black">Amanhã 09:00</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userType="colaborador"
      />
      
      {/* Time Clock Dialog */}
      <Dialog open={isTimeClockDialogOpen} onOpenChange={setIsTimeClockDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              Confirmar Registro de Ponto
            </DialogTitle>
            <DialogDescription>
              Confirme sua localização antes de registrar o ponto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Map Visualization */}
            <div className="relative rounded-lg h-48 overflow-hidden border-2 border-gray-200" 
                 style={{ background: 'linear-gradient(to bottom right, rgba(100, 0, 164, 0.05), rgba(53, 186, 230, 0.05))' }}>
              <div className="absolute inset-0">
                {/* Map grid lines */}
                <div className="absolute top-8 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
                <div className="absolute bottom-12 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-12 w-px bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 right-16 w-px bg-gray-300 opacity-30"></div>
                
                {/* Current location pin */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Pulsing circle animation */}
                    <div className="absolute w-12 h-12 rounded-full animate-ping" 
                         style={{ backgroundColor: 'rgba(100, 0, 164, 0.3)' }}></div>
                    <div className="relative w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                         style={{ backgroundColor: '#6400A4' }}>
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location label */}
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded p-2 shadow-sm">
                <p className="text-xs text-gray-600">Sua localização atual:</p>
                <p className="text-sm text-black flex items-center">
                  <MapPin className="h-3 w-3 mr-1" style={{ color: '#6400A4' }} />
                  {pendingLocation.address}
                </p>
              </div>
            </div>

            {/* Time display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Horário do registro</p>
              <p className="text-2xl" style={{ color: '#6400A4' }}>
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Confirmation message */}
            <div className="p-4 rounded-lg border-2" style={{ 
              backgroundColor: 'rgba(100, 0, 164, 0.05)', 
              borderColor: '#6400A4' 
            }}>
              <p className="text-center" style={{ color: '#6400A4' }}>
                <strong>Confirme sua localização</strong>
              </p>
              <p className="text-sm text-center text-gray-600 mt-1">
                Tem certeza que quer registrar seu ponto neste local?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTimeClockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleConfirmTimeClock}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Finish Task Dialog */}
      <Dialog open={isFinishTaskDialogOpen} onOpenChange={setIsFinishTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              Finalizar Tarefa
            </DialogTitle>
            <DialogDescription>
              Confirme que deseja finalizar esta tarefa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-black mb-2">Limpeza do Piso Térreo - Shopping Center Norte</h4>
              <p className="text-sm text-gray-600">Horário: 09:00 - 12:00</p>
              <p className="text-sm text-gray-600">Equipe: Equipe Alpha</p>
            </div>
            
            <div className="p-4 rounded-lg border-2 border-yellow-200" style={{ backgroundColor: 'rgba(255, 255, 32, 0.1)' }}>
              <p className="text-center text-black">
                <strong>⚠️ Atenção</strong>
              </p>
              <p className="text-sm text-center text-gray-600 mt-1">
                Ao finalizar esta tarefa, você poderá iniciar a próxima. Tem certeza que deseja continuar?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsFinishTaskDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#EF4444', color: 'white' }}
              onClick={handleConfirmFinishTask}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}