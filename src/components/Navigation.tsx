import { useState } from 'react';
import { Bell, LogOut, User, HelpCircle, Shield, Moon, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import HiveSymbol from './Logo/HiveSymbol';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userType: string;
  onProfileSettings?: () => void;
  onSectionChange?: (section: string, params?: any) => void;
}

export default function Navigation({ activeTab, onTabChange, onLogout, userType, onProfileSettings, onSectionChange }: NavigationProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    onSectionChange?.('notificacoes');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-3 py-0">
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center">
          <div className="scale-[0.35] -ml-2">
            <HiveSymbol />
          </div>
        </div>

        {/* Área do Usuário */}
        <div className="flex items-center space-x-1.5">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 relative">
                <Bell className="h-3 w-3" />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto scrollbar-hide">
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-900">Notificações</h4>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="p-1.5 cursor-pointer focus:bg-transparent hover:bg-transparent"
                onClick={() => {
                  setNotificationsOpen(false);
                  onSectionChange?.('solicitar-servicos', { tab: 'minhas-solicitacoes' });
                }}
              >
                <div className="flex items-start justify-between space-x-2 p-2.5 w-full" style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)', borderRadius: '16px' }}>
                  <div className="flex-1 min-w-0 rounded-[10px] p-[5px] bg-[rgba(255,255,32,0.75)]">
                    <p className="text-sm font-medium text-center mb-1 text-white">Confirmação de Data Necessária</p>
                    <p className="text-xs text-white mt-0.5">O gestor propôs uma nova data para seu serviço</p>
                    <p className="text-xs mt-1 text-white">Agora</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="p-1.5 cursor-pointer focus:bg-transparent hover:bg-transparent"
                onClick={() => onSectionChange?.('comunicacao')}
              >
                <div className="flex items-start justify-between space-x-2 p-2.5 w-full" style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)', borderRadius: '16px' }}>
                  <div className="flex-1 min-w-0 rounded-[10px] p-[5px] bg-[rgba(255,255,32,0.75)]">
                    <p className="text-sm font-medium text-center mb-1 text-white">Nova mensagem de João Silva</p>
                    <p className="text-xs text-white mt-0.5">Solicitação sobre orçamento para manutenção</p>
                    <p className="text-xs mt-1 text-white">5 min atrás</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="p-1.5 cursor-pointer focus:bg-transparent hover:bg-transparent"
                onClick={() => onSectionChange?.('comunicacao')}
              >
                <div className="flex items-start justify-between space-x-2 p-2.5 w-full" style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)', borderRadius: '16px' }}>
                  <div className="flex-1 min-w-0 rounded-[10px] p-[5px] bg-[rgba(255,255,32,0.75)]">
                    <p className="text-sm font-medium text-center mb-1 text-white">Equipe Beta respondeu</p>
                    <p className="text-xs text-white mt-0.5">Confirmação de disponibilidade para serviço</p>
                    <p className="text-xs mt-1 text-white">15 min atrás</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="p-1.5 cursor-pointer focus:bg-transparent hover:bg-transparent"
                onClick={() => onSectionChange?.('avaliacoes')}
              >
                <div className="flex items-start justify-between space-x-2 p-2.5 w-full" style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)', borderRadius: '16px' }}>
                  <div className="flex-1 min-w-0 rounded-[10px] p-[5px] bg-[rgba(255,255,32,0.75)]">
                    <p className="text-sm font-medium text-center mb-1 text-white">Nova avaliação recebida</p>
                    <p className="text-xs text-white mt-0.5">Cliente Maria deu 5 estrelas para serviço</p>
                    <p className="text-xs mt-1 text-white">1 hora atrás</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={handleViewAllNotifications}
                >
                  Ver todas as notificações
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 h-6 px-1.5 hover:bg-gray-100">
                <Avatar className="h-5 w-5">
                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                    <User className="h-2.5 w-2.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-black">{userType}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onProfileSettings} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onProfileSettings && onProfileSettings()} className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onProfileSettings && onProfileSettings()} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Preferências de Tema</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onProfileSettings && onProfileSettings()} className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda e Suporte</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onProfileSettings && onProfileSettings()} className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Políticas e Termos</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>
      </div>
    </nav>
  );
}