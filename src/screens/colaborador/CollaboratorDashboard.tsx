import { Clock, CheckSquare, Calendar, MapPin, User, Bot, PlayCircle, StopCircle, CheckCircle, Loader2, AlertCircle, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import AIAssistant from '../public/AIAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { getCollaboratorDashboard } from '../../lib/api'; // Importar a nova função da API

// Tipagem para os dados do dashboard que virão do backend
interface DashboardData {
  welcomeMessage: string;
  nextService: {
    id: string;
    serviceType: string;
    clientName: string;
    date: string;
    time: string;
    status: 'scheduled' | 'in-progress';
  } | null;
  monthlyStats: {
    completedServices: number;
    totalHours: number;
  };
  notifications: Array<{ id: number; message: string; type: 'info' | 'warning' }>;
}

interface CollaboratorDashboardProps {
  onSectionChange?: (section: string, params?: any) => void;
}

export default function CollaboratorDashboard({ onSectionChange }: CollaboratorDashboardProps) {
  // Estados para gerenciar os dados, carregamento e erros
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAIOpen, setIsAIOpen] = useState(false);
  
  // Efeito para buscar os dados do dashboard quando o componente montar
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await getCollaboratorDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Não foi possível carregar as informações do painel. Tente recarregar a página.");
        toast.error("Erro ao carregar dashboard", {
          description: "Verifique sua conexão e tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNavigate = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  // Renderização de Carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-purple-700" />
        <p className="ml-4 text-lg">Carregando seu painel...</p>
      </div>
    );
  }

  // Renderização de Erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ocorreu um Erro</h2>
        <p className="text-center">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">Recarregar Página</Button>
      </div>
    );
  }

  const { nextService, monthlyStats } = dashboardData || {};

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Painel de Atividades</h1>
          <p className="text-black">
            {dashboardData?.welcomeMessage || "Bem-vindo(a) ao seu painel."}
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          style={{ backgroundColor: '#6400A4', color: 'white' }}
          onClick={() => setIsAIOpen(true)}
        >
          <Bot className="h-4 w-4" />
          <span>Assistente IA</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Próximo Serviço */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Próximo Serviço Agendado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextService ? (
              <>
                <div>
                  <h3 className="text-black mb-2 font-semibold text-lg">{nextService.serviceType}</h3>
                  <div className="flex items-center space-x-2 text-sm text-black mb-2">
                    <User className="h-4 w-4" />
                    <span>{nextService.clientName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-black mb-3">
                    <span>🗓️ {new Date(nextService.date).toLocaleDateString('pt-BR')}</span>
                    <span>⏰ {nextService.time}</span>
                    <Badge className={`border-none ${nextService.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {nextService.status === 'in-progress' ? 'Em Andamento' : 'Agendado'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                   <Button
                    onClick={() => handleNavigate('meus-servicos')}
                    className="flex-1"
                    style={{ backgroundColor: '#10B981', color: 'white' }}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Iniciar ou Ver Detalhes
                  </Button>
                   <Button
                    variant="outline"
                    onClick={() => handleNavigate('documentacao-servico')}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Anexar Fotos
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Tudo certo por aqui!</h3>
                <p className="text-gray-500">Você não tem nenhum serviço agendado para os próximos dias.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas do Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-blue-500" />
              Seu Desempenho no Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                  <div className="text-center">
                      <p className="text-3xl font-bold" style={{color: '#6400A4'}}>{monthlyStats?.completedServices || 0}</p>
                      <p className="text-sm text-gray-600">Serviços Concluídos</p>
                  </div>
                   <div className="text-center">
                      <p className="text-3xl font-bold" style={{color: '#35BAE6'}}>{monthlyStats?.totalHours || 0}</p>
                      <p className="text-sm text-gray-600">Horas Registradas</p>
                  </div>
              </div>
              <Button 
                className="w-full justify-center"
                variant="outline"
                onClick={() => handleNavigate('meu-ponto')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Ver Histórico de Ponto
              </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda Rápida */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-black flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Ações Rápidas
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => handleNavigate('minha-agenda')}>
                        Ver Agenda Completa
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 {/* Aqui poderia vir uma lista simplificada da agenda do dia, se a API retornasse */}
                 <div className="p-4 bg-gray-50 rounded-lg text-center">
                   <p className="text-gray-600">Acesse sua agenda para ver a programação completa de hoje e dos próximos dias.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Button 
                    className="w-full justify-center py-6 text-base"
                    style={{ backgroundColor: '#35BAE6', color: 'white' }}
                    onClick={() => handleNavigate('meus-servicos')}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Meus Serviços
                  </Button>
                  <Button 
                    className="w-full justify-center py-6 text-base"
                    style={{ backgroundColor: '#8B20EE', color: 'white' }}
                    onClick={() => handleNavigate('documentacao-servico')}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Documentação
                  </Button>
                 </div>
            </CardContent>
        </Card>
        
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Avisos e Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
                <div className="space-y-3">
                    {dashboardData.notifications.map(notif => (
                        <div key={notif.id} className="flex items-start p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                           <AlertCircle className="h-5 w-5 mr-3 text-yellow-600 flex-shrink-0" />
                           <p className="text-sm text-yellow-800">{notif.message}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-4">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                    <p>Nenhum aviso novo para você.</p>
                </div>
            )}
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
