import { MapPin, Clock, CheckCircle, AlertCircle, XCircle, Calendar, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { useState } from 'react';
import AIAssistant from './AIAssistant';
import React from 'react';

type Status = 'concluido' | 'em-andamento' | 'agendado' | 'pendente' | 'cancelado';

interface Service {
  id: string;
  cliente: string;
  servico: string;
  equipe: string;
  status: Status;
  prazo: string;
}

interface Team {
  name: string;
  zone: string;
  active: boolean;
  members: number;
}

export default function ManagerDashboard() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  const services: Service[] = [
    { id: "OS-2024-001", cliente: "Shopping Center Norte", servico: "Limpeza Geral", equipe: "Equipe Alpha", status: "em-andamento", prazo: "24/09/2024" },
    { id: "OS-2024-002", cliente: "Prédio Comercial São Paulo", servico: "Manutenção Elétrica", equipe: "Equipe Beta", status: "concluido", prazo: "23/09/2024" },
    { id: "OS-2024-003", cliente: "Condomínio Residencial", servico: "Jardinagem", equipe: "Equipe Gamma", status: "agendado", prazo: "25/09/2024" },
    { id: "OS-2024-004", cliente: "Hospital Santa Maria", servico: "Limpeza Hospitalar", equipe: "Equipe Delta", status: "pendente", prazo: "26/09/2024" },
    { id: "OS-2024-005", cliente: "Escritório Corporate", servico: "Limpeza de Vidros", equipe: "Equipe Alpha", status: "cancelado", prazo: "22/09/2024" }
  ];

  const getStatusBadge = (status: Status) => {
    const statusConfig: Record<Status, { color: string; label: string; style?: React.CSSProperties }> = {
      "concluido": { color: "bg-green-100 text-green-800", label: "Concluído" },
      "em-andamento": { color: "", label: "Em Andamento", style: { backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' } },
      "agendado": { color: "bg-yellow-100 text-yellow-800", label: "Agendado" },
      "pendente": { color: "bg-orange-100 text-orange-800", label: "Pendente" },
      "cancelado": { color: "bg-red-100 text-red-800", label: "Cancelado" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border-none`} style={config.style}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      "concluido": CheckCircle,
      "em-andamento": Clock,
      "agendado": Calendar,
      "pendente": AlertCircle,
      "cancelado": XCircle
    };
    
    const IconComponent = icons[status as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const teams = [
    { name: "Equipe Alpha", zone: "Zona Norte", active: true, members: 8 },
    { name: "Equipe Beta", zone: "Zona Sul", active: true, members: 6 },
    { name: "Equipe Gamma", zone: "Zona Leste", active: false, members: 5 },
    { name: "Equipe Delta", zone: "Zona Oeste", active: true, members: 7 },
    { name: "Equipe Epsilon", zone: "Centro", active: true, members: 9 }
  ];

  return (
    <div className="p-6 overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Central de Gestão</h1>
          <p className="text-black">
            Distribuição de equipes e acompanhamento de serviços em tempo real.
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
        {/* Mapa da Cidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <MapPin className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Mapa Operacional - São Paulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg h-64 overflow-hidden border-2 border-gray-200" style={{ background: 'linear-gradient(to bottom right, rgba(53, 186, 230, 0.1), rgba(34, 197, 94, 0.1))' }}>
              {/* Simulação de mapa mais realista */}
              <div className="absolute inset-0">
                {/* Ruas principais */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-300"></div>
                <div className="absolute bottom-12 left-0 right-0 h-1 bg-gray-300"></div>
                <div className="absolute top-0 bottom-0 left-12 w-1 bg-gray-300"></div>
                <div className="absolute top-0 bottom-0 right-16 w-1 bg-gray-300"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300 transform -translate-x-1/2"></div>
                
                {/* Áreas verdes */}
                <div className="absolute top-6 right-6 w-8 h-8 bg-green-200 rounded-full opacity-60"></div>
                <div className="absolute bottom-6 left-6 w-12 h-6 bg-green-200 rounded-lg opacity-60"></div>
                
                {/* Centro da cidade */}
                <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-lg transform -translate-x-1/2 -translate-y-1/2 opacity-80 flex items-center justify-center" style={{ backgroundColor: 'rgba(53, 186, 230, 0.2)' }}>
                  <span className="text-xs text-black">Centro</span>
                </div>
              </div>
              
              {/* Equipes com tooltips */}
              <div className="absolute top-6 left-12 flex items-center group">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg cursor-pointer"></div>
                <div className="hidden group-hover:block absolute left-6 top-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Equipe Alpha - Zona Norte
                </div>
              </div>
              
              <div className="absolute top-12 right-20 flex items-center group">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg cursor-pointer"></div>
                <div className="hidden group-hover:block absolute right-6 top-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Equipe Beta - Zona Sul
                </div>
              </div>
              
              <div className="absolute bottom-16 left-20 flex items-center group">
                <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow-lg cursor-pointer"></div>
                <div className="hidden group-hover:block absolute left-6 bottom-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Equipe Gamma - Zona Leste (Inativa)
                </div>
              </div>
              
              <div className="absolute bottom-10 right-12 flex items-center group">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg cursor-pointer"></div>
                <div className="hidden group-hover:block absolute right-6 bottom-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Equipe Delta - Zona Oeste
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 flex items-center group transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg cursor-pointer"></div>
                <div className="hidden group-hover:block absolute left-6 top-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Equipe Epsilon - Centro
                </div>
              </div>

              {/* Legenda */}
              <div className="absolute top-2 right-2 bg-white/90 rounded p-2 shadow-sm">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-black">Ativa</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-black">Inativa</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              {teams.map((team, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${team.active ? 'bg-green-500' : 'bg-gray-400'}`}
                    ></div>
                    <span className="text-black">{team.name}</span>
                    <span className="text-gray-600">({team.zone})</span>
                  </div>
                  <span className="text-black">{team.members} membros</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Status Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl text-green-600">12</div>
                <div className="text-sm text-black">Concluídos</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: '#35BAE6' }} />
                <div className="text-2xl" style={{ color: '#35BAE6' }}>8</div>
                <div className="text-sm text-black">Em Andamento</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl text-yellow-600">15</div>
                <div className="text-sm text-black">Agendados</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl text-orange-600">3</div>
                <div className="text-sm text-black">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Serviços em Andamento</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto scrollbar-hide">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black">OS</TableHead>
                <TableHead className="text-black">Cliente</TableHead>
                <TableHead className="text-black">Serviço</TableHead>
                <TableHead className="text-black">Equipe</TableHead>
                <TableHead className="text-black">Status</TableHead>
                <TableHead className="text-black">Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="text-black">{service.id}</TableCell>
                  <TableCell className="text-black">{service.cliente}</TableCell>
                  <TableCell className="text-black">{service.servico}</TableCell>
                  <TableCell className="text-black">{service.equipe}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      {getStatusBadge(service.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-black">{service.prazo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userType="gestor"
      />
    </div>
  );
}