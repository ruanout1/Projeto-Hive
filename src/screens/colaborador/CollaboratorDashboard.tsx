import { Clock, CheckSquare, Calendar, MapPin, User, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import AIAssistant from '../../components/AIAssistant';
import React from 'react';


export default function CollaboratorDashboard() {
  const [isAIOpen, setIsAIOpen] = useState(false);
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
    { time: "08:00", task: "Check-in e briefing da equipe", status: "completed" },
    { time: "08:30", task: "Preparação de materiais e equipamentos", status: "completed" },
    { time: "09:00", task: "Limpeza do Piso Térreo", status: "current" },
    { time: "12:00", task: "Pausa para almoço", status: "pending" },
    { time: "13:00", task: "Limpeza dos Banheiros - 2º Andar", status: "pending" },
    { time: "15:00", task: "Limpeza da Praça de Alimentação", status: "pending" },
    { time: "17:00", task: "Organização de materiais", status: "pending" },
    { time: "17:30", task: "Check-out e relatório final", status: "pending" }
  ];

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
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
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
                <span style={{ color: '#FFFF20', WebkitTextStroke: '1px black' }}>{currentTask.progress}%</span>
              </div>
              <Progress value={currentTask.progress} className="w-full [&>div]:bg-[#FFFF20]" />
            </div>

            <div className="flex items-center space-x-2 text-sm text-black">
              <User className="h-4 w-4" />
              <span>Líder: {currentTask.leader}</span>
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
                <Badge className="bg-purple-100 text-purple-800 border-none">
                  {nextTask.team}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-black">
                <strong>Preparação:</strong> Separar produtos específicos para limpeza de banheiros e verificar estoque de papel higiênico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Agenda do Dia - Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 w-20">
                    {getStatusIcon(item.status)}
                    <span className="text-sm text-black">{item.time}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-4"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    ></div>
                    <div className="flex-1">
                      <p className={`text-sm ${item.status === 'current' ? 'text-black' : 'text-black'}`}>
                        {item.task}
                      </p>
                      {item.status === 'current' && (
                        <Badge className="mt-1 border-none text-xs" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' }}>
                          EM ANDAMENTO
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              >
                <Clock className="h-4 w-4 mr-2" />
                Registrar Ponto
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Marcar Tarefa como Concluída
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                style={{ borderColor: '#FFFF20', color: '#black', backgroundColor: '#FFFF2010' }}
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
    </div>
  );
}