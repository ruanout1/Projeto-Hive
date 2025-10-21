import { Activity, Users, ClipboardList, TrendingUp, Heart, Bot, Eye, EyeOff, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LabelList } from 'recharts';
import { useState } from 'react';
import AIAssistant from './AIAssistant';

interface AdminDashboardProps {
  onSectionChange?: (section: string) => void;
}

export default function AdminDashboard({ onSectionChange }: AdminDashboardProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showLabelsInStatusChart, setShowLabelsInStatusChart] = useState(true);
  const [showLabelsInRegionChart, setShowLabelsInRegionChart] = useState(true);

  const kpis = [
    {
      title: "Equipes Ativas",
      value: "42",
      change: "+5",
      changeType: "increase",
      icon: Users,
      color: "#6400A4"
    },
    {
      title: "Ordens de Serviço",
      value: "187",
      change: "+23",
      changeType: "increase", 
      icon: ClipboardList,
      color: "#8B20EE"
    },
    {
      title: "Saúde Financeira",
      value: "94%",
      change: "+2%",
      changeType: "increase",
      icon: TrendingUp,
      color: "#6400A4"
    },
    {
      title: "Satisfação Cliente",
      value: "4.8",
      change: "+0.2",
      changeType: "increase",
      icon: Heart,
      color: "#6400A4"
    }
  ];

  // Dados para o gráfico de pizza - Distribuição de Recursos
  const pieData = [
    { name: 'Equipes Ativas', value: 42, color: '#16a34a' }, // Verde
    { name: 'Equipamentos', value: 128, color: '#FF8C00' }, // Laranja
    { name: 'Veículos', value: 35, color: '#1e40af' }, // Azul escuro
    { name: 'Fornecedores', value: 67, color: '#FFFF20' }, // Amarelo da paleta
    { name: 'Clientes Ativos', value: 234, color: '#10B981' } // Verde
  ];

  // Dados para segundo gráfico de pizza - Performance por Região
  const performanceData = [
    { name: 'Zona Norte', value: 28, color: '#16a34a' }, // Verde
    { name: 'Zona Sul', value: 32, color: '#10B981' }, // Verde
    { name: 'Zona Leste', value: 25, color: '#FFFF20' }, // Amarelo da paleta
    { name: 'Zona Oeste', value: 22, color: '#1e40af' }, // Azul escuro
    { name: 'Centro', value: 30, color: '#FF8C00' } // Laranja
  ];

  // Calcular totais
  const totalResources = pieData.reduce((sum, item) => sum + item.value, 0);
  const totalPerformance = performanceData.reduce((sum, item) => sum + item.value, 0);

  // Função para calcular percentual
  const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  // Componente para renderizar label customizado com callout (linha conectora)
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, fill, name, value } = props;
    const RADIAN = Math.PI / 180;
    
    // Só mostrar label se percentual for maior que 5%
    if (percent < 0.05) return null;

    // Calcular posição para o callout (fora do gráfico)
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Ponto de início da linha (borda do gráfico)
    const x1 = cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN);
    const y1 = cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN);
    
    const percentage = (percent * 100).toFixed(0);
    
    return (
      <g>
        {/* Linha conectora */}
        <line 
          x1={x1} 
          y1={y1} 
          x2={x} 
          y2={y} 
          stroke={fill} 
          strokeWidth={2}
          opacity={0.6}
        />
        
        {/* Badge uniformizado: fundo roxo, texto amarelo */}
        <g transform={`translate(${x},${y})`}>
          <rect
            x={x > cx ? 0 : -50}
            y={-12}
            width={50}
            height={24}
            rx={12}
            fill="#6400A4"
            opacity={0.95}
          />
          <text 
            x={x > cx ? 25 : -25}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFF20"
            style={{
              fontSize: '13px',
              fontWeight: '700',
              pointerEvents: 'none'
            }}
          >
            {percentage}%
          </text>
        </g>
      </g>
    );
  };

  // Tooltip customizado moderno uniformizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div 
          className="bg-white p-3 rounded-lg shadow-xl border border-gray-200"
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            minWidth: '180px'
          }}
        >
          <p className="text-sm text-black mb-2" style={{ fontWeight: '600', fontSize: '13px' }}>
            {data.name}
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Quantidade:</span>
            <span className="text-sm" style={{ fontWeight: '700', color: '#000' }}>
              {data.value}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Percentual:</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: '#6400A4',
                color: '#FFFF20',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              {percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Tooltip customizado para gráfico de performance
  const CustomTooltipPerformance = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = performanceData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div 
          className="bg-white p-3 rounded-lg shadow-xl border border-gray-200"
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            minWidth: '180px'
          }}
        >
          <p className="text-sm text-black mb-2" style={{ fontWeight: '600', fontSize: '13px' }}>
            {data.name}
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Performance:</span>
            <span className="text-sm" style={{ fontWeight: '700', color: '#000' }}>
              {data.value}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Do total:</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: '#6400A4',
                color: '#FFFF20',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              {percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Componente para renderizar legenda customizada melhorada e responsiva
  const renderCustomizedLegend = (data: any[], total: number) => {
    return (
      <div className="flex flex-col space-y-2 text-sm">
        {data.map((entry, index) => {
          const percentage = calculatePercentage(entry.value, total);
          
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors gap-2"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0 shadow-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-black truncate text-sm">{entry.name}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-black text-sm" style={{ fontWeight: '700' }}>
                  {entry.value}
                </span>
                <span 
                  className="text-xs px-2 py-1 rounded-full min-w-[48px] text-center" 
                  style={{ 
                    backgroundColor: '#6400A4',
                    color: '#FFFF20',
                    fontWeight: '700'
                  }}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };





  const recentActivities = [
    "Nova equipe formada para Zona Norte",
    "Ordem de serviço #1847 concluída",
    "Pagamento processado - R$ 45.800",
    "Avaliação 5 estrelas recebida",
    "Manutenção preventiva agendada"
  ];

  return (
    <div className='p-6 overflow-hidden'>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Visão Operacional</h1>
          <p className="text-black font-normal">
            Indicadores em tempo real – Monitoramento completo das operações.
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

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const bgColors = [
            'from-purple-50 to-purple-100',
            'from-purple-50 to-purple-100', 
            'from-blue-50 to-blue-100',
            'from-green-50 to-green-100'
          ];
          const borderColors = ['#6400A4', '#8B20EE', '#35BAE6', '#16a34a'];
          const textColors = ['#6400A4', '#8B20EE', '#35BAE6', '#16a34a'];
          
          return (
            <div key={index} className={`bg-gradient-to-br ${bgColors[index]} rounded-xl p-4 border-2`} style={{ borderColor: borderColors[index] }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl" style={{ color: textColors[index] }}>
                      {kpi.value}
                    </p>
                    {kpi.change && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        {kpi.change}
                      </Badge>
                    )}
                  </div>
                </div>
                <IconComponent className="h-8 w-8" style={{ color: textColors[index], opacity: 0.5 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos de Pizza - Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição de Recursos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black flex items-center">
                <Activity className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Distribuição de Recursos
              </CardTitle>
              <button
                onClick={() => setShowLabelsInStatusChart(!showLabelsInStatusChart)}
                className="text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-2"
                style={{ 
                  backgroundColor: showLabelsInStatusChart ? '#6400A4' : '#e5e7eb',
                  color: showLabelsInStatusChart ? '#fff' : '#000'
                }}
              >
                {showLabelsInStatusChart ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>% Visível</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>% Oculto</span>
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={showLabelsInStatusChart ? renderCustomLabel : false}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              {renderCustomizedLegend(pieData, totalResources)}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Região */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
                Performance por Região
              </CardTitle>
              <button
                onClick={() => setShowLabelsInRegionChart(!showLabelsInRegionChart)}
                className="text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-2"
                style={{ 
                  backgroundColor: showLabelsInRegionChart ? '#6400A4' : '#e5e7eb',
                  color: showLabelsInRegionChart ? '#fff' : '#000'
                }}
              >
                {showLabelsInRegionChart ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>% Visível</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>% Oculto</span>
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={showLabelsInRegionChart ? renderCustomLabel : false}
                    labelLine={false}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPerformance />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              {renderCustomizedLegend(performanceData, totalPerformance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Ação Rápida - Solicitações */}
      <Card 
        className="mb-8 cursor-pointer hover:shadow-lg transition-shadow border-2"
        style={{ borderColor: '#FFFF20' }}
        onClick={() => onSectionChange?.('gerenciar-solicitacoes')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-4 rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)' }}
              >
                <FileText className="h-8 w-8" style={{ color: '#6400A4' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">
                  Gerenciar Solicitações de Serviço
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visualize, aprove e gerencie todas as solicitações dos clientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Badge 
                  className="text-lg px-4 py-2 border-none"
                  style={{ backgroundColor: '#FFFF20', color: '#000' }}
                >
                  2 Pendentes
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Novas solicitações</p>
              </div>
              <Button
                style={{ backgroundColor: '#6400A4', color: 'white' }}
              >
                Acessar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atividades Recentes - Seção inferior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black flex items-center">
            <Activity className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: '#6400A4' }}
                ></div>
                <p className="text-sm text-black">{activity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userType="administrador"
      />
    </div>
  );
}