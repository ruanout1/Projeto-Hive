import { useState } from 'react';
import LoginScreen from './screens/public/LoginScreen';
import Navigation from './screens/cliente/Navigation';
import Sidebar from './screens/public/Sidebar';
import DashboardScreen from './screens/administrador/AdminDashboardarrumar';
import UserProfilesScreen from './screens/public/UserProfilesScreen';
import PhotoUploadSection from './screens/colaborador/CollaboratorPhotoUploadSection';
import CommunicationScreen from './screens/chat/CommunicationScreen';

// --- TELAS JÁ MIGRADAS ---
import ManagerClientsScreen from './screens/gestor/ManagerClientsScreen';
import AdminClientsScreen from './screens/administrador/clients/AdminClientsScreen';

// --- TELA NOVA: CATÁLOGO DE SERVIÇOS ---
// Verifique se este caminho bate com onde você salvou o arquivo AdminServiceCatalogScreen.tsx
import ServiceCatalogScreen from './screens/administrador/catalog/AdminServiceCatalogScreen'; 

import ClientRatingsScreen from './screens/cliente/ClientRatingsScreen';
import ServiceRequestScreen from './screens/cliente/ServiceRequestScreen';
import ProfileSettingsScreen from './screens/public/NewPasswordScreen';
import NotificationsScreen from './screens/public/NotificationsScreen';
import UserManagementScreen from './screens/administrador/AdminUserManagementScreen';
import TeamManagementScreen from './screens/administrador/AdminTeamManagementScreen';
import TeamReportsScreen from './screens/public/TeamReportsScreen';
import AdminRatingsScreen from './screens/administrador/AdminRatingsScreen';
import AdminTimeClockScreen from './screens/administrador/AdminEmployeeControlScreen';
import ManagerEmployeeControlScreen from './screens/gestor/ManagerEmployeeControlScreen';
import CollaboratorTimeClockScreen from './screens/colaborador/CollaboratorTimeClockScreen';
import ManagerPersonalScheduleScreen from './screens/gestor/MinhaAgenda/ManagerPersonalScheduleScreen';
import ManagerServiceRequests from './screens/gestor/ManagerServiceRequests';
import ClientDocumentsScreen from './screens/cliente/ClientDocumentsScreen';
import DocumentsScreen from './screens/administrador/AdminDocumentsScreen';
import MyPersonalScheduleScreen from './screens/administrador/mySchedule/MyPersonalScheduleScreen';
import ServiceScheduleScreen from './screens/gestor/ManagerServiceScheduleScreen';
import ClientScheduledServicesScreen from './screens/cliente/ClientScheduledServicesScreen';
import ClientExpensesDashboardScreen from './screens/cliente/ClientExpensesDashboardScreen';
import ManagerPerformanceReportsScreen from './screens/gestor/ManagerPerformanceReportsScreen';
import AdminPerformanceReportsScreen from './screens/administrador/AdminPerformanceReportsScreen';
import ClientServicePhotosScreen from './screens/cliente/ClientServicePhotosScreen';
import CollaboratorAllocationsScreen from './screens/gestor/Alocacoes/ManagerAllocationsScreen';
import ManagerPhotoReviewScreen from './screens/gestor/ManagerPhotoReviewScreen';
import AdminPhotoHistoryScreen from './screens/administrador/AdminPhotoHistoryScreen';
import ServiceOrdersScreen from './screens/administrador/AdminServiceOrdersScreen';
import AIAssistant from './screens/public/AIAssistant';
import AdminServiceRequests from './screens/administrador/AdminServiceRequests';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('administrador');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('dashboards');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [serviceRequestTab, setServiceRequestTab] = useState<string | undefined>(undefined);

  const handleLogin = () => { setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); setActiveTab('dashboard'); setActiveSection('dashboards'); };
  const handleUserTypeChange = (userType: string) => { setCurrentUser(userType); setActiveSection('dashboards'); };
  const handleProfileSettings = () => { setActiveSection('profile-settings'); };
  const handleOpenAIAssistant = () => { setIsAIAssistantOpen(true); };
  const handleCloseAIAssistant = () => { setIsAIAssistantOpen(false); };
  const handleSectionChange = (section: string, params?: any) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
    if (section === 'solicitar-servicos' && params?.tab) { setServiceRequestTab(params.tab); } else { setServiceRequestTab(undefined); }
  };

  const renderContent = () => {
    // ... (Outros ifs iguais) ...
    if (activeSection === 'perfis-usuario') return <UserProfilesScreen />;
    if (activeSection === 'fotos-servicos') return <div className="p-6"><PhotoUploadSection onBack={() => handleSectionChange('dashboards')} /></div>;
    if (activeSection === 'comunicacao') return <CommunicationScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;

    // Clientes (Já migrado)
    if (activeSection === 'clientes') {
      if (currentUser === 'administrador') return <AdminClientsScreen onBack={() => handleSectionChange('dashboards')} />;
      return <ManagerClientsScreen onBack={() => handleSectionChange('dashboards')} />;
    }

    // Avaliações
    if (activeSection === 'avaliacoes') {
      if (currentUser === 'cliente') return <ClientRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
      return <AdminRatingsScreen onBack={() => handleSectionChange('dashboards')} />;
    }

    // Catálogo de Serviços (NOVO - MIGRAÇÃO)
    if (activeSection === 'catalogo-servicos') {
      // Agora chamamos a tela nova que criamos
      return <ServiceCatalogScreen onBack={() => setActiveSection('dashboards')} />;
    }

    // ... (Mantenha todos os outros ifs iguais ao seu arquivo original) ...
    // Vou resumir aqui para não ficar gigante, mas você deve MANTER o resto do seu código original
    if (activeSection === 'solicitar-servicos') return <ServiceRequestScreen onBack={() => handleSectionChange('dashboards')} initialTab={serviceRequestTab} />;
    if (activeSection === 'profile-settings') return <ProfileSettingsScreen userType={currentUser} onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'notificacoes') return <NotificationsScreen onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'gerenciar-usuarios') return <UserManagementScreen onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'gerenciar-equipes') return <TeamManagementScreen onBack={() => setActiveSection('dashboards')} />;
    
    if (activeSection === 'relatorios-equipes') {
      if (currentUser === 'administrador') return <AdminPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      if (currentUser === 'gestor') return <ManagerPerformanceReportsScreen onBack={() => setActiveSection('dashboards')} />;
      return <TeamReportsScreen onBack={() => setActiveSection('dashboards')} />;
    }

    if (activeSection === 'controle-ponto') {
      if (currentUser === 'administrador') return <AdminTimeClockScreen onBack={() => setActiveSection('dashboards')} />;
      if (currentUser === 'gestor') return <ManagerEmployeeControlScreen onBack={() => setActiveSection('dashboards')} />;
    }
    
    if (activeSection === 'meu-ponto') return <CollaboratorTimeClockScreen onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'minha-agenda') return <ManagerPersonalScheduleScreen onBack={() => setActiveSection('dashboards')} />;
    
    if (activeSection === 'gerenciar-solicitacoes') {
      if (currentUser === 'administrador') return <AdminServiceRequests />;
      if (currentUser === 'gestor') return <ManagerServiceRequests />;
    }

    if (activeSection === 'documentos-cliente') return <ClientDocumentsScreen onBack={() => handleSectionChange('dashboards')} />;
    if (activeSection === 'documentos') return <DocumentsScreen onBack={() => handleSectionChange('dashboards')} />;
    
    if (activeSection === 'agenda-pessoal') {
      if (currentUser === 'administrador') return <MyPersonalScheduleScreen userRole="admin" />;
      if (currentUser === 'gestor') return <MyPersonalScheduleScreen userRole="manager" />;
    }
    
    if (activeSection === 'agenda-servicos') {
      if (currentUser === 'administrador') return <ServiceScheduleScreen userRole="admin" />;
      if (currentUser === 'gestor') return <ServiceScheduleScreen userRole="manager" managerArea="norte" />;
    }

    if (activeSection === 'servicos-agendados') return <ClientScheduledServicesScreen onBack={() => setActiveSection('dashboards')} />;
    if (activeSection === 'dashboard-gastos') return <ClientExpensesDashboardScreen onBack={() => setActiveSection('dashboards')} />;
    
    if (activeSection.startsWith('service-photos-')) {
      const serviceId = activeSection.replace('service-photos-', '');
      return <ClientServicePhotosScreen serviceId={serviceId} onBack={() => setActiveSection('dashboards')} />;
    }
    
    if (activeSection === 'alocacoes-colaboradores') return <CollaboratorAllocationsScreen onBack={() => setActiveSection('dashboards')} />;
    if (activeSection === 'revisao-fotos') return <ManagerPhotoReviewScreen onBack={() => setActiveSection('dashboards')} />;
    if (activeSection === 'historico-fotos') return <AdminPhotoHistoryScreen onBack={() => setActiveSection('dashboards')} />;
    if (activeSection === 'ordens-servico') return <ServiceOrdersScreen onBack={() => setActiveSection('dashboards')} />;
    
    return <DashboardScreen userType={currentUser} onSectionChange={handleSectionChange} />;
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

      {/* Barra de tipos de usuário (Mantida igual) */}
      <div className="bg-white border-t border-gray-200 p-4">
         {/* ... (Seu código de barra de debug igualzinho ao original) ... */}
         {/* Vou omitir aqui para não estourar o limite, mas mantenha o que você já tem */}
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
          {/* Botões de atalho de dev... */}
         </div>
      </div>
      
      <AIAssistant isOpen={isAIAssistantOpen} onClose={handleCloseAIAssistant} userType={currentUser} />
    </div>
  );
}