import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import ScreenHeader from '../public/ScreenHeader';
import { 
  Shield, 
  Users, 
  User, 
  UserCheck,
  Settings,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';

interface UserProfilesScreenProps {
  onBack?: () => void;
}

export default function UserProfilesScreen({ onBack }: UserProfilesScreenProps) {
  const userProfiles = [
    {
      id: 'administrador',
      name: 'Administrador',
      description: 'Gerencia todas as configurações do sistema, usuários, equipes e serviços. Possui acesso total e controle irrestrito sobre a plataforma.',
      icon: Shield,
      image: '/api/placeholder/120/120',
      permissions: [
        'Configurar sistema',
        'Auditar logs',
        'Definir permissões',
        'Gerenciar usuários',
        'Acessar todos os dados',
        'Integrar APIs'
      ]
    },
    {
      id: 'gestor',
      name: 'Gestor de Equipes',
      description: 'Responsável pela criação, alocação e supervisão de equipes, acompanhando o progresso dos serviços e desempenho dos colaboradores.',
      icon: Users,
      image: '/api/placeholder/120/120',
      permissions: [
        'Criar e gerenciar equipes',
        'Acompanhar projetos',
        'Comunicar com colaboradores',
        'Alocar colaboradores',
        'Ver relatórios de equipes',
        'Aprovar horários'
      ]
    },
    {
      id: 'colaborador',
      name: 'Colaborador',
      description: 'Executa tarefas e serviços atribuídos, registra o progresso, gerencia sua agenda e se comunica com o gestor.',
      icon: User,
      image: '/api/placeholder/120/120',
      permissions: [
        'Visualizar tarefas',
        'Atualizar status',
        'Acessar documentos',
        'Registrar tempo',
        'Comunicar com gestor',
        'Gerenciar agenda pessoal'
      ]
    },
    {
      id: 'cliente',
      name: 'Cliente',
      description: 'Solicita e acompanha serviços, visualiza o histórico de interações, fornece feedback e acessa relatórios de desempenho dos serviços contratados.',
      icon: UserCheck,
      image: '/api/placeholder/120/120',
      permissions: [
        'Solicitar novos serviços',
        'Acessar histórico',
        'Visualizar faturas',
        'Acompanhar status',
        'Fornecer feedback',
        'Comunicar com gestor'
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <ScreenHeader 
          title="Perfis de Usuário"
          description="Explore os diferentes perfis de usuário no Sistema Hive, cada um com um conjunto único de funcionalidades e permissões, projetados para otimizar a gestão de equipes terceirizadas."
          onBack={() => onBack?.()}
        />
      </div>

      {/* Grid de Perfis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userProfiles.map((profile) => {
          const Icon = profile.icon;
          return (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Icon className="w-12 h-12" style={{ color: '#6400A4' }} />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl" style={{ color: '#6400A4' }}>
                  {profile.name}
                </CardTitle>
                <p className="text-sm text-black mt-2">
                  {profile.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm text-black mb-3">
                    Permissões Chave:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {profile.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center text-sm text-black">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: '#8B20EE' }}
                        />
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    style={{ borderColor: '#6400A4', color: '#6400A4' }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer com links */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex justify-center space-x-8 text-sm text-black">
          <button className="hover:text-gray-800">Soluções</button>
          <button className="hover:text-gray-800">Recursos</button>
          <button className="hover:text-gray-800">Empresa</button>
          <button className="hover:text-gray-800">Contato</button>
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}