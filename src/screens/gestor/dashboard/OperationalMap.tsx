import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Team } from './types';

interface OperationalMapProps {
  teams: Team[];
}

export const OperationalMap = ({ teams }: OperationalMapProps) => {
  // A constante de equipes mockadas foi removida.
  // O componente agora usa a prop 'teams' diretamente.

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
          {/* Placeholder do Mapa */}
          <div className="absolute inset-0 w-full h-full object-cover opacity-30 bg-gray-200" />
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Placeholder do Mapa</p>
            </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-green-50/80"></div>

          {/* Equipes no mapa - agora usando os dados da prop */}
          {teams.map((team, index) => (
            <div key={team.id} className="absolute flex items-center group" style={team.position}> {/* Usando team.id como key */}
              <div className={`w-6 h-6 rounded-full border-4 border-white shadow-xl cursor-pointer z-10 bg-green-500`}> {/* A lógica 'active' será adicionada a seguir */}
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

        {/* Lista de Equipes - agora usando os dados da prop */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"> {/* Usando team.id como key */}
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-green-500`}></div> {/* A lógica 'active' será adicionada a seguir */}
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