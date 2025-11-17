import { useState } from 'react';
import LoginScreen from './screens/public/LoginScreen';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import DashboardScreen from './screens/administrador/AdminDashboardarrumar';
import UserProfilesScreen from './components/UserProfilesScreen';
import PhotoUploadSection from './screens/colaborador/CollaboratorPhotoUploadSection';
import CommunicationScreen from './screens/chat/CommunicationScreen';
import ClientsScreen from './screens/gestor/ManagerClientsScreen';
import ClientRatingsScreen from './screens/cliente/ClientRatingsScreen';
import ServiceRequestScreen from './screens/cliente/ServiceRequestScreen';
import RequestsViewScreen from './components/RequestsViewScreen';
import ProfileSettingsScreen from './components/ProfileSettingsScreen';
import NotificationsScreen from './components/NotificationsScreen';
import UserManagementScreen from './screens/administrador/AdminUserManagementScreen';
import TeamManagementScreen from './screens/administrador/AdminTeamManagementScreen';
import TeamReportsScreen from './components/TeamReportsScreen';
import ServiceCatalogScreen from './screens/administrador/AdminServiceCatalogScreen';
import AdminRatingsScreen from './screens/administrador/AdminRatingsScreen';
import AdminTimeClockScreen from './screens/administrador/AdminEmployeeControlScreen';
import ManagerEmployeeControlScreen from './screens/gestor/ManagerEmployeeControlScreen';
import CollaboratorTimeClockScreen from './screens/colaborador/CollaboratorTimeClockScreen';
import ManagerPersonalScheduleScreen from './screens/gestor/ManagerPersonalScheduleScreen';
console.log('📍 ManagerPersonalScheduleScreen importado:', ManagerPersonalScheduleScreen);
import ManagerServiceRequests from './screens/gestor/ManagerServiceRequests';
import ClientDocumentsScreen from './screens/cliente/ClientDocumentsScreen';
import DocumentsScreen from './screens/administrador/AdminDocumentsScreen';
import MyPersonalScheduleScreen from './screens/administrador/AdminPersonalScheduleScreen';
import ServiceScheduleScreen from './screens/gestor/ManagerServiceScheduleScreen';
import ClientScheduledServicesScreen from './screens/cliente/ClientScheduledServicesScreen';
import ClientExpensesDashboardScreen from './screens/cliente/ClientExpensesDashboardScreen';
import ManagerPerformanceReportsScreen from './screens/gestor/ManagerPerformanceReportsScreen';
import AdminPerformanceReportsScreen from './screens/administrador/AdminPerformanceReportsScreen';
import ClientServicePhotosScreen from './screens/cliente/ClientServicePhotosScreen';
import CollaboratorAllocationsScreen from './screens/gestor/ManagerAllocationsScreen';
import ManagerPhotoReviewScreen from './screens/gestor/ManagerPhotoReviewScreen';
import AdminPhotoHistoryScreen from './screens/administrador/AdminPhotoHistoryScreen';
import ServiceOrdersScreen from './screens/administrador/AdminServiceOrdersScreen';
import AIAssistant from './components/AIAssistant';
import { Toaster } from './components/ui/sonner';
import AdminServiceRequests from './screens/administrador/AdminServiceRequests';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('administrador');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('dashboards');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [serviceRequestTab, setServiceRequestTab] = useState<string | undefined>(undefined);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setActiveSection('dashboards');
  };

  const handleUserTypeChange = (userType: string) => {
    setCurrentUser(userType);
    setActiveSection('dashboards');
  };

  const handleProfileSettings = () => {
    setActiveSection('profile-settings');
  };

  const handleOpenAIAssistant = () => {
    setIsAIAssistantOpen(true);
  };

  const handleCloseAIAssistant = () => {
    setIsAIAssistantOpen(false);
  };

  const handleSectionChange = (section: string, params?: any) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false); // Fecha o sidebar mobile quando navega
    
    // Se for para solicitar serviços, definir qual aba abrir
    if (section === 'solicitar-servicos' && params?.tab) {
      setServiceRequestTab(params.tab);
    } else {
      setServiceRequestTab(undefined);
    }
  };

  const renderContent = () => {
    if (activeSection === 'perfis-usuario') {
      return <UserProfilesScreen />;
    }
    if (activeSection === 'fotos-servicos') {
      return (
        <div className="p-6">
          <PhotoUploadSection onBack={() => handleSectionChange('dashboards')} />
        </div>
      );
    }
    if (activeSection === 'comunicacao') {
      return <CommunicationScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    }
    if (activeSection === 'clientes') {
      // Mock das permissões - em produção viriam do backend/contexto global
      const mockManagerPermissions = {
        canEditClients: true,
        canToggleClientStatus: true
      };
      return <ClientsScreen 
        onBack={() => handleSectionChange('dashboards')} 
        userType={currentUser === 'administrador' ? 'Administrador' : 'Gestor'}
        managerPermissions={mockManagerPermissions}
      />;
    }
    if (activeSection === 'avaliacoes') {
      // Cliente vê suas avaliações
      if (currentUser === 'cliente') {
        return <ClientRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
      }
      // Admin vê dashboard de avaliações
      return <AdminRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
    }
    if (activeSection === 'solicitar-servicos') {
      return <ServiceRequestScreen onBack={() => handleSectionChange('dashboards')} initialTab={serviceRequestTab} />;
    }
    if (activeSection === 'profile-settings') {
      return <ProfileSettingsScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    }
    if (activeSection === 'notificacoes') {
      return <NotificationsScreen onBack={() => handleSectionChange('dashboards')} />;
    }
    if (activeSection === 'gerenciar-usuarios') {
      return <UserManagementScreen onBack={() => handleSectionChange('dashboards')} />;
    }
    if (activeSection === 'gerenciar-equipes') {
      return <TeamManagementScreen onBack={() => setActiveSection('dashboards')} />;
    }
    if (activeSection === 'relatorios-equipes') {
      if (currentUser === 'administrador') {
        return <AdminPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      }
      if (currentUser === 'gestor') {
        return <ManagerPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      }
      return <TeamReportsScreen onBack={() => setActiveSection('dashboards')} />;
    }
    if (activeSection === 'catalogo-servicos') {
      return <ServiceCatalogScreen onBack={() => setActiveSection('dashboards')} />;
    }
    if (activeSection === 'controle-ponto') {
      if (currentUser === 'administrador') {
        return <AdminTimeClockScreen onBack={() => setActiveSection('dashboards')} />;
      }
      if (currentUser === 'gestor') {
        return <ManagerEmployeeControlScreen onBack={() => setActiveSection('dashboards')} />;
      }
    }
    if (activeSection === 'meu-ponto') {
      return <CollaboratorTimeClockScreen onBack={() => setActiveSection('dashboards')} />;
    }
    if (activeSection === 'minha-agenda') {
      return <ManagerPersonalScheduleScreen onBack={() => setActiveSection('dashboards')} />;
}
    if (activeSection === 'gerenciar-solicitacoes') {
      if (currentUser === 'administrador') {
        return <AdminServiceRequests />;
      }
      if (currentUser === 'gestor') {
        return <ManagerServiceRequests />;
      }
    }
    if (activeSection === 'documentos-cliente') {
      return <ClientDocumentsScreen onBack={() => setActiveSection('dashboards')} />;
    }
    if (activeSection === 'documentos') {
      return <DocumentsScreen onBack={() => setActiveSection('dashboards')} />;
    }
    // Nova: Minha Agenda Pessoal (Admin e Gestor)
    if (activeSection === 'agenda-pessoal') {
      if (currentUser === 'administrador') {
        return <MyPersonalScheduleScreen userRole="admin" />;
      }
      if (currentUser === 'gestor') {
        return <MyPersonalScheduleScreen userRole="manager" />;
      }
    }
    // Nova: Agenda de Serviços (Admin e Gestor)
    if (activeSection === 'agenda-servicos') {
      if (currentUser === 'administrador') {
        return <ServiceScheduleScreen userRole="admin" />;
      }
      if (currentUser === 'gestor') {
        return <ServiceScheduleScreen userRole="manager" managerArea="norte" />;
      }
    }
    // Nova: Serviços Agendados (Cliente)
    if (activeSection === 'servicos-agendados') {
      return <ClientScheduledServicesScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // Nova: Dashboard de Gastos (Cliente)
    if (activeSection === 'dashboard-gastos') {
      return <ClientExpensesDashboardScreen onBack={() => setActiveSection('dashboards')} />;
    }
    // Nova: Fotos do Serviço (Cliente)
    if (activeSection.startsWith('service-photos-')) {
      const serviceId = activeSection.replace('service-photos-', '');
      return (
        <ClientServicePhotosScreen 
          serviceId={serviceId}
          onBack={() => setActiveSection('dashboards')}
        />
      );
    }
    // Nova: Alocações de Colaboradores (Gestor)
    if (activeSection === 'alocacoes-colaboradores') {
      return <CollaboratorAllocationsScreen onBack={() => setActiveSection('dashboards')} />;
    }
    // Nova: Revisão de Fotos (Gestor)
    if (activeSection === 'revisao-fotos') {
      return <ManagerPhotoReviewScreen onBack={() => setActiveSection('dashboards')} />;
    }
    // Nova: Histórico de Fotos (Admin)
    if (activeSection === 'historico-fotos') {
      return <AdminPhotoHistoryScreen onBack={() => setActiveSection('dashboards')} />;
    }
    // Nova: Ordens de Serviço (Admin)
    if (activeSection === 'ordens-servico') {
      return <ServiceOrdersScreen onBack={() => setActiveSection('dashboards')} />;
    }
    return <DashboardScreen userType={currentUser} onSectionChange={handleSectionChange} />;
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation só aparece no dashboard */}
      {activeSection === 'dashboards' && (
        <Navigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          userType={currentUser}
          onProfileSettings={handleProfileSettings}
          onSectionChange={handleSectionChange}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          userType={currentUser}
          onOpenAIAssistant={handleOpenAIAssistant}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg shadow-lg"
          style={{ backgroundColor: '#6400A4', color: 'white' }}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <main className="flex-1 overflow-hidden md:ml-16">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Barra de tipos de usuário para demo */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex flex-col gap-3">
          {/* Tipos de Usuário */}
          <div className="flex justify-center items-center space-x-4">
            <span className="text-sm text-black"></span>
            {['administrador', 'gestor', 'colaborador', 'cliente'].map((type) => (
              <button
                key={type}
                onClick={() => handleUserTypeChange(type)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentUser === type
                    ? 'text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
                style={currentUser === type ? { backgroundColor: '#6400A4' } : {}}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Atalhos de Desenvolvimento */}
          <div className="flex justify-center items-center space-x-4 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">🔧 Dev Tools:</span>
            <button
              onClick={() => {
                setCurrentUser('administrador');
                setActiveSection('gerenciar-usuarios');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-purple-50"
              style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
            >
              👥 Gerenciar Usuários
            </button>
            <button
              onClick={() => {
                setCurrentUser('gestor');
                setActiveSection('comunicacao');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-purple-50"
              style={{ borderColor: '#6400A4', color: '#6400A4' }}
            >
              💬 Comunicação
            </button>

            <button
              onClick={() => {
                setCurrentUser('cliente');
                setActiveSection('dashboard-gastos');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-blue-50"
              style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
            >
              💰 Dashboard de Gastos
            </button>
            <button
              onClick={() => {
                setCurrentUser('gestor');
                setActiveSection('relatorios-equipes');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-purple-50"
              style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
            >
              📊 Relatórios (Gestor)
            </button>
            <button
              onClick={() => {
                setCurrentUser('administrador');
                setActiveSection('relatorios-equipes');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-purple-50"
              style={{ borderColor: '#6400A4', color: '#6400A4' }}
            >
              📈 Relatórios (Admin)
            </button>
          </div>
        </div>
      </div>
      
      {/* Assistente IA */}
      <AIAssistant 
        isOpen={isAIAssistantOpen}
        onClose={handleCloseAIAssistant}
        userType={currentUser}
      />
      
      {/* <Toaster /> */}
    </div>
  );
}