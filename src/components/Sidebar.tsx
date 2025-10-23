import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Settings, 
  FileText, 
  MessageSquare, 
  BarChart3,
  UserCheck,
  Calendar,
  Search,
  Clock,
  Camera,
  Bot,
  Star,
  Building,
  ChevronDown,
  ChevronRight,
  Package,
  ClipboardList,
  UserCog,
  TrendingUp,
  Menu,
  DollarSign,
  StickyNote
} from 'lucide-react';
import HiveSymbol from './Logo/HiveSymbol';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string, params?: any) => void;
  userType: string;
  onOpenAIAssistant: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, userType, onOpenAIAssistant, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    'equipes': false,
    'servicos': false
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Expande o sidebar quando o mouse entra
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  // Recolhe o sidebar quando o mouse sai
  const handleMouseLeave = () => {
    setIsExpanded(false);
    // Também recolhe os menus expansíveis quando o mouse sai
    setExpandedMenus({
      'equipes': false,
      'servicos': false
    });
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
    ];

    switch (userType) {
      case 'administrador':
        return [
          ...baseItems,
          { id: 'agenda-pessoal', label: 'Minha Agenda', icon: Calendar },
          { id: 'agenda-servicos', label: 'Agenda de Serviços', icon: Calendar },
          { id: 'gerenciar-usuarios', label: 'Usuários', icon: UserCog },
          { 
            id: 'equipes', 
            label: 'Equipes', 
            icon: Users, 
            expandable: true,
            children: [
              { id: 'gerenciar-equipes', label: 'Gerenciamento de Equipes', icon: Users },
              { id: 'relatorios-equipes', label: 'Relatórios', icon: TrendingUp }
            ]
          },
          { id: 'clientes', label: 'Clientes', icon: Building },
          { 
            id: 'servicos', 
            label: 'Serviços', 
            icon: ClipboardList, 
            expandable: true,
            children: [
              { id: 'catalogo-servicos', label: 'Catálogo de Serviços', icon: FileText },
              { id: 'gerenciar-solicitacoes', label: 'Solicitações', icon: ClipboardList },
              { id: 'avaliacoes', label: 'Avaliações', icon: Star }
            ]
          },
          { id: 'documentos', label: 'Documentos', icon: FileText },
          { id: 'ordens-servico', label: 'Ordens de Serviço', icon: FileText },
          { id: 'historico-fotos', label: 'Histórico de Fotos', icon: Camera },
          { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare },
          { id: 'controle-ponto', label: 'Controle de Ponto', icon: Clock }
        ];
      case 'gestor':
        return [
          ...baseItems,
          { id: 'agenda-pessoal', label: 'Minha Agenda', icon: Calendar },
          { id: 'agenda-servicos', label: 'Agenda de Serviços', icon: Calendar },
          { id: 'alocacoes-colaboradores', label: 'Alocações', icon: UserCheck },
          { id: 'gerenciar-solicitacoes', label: 'Solicitações', icon: ClipboardList },
          { id: 'revisao-fotos', label: 'Revisão de Fotos', icon: Camera },
          { id: 'relatorios-equipes', label: 'Relatórios de Desempenho', icon: TrendingUp },
          { id: 'controle-ponto', label: 'Controle de Ponto', icon: Clock },
          { id: 'clientes', label: 'Clientes', icon: Building },
          { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare }
        ];
      case 'colaborador':
        return [
          ...baseItems,
          { id: 'meu-ponto', label: 'Meu Ponto', icon: Clock },
          { id: 'minha-agenda', label: 'Minha Agenda', icon: Calendar },
          { id: 'fotos-servicos', label: 'Fotos de Serviços', icon: Camera },
          { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare }
        ];
      case 'cliente':
        return [
          ...baseItems,
          { id: 'solicitar-servicos', label: 'Solicitar Serviços', icon: Calendar },
          { id: 'servicos-agendados', label: 'Serviços Agendados', icon: Calendar },
          { id: 'dashboard-gastos', label: 'Dashboard de Gastos', icon: DollarSign },
          { id: 'documentos-cliente', label: 'Documentos', icon: FileText },
          { id: 'avaliacoes', label: 'Avaliações', icon: Star },
          { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (itemId: string) => {
    onSectionChange(itemId);
  };

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const isMenuExpanded = expandedMenus[item.id];
    const isActive = activeSection === item.id;
    const hasActiveChild = item.children?.some((child: any) => child.id === activeSection);

    if (item.expandable) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
              item.indent ? 'ml-4' : ''
            } ${
              isActive || hasActiveChild
                ? 'text-black'
                : 'text-black hover:bg-gray-50 hover:text-gray-800'
            }`}
            style={{
              backgroundColor: isActive || hasActiveChild ? '#FFFF20' : 'transparent'
            }}
          >
            <div className="flex items-center min-w-0">
              <Icon className="h-4 w-4 flex-shrink-0 mr-3" />
              <span className="truncate">{item.label}</span>
            </div>
            {isMenuExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </button>
          {isMenuExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child: any) => {
                const ChildIcon = child.icon;
                return (
                  <button
                    key={child.id}
                    onClick={() => handleMenuClick(child.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === child.id
                        ? 'text-black'
                        : 'text-black hover:bg-gray-50 hover:text-gray-800'
                    }`}
                    style={activeSection === child.id ? { backgroundColor: '#FFFF20' } : {}}
                  >
                    <ChildIcon className="h-4 w-4 mr-3" />
                    <span className="truncate">{child.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => handleMenuClick(item.id)}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          item.indent ? 'ml-4' : ''
        } ${
          activeSection === item.id
            ? 'text-black'
            : 'text-black hover:bg-gray-50 hover:text-gray-800'
        }`}
        style={{
          backgroundColor: activeSection === item.id ? '#FFFF20' : 'transparent'
        }}
      >
        <Icon className="h-4 w-4 flex-shrink-0 mr-3" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ 
          width: isExpanded || isMobileOpen ? '256px' : '64px',
          zIndex: 50,
          top: 0,
          height: '100vh',
          boxShadow: isExpanded || isMobileOpen ? '4px 0 12px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        {/* Header - Logo ou Hamburguer */}
        <div className="h-14 flex items-center justify-center border-b border-gray-200">
          {isExpanded ? (
            <div 
              className="flex items-center justify-center transition-opacity" 
              style={{ transform: 'scale(0.4)', transformOrigin: 'center' }}
            >
              <HiveSymbol />
            </div>
          ) : (
            <div
              className="p-2 rounded-md transition-colors"
              style={{
                backgroundColor: 'rgba(100, 0, 164, 0.05)',
                color: '#6400A4'
              }}
            >
              <Menu className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Conteúdo do Menu - renderiza quando expandido ou mobile aberto */}
        {(isExpanded || isMobileOpen) && (
          <div className="flex-1 overflow-y-auto scrollbar-hide animate-in fade-in duration-200">
            <div className="p-3">
              {/* Campo de Busca */}
              <div className="flex items-center space-x-2 mb-6">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="flex-1 text-sm bg-gray-50 border-0 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                />
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => renderMenuItem(item))}
              </nav>

              {/* AI Assistant Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors mb-2 hover:opacity-90"
                  style={{ 
                    backgroundColor: '#6400A4', 
                    color: 'white'
                  }}
                  onClick={onOpenAIAssistant}
                >
                  <Bot className="h-4 w-4 flex-shrink-0 mr-3" />
                  <span className="truncate">Assistente Hive</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}