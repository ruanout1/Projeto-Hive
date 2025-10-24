import { useState } from 'react';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Clock, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

interface RequestsViewScreenProps {
  category: string;
  requests: any[];
  onBack: () => void;
}

export default function RequestsViewScreen({ category, requests, onBack }: RequestsViewScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'total':
        return <Plus className="h-6 w-6" style={{ color: '#6400A4' }} />;
      case 'aprovadas':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'urgentes':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'em-analise':
        return <Clock className="h-6 w-6" style={{ color: '#8B20EE' }} />;
      default:
        return <Calendar className="h-6 w-6" style={{ color: '#6400A4' }} />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'total':
        return 'Todas as Solicitações';
      case 'aprovadas':
        return 'Solicitações Aprovadas';
      case 'urgentes':
        return 'Solicitações Urgentes';
      case 'em-analise':
        return 'Solicitações em Análise';
      default:
        return 'Solicitações';
    }
  };

  const filteredRequests = requests.filter(request => 
    request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center space-x-3">
          {getCategoryIcon(category)}
          <div>
            <h1>{getCategoryTitle(category)}</h1>
            <p className="text-black">
              {filteredRequests.length} solicitação{filteredRequests.length !== 1 ? 'ões' : ''} encontrada{filteredRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-black flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por serviço, ID ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {filteredRequests.length > 0 ? (
              <div className="space-y-4 p-6">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-black">{request.service}</h3>
                          {getStatusBadge(request.status)}
                          {getPriorityBadge(request.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">ID: {request.id}</p>
                      </div>
                    </div>

                    {request.description && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700">{request.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Data Solicitada:</p>
                        <p className="text-black">{request.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Solicitado em:</p>
                        <p className="text-black">{request.requestedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3" style={{ color: '#8B20EE', opacity: 0.3 }} />
                  <p className="text-black mb-1">Nenhuma solicitação encontrada</p>
                  <p className="text-sm text-gray-600">
                    {searchTerm ? 'Tente alterar os filtros de busca' : 'Não há solicitações nesta categoria'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}