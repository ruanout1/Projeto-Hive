import { useState, useEffect } from 'react';

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
import ManagerServiceRequests from './screens/shared/serviceRequests/ManagerServiceRequests';
// ✅ TELA UNIFICADA DE FOTOS (SUBSTITUI AS ANTIGAS)
import PhotoReviewScreen from './screens/shared/photoReview/PhotoReviewScreen'; 

// --- IMPORTS DAS TELAS DO ADMINISTRADOR ---
import DashboardScreen from './screens/administrador/AdminDashboardScreen';
import UserManagementScreen from './screens/administrador/AdminUserManagementScreen';
import TeamManagementScreen from './screens/administrador/AdminTeamManagementScreen';
import AdminRatingsScreen from './screens/administrador/AdminRatingsScreen';
import AdminTimeClockScreen from './screens/administrador/AdminEmployeeControlScreen';
import ServiceCatalogScreen from './screens/administrador/catalog/AdminServiceCatalogScreen';
import AdminPerformanceReportsScreen from './screens/administrador/AdminPerformanceReportsScreen';
// ❌ REMOVIDO: AdminPhotoHistoryScreen (Arquivo deletado na main)
import ServiceOrdersScreen from './screens/administrador/AdminServiceOrdersScreen';
import DocumentsScreen from './screens/administrador/AdminDocumentsScreen';

// --- IMPORTS DAS TELAS DO GESTOR ---
import ManagerDashboard from './screens/gestor/dashboard/ManagerDashboard';
import ManagerEmployeeControlScreen from './screens/gestor/ManagerEmployeeControlScreen';
import ServiceScheduleScreen from './screens/gestor/ManagerServiceScheduleScreen';
import ManagerPerformanceReportsScreen from './screens/gestor/ManagerPerformanceReportsScreen';
import CollaboratorAllocationsScreen from './screens/gestor/Alocacoes/ManagerAllocationsScreen';
// ❌ REMOVIDO: ManagerPhotoReviewScreen (Arquivo deletado na main)

// --- IMPORTS DAS TELAS DO COLABORADOR ---
import PhotoUploadSection from './screens/colaborador/CollaboratorPhotoUploadSection';
import CollaboratorTimeClockScreen from './screens/colaborador/CollaboratorTimeClockScreen';

// --- IMPORTS DAS TELAS DO CLIENTE ---
import Navigation from './screens/cliente/Navigation';
import ClientDashboard from './screens/cliente/ClientDashboard';
import ClientRatingsScreen from './screens/cliente/ClientRatingsScreen';
import ServiceRequestScreen from './screens/cliente/ServiceRequestScreen';
import ClientDocumentsScreen from './screens/cliente/ClientDocumentsScreen';
import ClientScheduledServicesScreen from './screens/cliente/ClientScheduledServicesScreen';
import ClientExpensesDashboardScreen from './screens/cliente/ClientExpensesDashboardScreen';
import ClientServicePhotosScreen from './screens/cliente/ClientServicePhotosScreen';

// --- IMPORTS DAS TELAS DE COMUNICAÇÃO ---
import CommunicationScreen from './screens/chat/CommunicationScreen';

type AppUserType = 'administrador' | 'gestor' | 'colaborador' | 'cliente';

function mapRoleToUserType(roleFromApi: string): AppUserType | null {
  const role = (roleFromApi || '').toLowerCase().trim();

  if (role === 'client' || role === 'cliente') return 'cliente';
  if (role === 'admin' || role === 'administrador') return 'administrador';
  if (role === 'manager' || role === 'gestor') return 'gestor';
  if (role === 'collaborator' || role === 'colaborador') return 'colaborador';

  return null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUserType>('cliente');

  useEffect(() => {
    const remember = localStorage.getItem('rememberUser');
    localStorage.clear(); 
    if (remember) {
      localStorage.setItem('rememberUser', remember);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('dashboards');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [serviceRequestTab, setServiceRequestTab] = useState<string | undefined>(undefined);

  // Simulando dados do usuário logado
  const getCurrentManager = () => {
    if (currentUser === 'administrador') {
      return { id: '1', name: 'Administrador Sistema', areas: ['norte', 'sul', 'leste', 'oeste', 'centro'] };
    }
    if (currentUser === 'gestor') {
      return { id: '2', name: 'Ana Paula Rodrigues', areas: ['norte', 'centro'] };
    }
    return { id: '0', name: 'Usuário', areas: [] };
  };

  const handleLogin = (roleFromApi: string) => {
    const mapped = mapRoleToUserType(roleFromApi);

    if (mapped) {
      setCurrentUser(mapped);
      setIsLoggedIn(true);
      setActiveSection('dashboards');
      setActiveTab('dashboard');
    } else {
      console.error('Tipo de usuário desconhecido:', roleFromApi);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setActiveSection('dashboards');
    setCurrentUser('cliente'); 
  };

  const handleUserTypeChange = (userType: string) => {
    setCurrentUser(userType as AppUserType);
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
    // 1. TELAS GERAIS/PÚBLICAS
    if (activeSection === 'perfis-usuario') return <UserProfilesScreen />;
    if (activeSection === 'fotos-servicos') return <div className="p-6"><PhotoUploadSection onBack={() => handleSectionChange('dashboards')} /></div>;
    if (activeSection === 'comunicacao') return <CommunicationScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'profile-settings') return <ProfileSettingsScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'notificacoes') return <NotificationsScreen onBack={() => handleSectionChange('dashboards')} />;

    // 2. DASHBOARDS
    if (activeSection === 'dashboards') {
        if (currentUser === 'administrador') return <DashboardScreen onSectionChange={handleSectionChange} />;
        if (currentUser === 'gestor') return <ManagerDashboard onSectionChange={handleSectionChange} />;
        if (currentUser === 'colaborador') return <TeamReportsScreen onBack={() => {}} />; 
        if (currentUser === 'cliente') return <ClientDashboard />;
    }

    // 3. TELAS COMPARTILHADAS

    // --- CLIENTES ---
    if (activeSection === 'clientes') {
      const role = currentUser === 'administrador' ? 'admin' : 'manager';
      return <ClientsScreen userRole={role} onBack={() => handleSectionChange('dashboards')} />;
    }

    // --- AGENDA PESSOAL ---
    if (activeSection === 'agenda-pessoal' || activeSection === 'minha-agenda') {
      const role = currentUser === 'administrador' ? 'admin' : 'manager';
      return <MyPersonalScheduleScreen userRole={role} onBack={() => handleSectionChange('dashboards')} />;
    }

    // --- SOLICITAÇÕES DE SERVIÇO ---
    if (activeSection === 'gerenciar-solicitacoes') {
      if (currentUser === 'administrador' || currentUser === 'gestor') {
        const manager = getCurrentManager();
        return <ManagerServiceRequests manager={manager} userType={currentUser as 'administrador' | 'gestor'} />;
      }
    }

    // ✅ FOTOS (HISTÓRICO E REVISÃO) - USA A NOVA TELA UNIFICADA
    if (activeSection === 'revisao-fotos' || activeSection === 'historico-fotos') {
       if (currentUser === 'administrador') {
          return <PhotoReviewScreen userRole="admin" onBack={() => handleSectionChange('dashboards')} />;
       }
       if (currentUser === 'gestor') {
          return <PhotoReviewScreen userRole="manager" onBack={() => handleSectionChange('dashboards')} />;
       }
    }

    // 4. TELAS ESPECÍFICAS DO ADMINISTRADOR
    if (currentUser === 'administrador') {
      if (activeSection === 'catalogo-servicos') return <ServiceCatalogScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'gerenciar-usuarios') return <UserManagementScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'gerenciar-equipes') return <TeamManagementScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'avaliacoes') return <AdminRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'controle-ponto') return <AdminTimeClockScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'relatorios-equipes') return <AdminPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'documentos') return <DocumentsScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'agenda-servicos') return <ServiceScheduleScreen userRole="admin" />;
      // Removido AdminPhotoHistoryScreen pois agora usa o bloco unificado acima
      if (activeSection === 'ordens-servico') return <ServiceOrdersScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // 5. TELAS ESPECÍFICAS DO GESTOR
    if (currentUser === 'gestor') {
      if (activeSection === 'controle-ponto') return <ManagerEmployeeControlScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'relatorios-equipes') return <ManagerPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      if (activeSection === 'agenda-servicos') return <ServiceScheduleScreen userRole="manager" managerArea="norte" />;
      if (activeSection === 'alocacoes-colaboradores') return <CollaboratorAllocationsScreen onBack={() => setActiveSection('dashboards')} />;
      // Removido ManagerPhotoReviewScreen pois agora usa o bloco unificado acima
    }

    // 6. TELAS ESPECÍFICAS DO COLABORADOR
    if (currentUser === 'colaborador') {
      if (activeSection === 'fotos-servicos') return <div className="p-6"><PhotoUploadSection onBack={() => handleSectionChange('dashboards')} /></div>;
      if (activeSection === 'meu-ponto') return <CollaboratorTimeClockScreen onBack={() => handleSectionChange('dashboards')} />;
      if (activeSection === 'relatorios-equipes') return <TeamReportsScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // 7. TELAS ESPECÍFICAS DO CLIENTE
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

    return <div className="p-10 text-center">Selecione uma opção no menu</div>;
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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

      <div className="bg-white border-t border-gray-200 p-4">
         <div className="flex flex-col gap-3">
          <div className="flex justify-center items-center space-x-4">
            {['administrador', 'gestor', 'colaborador', 'cliente'].map((type) => (
              <button
                key={type}
                onClick={() => handleUserTypeChange(type as string)}
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
            <button onClick={() => { setCurrentUser('administrador'); setActiveSection('gerenciar-usuarios'); }} className="px-3 py-1 text-xs rounded-md border-2 hover:bg-purple-50" style={{ borderColor: '#8B20EE', color: '#8B20EE' }}>👥 Usuários</button>
            <button onClick={() => { setCurrentUser('gestor'); setActiveSection('comunicacao'); }} className="px-3 py-1 text-xs rounded-md border-2 hover:bg-purple-50" style={{ borderColor: '#6400A4', color: '#6400A4' }}>💬 Chat</button>
            <button onClick={() => { setCurrentUser('cliente'); setActiveSection('dashboard-gastos'); }} className="px-3 py-1 text-xs rounded-md border-2 hover:bg-blue-50" style={{ borderColor: '#35BAE6', color: '#35BAE6' }}>💰 Gastos</button>
            <button onClick={() => { setCurrentUser('gestor'); setActiveSection('gerenciar-solicitacoes'); }} className="px-3 py-1 text-xs rounded-md border-2 hover:bg-green-50" style={{ borderColor: '#10B981', color: '#10B981' }}>📋 Solicitações</button>
          </div>
         </div>
      </div>
      
      <AIAssistant isOpen={isAIAssistantOpen} onClose={handleCloseAIAssistant} userType={currentUser} />
    </div>
  );
}