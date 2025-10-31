import { MapPin, Clock, CheckCircle, AlertCircle, XCircle, Calendar, Bot, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface ManagerDashboardProps {
  onSectionChange?: (section: string) => void;
}
interface StatusStyle {
  color: string;
  label: string;
  style?: React.CSSProperties;
}

export default function ManagerDashboard({ onSectionChange }: ManagerDashboardProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);

  const services = [
    {
      id: "OS-2024-001",
      cliente: "Shopping Center Norte",
      servico: "Limpeza Geral",
      equipe: "Equipe Alpha",
      status: "em-andamento",
      prazo: "24/09/2024"
    },
    {
      id: "OS-2024-002", 
      cliente: "Prédio Comercial São Paulo",
      servico: "Manutenção Elétrica",
      equipe: "Equipe Beta",
      status: "concluido",
      prazo: "23/09/2024"
    },
    {
      id: "OS-2024-003",
      cliente: "Condomínio Residencial",
      servico: "Jardinagem",
      equipe: "Equipe Gamma",
      status: "agendado",
      prazo: "25/09/2024"
    },
    {
      id: "OS-2024-004",
      cliente: "Hospital Santa Maria",
      servico: "Limpeza Hospitalar",
      equipe: "Equipe Delta",
      status: "pendente",
      prazo: "26/09/2024"
    },
    {
      id: "OS-2024-005",
      cliente: "Escritório Corporate",
      servico: "Limpeza de Vidros",
      equipe: "Equipe Alpha",
      status: "cancelado",
      prazo: "22/09/2024"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, StatusStyle> = {
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
    { name: "Equipe Alpha", zone: "Zona Norte", active: true, members: 8, position: { top: '20%', left: '15%' } },
    { name: "Equipe Beta", zone: "Zona Sul", active: true, members: 6, position: { top: '25%', right: '20%' } },
    { name: "Equipe Gamma", zone: "Zona Leste", active: false, members: 5, position: { bottom: '30%', left: '25%' } },
    { name: "Equipe Delta", zone: "Zona Oeste", active: true, members: 7, position: { bottom: '20%', right: '15%' } },
    { name: "Equipe Epsilon", zone: "Centro", active: true, members: 9, position: { top: '50%', left: '50%' } }
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

      {/* Status Cards - Topo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Concluídos</p>
              <p className="text-3xl text-green-600">12</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2" style={{ borderColor: '#35BAE6' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
              <p className="text-3xl" style={{ color: '#35BAE6' }}>8</p>
            </div>
            <Clock className="h-10 w-10" style={{ color: '#35BAE6', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2" style={{ borderColor: '#FFFF20' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Agendados</p>
              <p className="text-3xl text-gray-800">15</p>
            </div>
            <Calendar className="h-10 w-10 text-gray-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendentes</p>
              <p className="text-3xl text-orange-600">3</p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Mapa da Cidade - Centro */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-black flex items-center">
            <MapPin className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
            Mapa Operacional - São Paulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg h-96 overflow-hidden border-2 border-gray-200">
            {/* Imagem de fundo do mapa */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1693107493680-a05d590a8cd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NjEwMTIwMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Mapa da cidade"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-green-50/80"></div>
            
            {/* Equipes no mapa */}
            {teams.map((team, index) => (
              <div 
                key={index}
                className="absolute flex items-center group"
                style={team.position}
              >
                <div 
                  className={`w-6 h-6 rounded-full border-4 border-white shadow-xl cursor-pointer z-10 ${
                    team.active ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border-2 border-current animate-pulse"></div>
                </div>
                <div className="hidden group-hover:block absolute left-8 top-1/2 -translate-y-1/2 bg-black text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap z-20 shadow-xl">
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-xs opacity-80">{team.zone}</div>
                  <div className="text-xs opacity-80">{team.members} membros</div>
                </div>
              </div>
            ))}

            {/* Legenda */}
            <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg z-10">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow"></div>
                <span className="text-sm text-black">Equipe Ativa</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow"></div>
                <span className="text-sm text-black">Equipe Inativa</span>
              </div>
            </div>
          </div>
          
          {/* Lista de Equipes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams.map((team, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${team.active ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></div>
                  <div>
                    <p className="text-sm text-black">{team.name}</p>
                    <p className="text-xs text-gray-600">{team.zone}</p>
                  </div>
                </div>
                <div className="text-sm text-black">{team.members} membros</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
