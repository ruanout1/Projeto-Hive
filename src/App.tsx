import { useState } from 'react';

// --- IMPORTS DAS TELAS PÚBLICAS ---
import LoginScreen from './screens/public/LoginScreen';
import Sidebar from './screens/public/Sidebar';
import UserProfilesScreen from './screens/public/UserProfilesScreen';
import ProfileSettingsScreen from './screens/public/NewPasswordScreen';
import NotificationsScreen from './screens/public/NotificationsScreen';
import TeamReportsScreen from './screens/public/TeamReportsScreen';
import AIAssistant from './screens/public/AIAssistant';

// --- IMPORTS DAS TELAS COMPARTILHADAS (SHARED) ---
import ClientsScreen from './screens/shared/clients/ClientsScreen';
import MyPersonalScheduleScreen from './screens/shared/mySchedule/MyPersonalScheduleScreen';

// --- IMPORTS DAS TELAS DO ADMINISTRADOR ---
import DashboardScreen from './screens/administrador/AdminDashboardarrumar';
import UserManagementScreen from './screens/administrador/AdminUserManagementScreen';
import TeamManagementScreen from './screens/administrador/AdminTeamManagementScreen';
import AdminRatingsScreen from './screens/administrador/AdminRatingsScreen';
import AdminTimeClockScreen from './screens/administrador/AdminEmployeeControlScreen';
import ServiceCatalogScreen from './screens/administrador/catalog/AdminServiceCatalogScreen';
import AdminPerformanceReportsScreen from './screens/administrador/AdminPerformanceReportsScreen';
import AdminPhotoHistoryScreen from './screens/administrador/AdminPhotoHistoryScreen';
import ServiceOrdersScreen from './screens/administrador/AdminServiceOrdersScreen';
import AdminServiceRequests from './screens/administrador/AdminServiceRequests';

// --- IMPORTS DAS TELAS DO GESTOR ---
import ManagerEmployeeControlScreen from './screens/gestor/ManagerEmployeeControlScreen';
import ManagerServiceRequests from './screens/gestor/ManagerServiceRequests';
import ServiceScheduleScreen from './screens/gestor/ManagerServiceScheduleScreen';
import ManagerPerformanceReportsScreen from './screens/gestor/ManagerPerformanceReportsScreen';
import CollaboratorAllocationsScreen from './screens/gestor/Alocacoes/ManagerAllocationsScreen';
import ManagerPhotoReviewScreen from './screens/gestor/ManagerPhotoReviewScreen';

// --- IMPORTS DAS TELAS DO COLABORADOR ---
import PhotoUploadSection from './screens/colaborador/CollaboratorPhotoUploadSection';
import CollaboratorTimeClockScreen from './screens/colaborador/CollaboratorTimeClockScreen';

// --- IMPORTS DAS TELAS DO CLIENTE ---
import Navigation from './screens/cliente/Navigation';
import ClientRatingsScreen from './screens/cliente/ClientRatingsScreen';
import ServiceRequestScreen from './screens/cliente/ServiceRequestScreen';
import ClientDocumentsScreen from './screens/cliente/ClientDocumentsScreen';
import ClientScheduledServicesScreen from './screens/cliente/ClientScheduledServicesScreen';
import ClientExpensesDashboardScreen from './screens/cliente/ClientExpensesDashboardScreen';
import ClientServicePhotosScreen from './screens/cliente/ClientServicePhotosScreen';

// --- IMPORTS DAS TELAS DE COMUNICAÇÃO ---
import CommunicationScreen from './screens/chat/CommunicationScreen';
import DocumentsScreen from './screens/administrador/AdminDocumentsScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('administrador');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('dashboards');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [serviceRequestTab, setServiceRequestTab] = useState<string | undefined>(undefined);

  const handleLogin = () => { setIsLoggedIn(true); };
  const handleLogout = () => { 
    setIsLoggedIn(false); 
    setActiveTab('dashboard'); 
    setActiveSection('dashboards'); 
  };
  
  const handleUserTypeChange = (userType: string) => { 
    setCurrentUser(userType); 
    setActiveSection('dashboards'); 
  };
  
  const handleProfileSettings = () => { setActiveSection('profile-settings'); };
  const handleOpenAIAssistant = () => { setIsAIAssistantOpen(true); };
  const handleCloseAIAssistant = () => { setIsAIAssistantOpen(false); };
  
  const handleSectionChange = (section: string, params?: any) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
    if (section === 'solicitar-servicos' && params?.tab) { 
      setServiceRequestTab(params.tab); 
    } else { 
      setServiceRequestTab(undefined); 
    }
  };

  const renderContent = () => {
    // --- TELAS PÚBLICAS ---
    if (activeSection === 'perfis-usuario') return <UserProfilesScreen />;
    if (activeSection === 'comunicacao') return <CommunicationScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'profile-settings') return <ProfileSettingsScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'notificacoes') return <NotificationsScreen onBack={() => handleSectionChange('dashboards')} />;

    // --- TELAS COMPARTILHADAS (SHARED) ---
    
    // CLIENTES (Compartilhado entre Admin e Gestor)
    if (activeSection === 'clientes') {
      const role = currentUser === 'administrador' ? 'admin' : 'manager';
      return (
        <ClientsScreen 
          userRole={role} 
          onBack={() => handleSectionChange('dashboards')} 
        />
      );
    }

    // AGENDA PESSOAL (Compartilhado entre Admin e Gestor)
    if (activeSection === 'agenda-pessoal') {
      const role = currentUser === 'administrador' ? 'admin' : 'manager';
      return (
        <MyPersonalScheduleScreen 
          userRole={role} 
          onBack={() => handleSectionChange('dashboards')} 
        />
      );
    }

    // Mantendo compatibilidade com nome antigo se necessário
    if (activeSection === 'minha-agenda') {
      const role = currentUser === 'administrador' ? 'admin' : 'manager';
      return (
        <MyPersonalScheduleScreen 
          userRole={role} 
          onBack={() => handleSectionChange('dashboards')} 
        />
      );
    }

    // --- TELAS DO ADMINISTRADOR ---
    if (currentUser === 'administrador') {
      if (activeSection === 'catalogo-servicos') return <ServiceCatalogScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'gerenciar-usuarios') return <UserManagementScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'gerenciar-equipes') return <TeamManagementScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'avaliacoes') return <AdminRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'controle-ponto') return <AdminTimeClockScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'relatorios-equipes') return <AdminPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'gerenciar-solicitacoes') return <AdminServiceRequests />;
      if (activeSection === 'documentos') return <DocumentsScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'agenda-servicos') return <ServiceScheduleScreen userRole="admin" />;
      if (activeSection === 'historico-fotos') return <AdminPhotoHistoryScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'ordens-servico') return <ServiceOrdersScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // --- TELAS DO GESTOR ---
    if (currentUser === 'gestor') {
      if (activeSection === 'controle-ponto') return <ManagerEmployeeControlScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'gerenciar-solicitacoes') return <ManagerServiceRequests />;
      if (activeSection === 'relatorios-equipes') return <ManagerPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'agenda-servicos') return <ServiceScheduleScreen userRole="manager" managerArea="norte" />;
      if (activeSection === 'alocacoes-colaboradores') return <CollaboratorAllocationsScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'revisao-fotos') return <ManagerPhotoReviewScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // --- TELAS DO COLABORADOR ---
    if (currentUser === 'colaborador') {
      if (activeSection === 'fotos-servicos') return <div className="p-6"><PhotoUploadSection onBack={() => handleSectionChange('dashboards')} /></div>;
      if (activeSection === 'meu-ponto') return <CollaboratorTimeClockScreen onBack={() => handleSectionChange('dashboards')} />;
    }

    // --- TELAS DO CLIENTE ---
    if (currentUser === 'cliente') {
      if (activeSection === 'avaliacoes') return <ClientRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'solicitar-servicos') return <ServiceRequestScreen onBack={() => handleSectionChange('dashboards')} initialTab={serviceRequestTab} />;
      if (activeSection === 'documentos-cliente') return <ClientDocumentsScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'servicos-agendados') return <ClientScheduledServicesScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'dashboard-gastos') return <ClientExpensesDashboardScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection.startsWith('service-photos-')) {
        const serviceId = activeSection.replace('service-photos-', '');
        return <ClientServicePhotosScreen serviceId={serviceId} onBack={() => setActiveSection('dashboards')} />;
      }
    }

    // --- TELAS DE RELATÓRIOS (Públicas/Compartilhadas) ---
    if (activeSection === 'relatorios-equipes' && currentUser === 'colaborador') {
      return <TeamReportsScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // --- DASHBOARD PADRÃO ---
    return <DashboardScreen userType={currentUser} onSectionChange={handleSectionChange} />;
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation apenas no dashboard */}
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
        {/* Sidebar */}
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          userType={currentUser}
          onOpenAIAssistant={handleOpenAIAssistant}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        
        {/* Botão Mobile Menu */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg shadow-lg"
          style={{ backgroundColor: '#6400A4', color: 'white' }}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-hidden md:ml-16">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Footer com Dev Tools */}
      <div className="bg-white border-t border-gray-200 p-4">
         <div className="flex flex-col gap-3">
          <div className="flex justify-center items-center space-x-4">
            {['administrador', 'gestor', 'colaborador', 'cliente'].map((type) => (
              <button
                key={type}
                onClick={() => handleUserTypeChange(type)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentUser === type ? 'text-white' : 'text-black hover:bg-gray-100'
                }`}
                style={currentUser === type ? { backgroundColor: '#6400A4' } : {}}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex justify-center items-center space-x-4 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">🔧 Dev Tools:</span>
            <button 
              onClick={() => { setCurrentUser('administrador'); setActiveSection('gerenciar-usuarios'); }} 
              className="px-3 py-1 text-xs rounded-md border-2 hover:bg-purple-50" 
              style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
            >
              👥 Usuários
            </button>
            <button 
              onClick={() => { setCurrentUser('gestor'); setActiveSection('comunicacao'); }} 
              className="px-3 py-1 text-xs rounded-md border-2 hover:bg-purple-50" 
              style={{ borderColor: '#6400A4', color: '#6400A4' }}
            >
              💬 Chat
            </button>
            <button 
              onClick={() => { setCurrentUser('cliente'); setActiveSection('dashboard-gastos'); }} 
              className="px-3 py-1 text-xs rounded-md border-2 hover:bg-blue-50" 
              style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
            >
              💰 Gastos
            </button>
          </div>
         </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant isOpen={isAIAssistantOpen} onClose={handleCloseAIAssistant} userType={currentUser} />
    </div>
  );
}