import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  User,
  MapPin,
  Star,
  Calendar,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import AIAssistant from "../../components/AIAssistant";

export default function ClientDashboard() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  // 🔹 Carrega dados do backend (ou usa mock se falhar)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, historyRes, timelineRes] = await Promise.all([
          fetch("http://localhost:5000/api/clientes/current-service"),
          fetch("http://localhost:5000/api/clientes/history"),
          fetch("http://localhost:5000/api/clientes/timeline"),
        ]);

        if (serviceRes.ok && historyRes.ok && timelineRes.ok) {
          const [service, history, timelineData] = await Promise.all([
            serviceRes.json(),
            historyRes.json(),
            timelineRes.json(),
          ]);

          setCurrentService(service);
          setServiceHistory(history);
          setTimeline(timelineData);
        } else {
          console.warn("⚠️ Usando dados mock (sem backend)");
          loadMockData();
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        loadMockData();
      }
    };

    const loadMockData = () => {
      setCurrentService({
        id: "OS-2024-089",
        title: "Limpeza Geral - Escritório Corporate",
        status: "em-andamento",
        progress: 70,
        startDate: "23/09/2024",
        expectedEnd: "23/09/2024 - 17:00",
        team: "Equipe Alpha",
        leader: "Carlos Silva",
        phone: "(11) 99999-8888",
        location: "Av. Paulista, 1000 - 15º andar",
      });

      setServiceHistory([
        {
          id: "OS-2024-078",
          service: "Limpeza Geral",
          date: "20/09/2024",
          team: "Equipe Beta",
          status: "completed",
          rating: 5,
          duration: "6h",
        },
        {
          id: "OS-2024-065",
          service: "Limpeza de Vidros",
          date: "15/09/2024",
          team: "Equipe Alpha",
          status: "completed",
          rating: 4,
          duration: "4h",
        },
        {
          id: "OS-2024-052",
          service: "Limpeza Geral + Enceramento",
          date: "10/09/2024",
          team: "Equipe Gamma",
          status: "completed",
          rating: 5,
          duration: "8h",
        },
        {
          id: "OS-2024-038",
          service: "Limpeza Pós-Obra",
          date: "05/09/2024",
          team: "Equipe Delta",
          status: "completed",
          rating: 4,
          duration: "12h",
        },
      ]);

      setTimeline([
        { time: "08:00", event: "Equipe chegou ao local", status: "completed" },
        { time: "08:15", event: "Início dos trabalhos de limpeza", status: "completed" },
        { time: "10:30", event: "Limpeza das áreas comuns finalizada", status: "completed" },
        { time: "12:00", event: "Pausa para almoço da equipe", status: "completed" },
        { time: "13:00", event: "Limpeza das salas em andamento", status: "current" },
        { time: "15:30", event: "Limpeza dos banheiros", status: "pending" },
        { time: "16:30", event: "Finalização e vistoria", status: "pending" },
        { time: "17:00", event: "Conclusão do serviço", status: "pending" },
      ]);
    };

    fetchData();
  }, []);

  // 🔹 Funções auxiliares
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em-andamento":
        return (
          <Badge
            className="border-none"
            style={{ backgroundColor: "rgba(53, 186, 230, 0.1)", color: "#35BAE6" }}
          >
            Em Andamento
          </Badge>
        );
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-none">Concluído</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-none">Agendado</Badge>;
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "current":
        return <Clock className="h-4 w-4" style={{ color: "#6400A4" }} />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "current":
        return "#6400A4";
      case "pending":
      default:
        return "#e5e7eb";
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ));

  if (!currentService) return <p className="p-6 text-black">Carregando dados...</p>;

  // 🔹 JSX principal (alterações para responsividade)
  return (
    // Container principal agora permite scroll vertical e tem padding responsivo.
    <div className="p-4 md:p-6 h-screen overflow-y-auto">
      {/* Cabeçalho */}
      {/* Em telemóveis (padrão), os itens ficam em coluna. A partir de `sm`, ficam em linha */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="hive-screen-title">Acompanhamento de Serviços</h1>
          <p className="text-black">
            Status atual dos seus serviços e histórico completo de atendimentos.
          </p>
        </div>
        <Button
          className="flex items-center space-x-2 w-full sm:w-auto flex-shrink-0" // O botão ocupa a largura toda no telemóvel
          style={{ backgroundColor: "#6400A4", color: "white" }}
          onClick={() => setIsAIOpen(true)}
        >
          <Bot className="h-4 w-4" />
          <span>IA</span>
        </Button>
      </div>

      {/* Serviço Atual + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Serviço Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" style={{ color: "#6400A4" }} />
                Serviço Atual
              </div>
              {getStatusBadge(currentService.status)}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="text-black mb-2">{currentService.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-black mb-2">
                <MapPin className="h-4 w-4" />
                <span>{currentService.location}</span>
              </div>
              <p className="text-sm text-black">
                OS: {currentService.id} | Iniciado: {currentService.startDate}
              </p>
              <p className="text-sm text-black">
                Previsão de término: {currentService.expectedEnd}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-black">Progresso do Serviço</span>
                <span style={{ color: "#FFFF20", WebkitTextStroke: "1px black" }}>
                  {currentService.progress}%
                </span>
              </div>
              <Progress value={currentService.progress} className="w-full [&>div]:bg-[#FFFF20]" />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-black mb-2">Equipe Responsável</h4>
              <div className="flex items-center space-x-2 text-sm text-black mb-1">
                <User className="h-4 w-4" />
                <span>Líder: {currentService.leader}</span>
              </div>
              <div className="text-sm text-black mb-1">Equipe: {currentService.team}</div>
              <div className="text-sm text-black">Contato: {currentService.phone}</div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: "#8B20EE" }} />
              Andamento em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto scrollbar-hide">
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 w-16">
                    {getTimelineIcon(item.status)}
                    <span className="text-sm text-black">{item.time}</span>
                  </div>

                  <div className="flex-1 flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-4"
                      style={{ backgroundColor: getTimelineColor(item.status) }}
                    ></div>
                    <p className="text-sm text-black">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" style={{ color: "#6400A4" }} />
            Histórico de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            {serviceHistory.map((service, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="text-black">{service.service}</h4>
                    <p className="text-sm text-black">OS: {service.id}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(service.rating)}
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-none">
                      Concluído
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-black gap-2">
                  <div className="flex items-center space-x-4">
                    <span>📅 {service.date}</span>
                    <span>👥 {service.team}</span>
                    <span>⏱️ {service.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assistente de IA */}
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} userType="cliente" />
    </div>
  );
}
