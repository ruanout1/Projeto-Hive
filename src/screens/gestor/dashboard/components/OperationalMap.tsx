import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Team } from '../types';
import { ImageWithFallback } from '../../../../components/figma/ImageWithFallback'; // ADICIONE ESTE IMPORT

interface OperationalMapProps {
  teams: Team[];
}

export const OperationalMap = ({ teams }: OperationalMapProps) => {
  // Posições fixas como no protótipo (agora usando interface correta)
  const positions = [
    { top: '20%', left: '15%' },
    { top: '25%', right: '20%' },
    { bottom: '30%', left: '25%' },
    { bottom: '20%', right: '15%' },
    { top: '50%', left: '50%' }
  ];

  // Adiciona propriedade 'active' que falta no seu tipo Team
  const teamsWithActive = teams.map((team, index) => ({
    ...team,
    active: team.members > 0, // Lógica simples - ajuste conforme sua regra
    position: positions[index] || {}
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-black flex items-center">
          <MapPin className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
          Mapa Operacional - São Paulo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg h-96 overflow-hidden border-2 border-gray-200">
          {/* IMAGEM DO MAPA - FALTANDO */}
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1693107493680-a05d590a8cd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NjEwMTIwMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Mapa da cidade"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            fallback={
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <p className="text-gray-500">Carregando mapa...</p>
              </div>
            }
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-green-50/80"></div>
          
          {/* Equipes no mapa - COM LÓGICA DE ATIVO/INATIVO */}
          {teamsWithActive.map((team, index) => (
            <div 
              key={team.id}
              className="absolute flex items-center group"
              style={team.position}
            >
              <div 
                className={`w-6 h-6 rounded-full border-4 border-white shadow-xl cursor-pointer z-10 ${
                  team.active ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                {team.active && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border-2 border-current animate-pulse"></div>
                )}
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
        
        {/* Lista de Equipes - COM INDICADOR DE ATIVO/INATIVO */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamsWithActive.map((team) => (
            <div 
              key={team.id} 
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
  );
};