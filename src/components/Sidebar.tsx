import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import React from 'react';


interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userType: string;
  onOpenAIAssistant: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, userType, onOpenAIAssistant }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    'equipes': false,
    'servicos': false
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
    ];

    switch (userType) {
      case 'administrador':
        return [
          ...baseItems,
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
              { id: 'avaliacoes', label: 'Avaliações', icon: Star }
            ]
          },
          { id: 'equipamentos', label: 'Equipamentos', icon: Package },
          { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare },
          { id: 'controle-ponto', label: 'Controle de Ponto', icon: Clock }
        ];
      case 'gestor':
        return [
          ...baseItems,
          { id: 'equipes', label: 'Equipes', icon: Users },
          { id: 'listar-equipes', label: 'Listar Equipes', icon: FileText, indent: true },
          { id: 'criar-equipes', label: 'Criar Equipes', icon: UserCheck, indent: true },
          { id: 'controle-ponto', label: 'Controle de Ponto', icon: Clock },
          { id: 'servicos', label: 'Serviços', icon: Settings },
          { id: 'listar-servicos', label: 'Listar Serviços', icon: FileText, indent: true },
          { id: 'agendar-servico', label: 'Agendar Serviço', icon: Calendar, indent: true },
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
          { id: 'avaliacoes', label: 'Avaliações', icon: Star },
          { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const isExpanded = expandedMenus[item.id];
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
            style={isActive || hasActiveChild ? { backgroundColor: '#FFFF20' } : {}}
          >
            <div className="flex items-center">
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child: any) => {
                const ChildIcon = child.icon;
                return (
                  <button
                    key={child.id}
                    onClick={() => onSectionChange(child.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === child.id
                        ? 'text-black'
                        : 'text-black hover:bg-gray-50 hover:text-gray-800'
                    }`}
                    style={activeSection === child.id ? { backgroundColor: '#FFFF20' } : {}}
                  >
                    <ChildIcon className="h-4 w-4 mr-3" />
                    {child.label}
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
        onClick={() => onSectionChange(item.id)}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          item.indent ? 'ml-4' : ''
        } ${
          activeSection === item.id
            ? 'text-black'
            : 'text-black hover:bg-gray-50 hover:text-gray-800'
        }`}
        style={activeSection === item.id ? { backgroundColor: '#FFFF20' } : {}}
      >
        <Icon className="h-4 w-4 mr-3" />
        {item.label}
      </button>
    );
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="flex-1 text-sm bg-gray-50 border-0 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>

          {/* AI Assistant Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
              className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors mb-2 hover:opacity-90"
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={onOpenAIAssistant}
            >
              <Bot className="h-4 w-4 mr-3" />
              Assistente Hive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}