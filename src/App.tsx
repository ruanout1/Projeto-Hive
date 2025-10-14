import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import UserProfilesScreen from './components/UserProfilesScreen';
import PhotoUploadSection from './components/PhotoUploadSection';
import CommunicationScreen from './components/CommunicationScreen';
import ClientsScreen from './components/ClientsScreen';
import ClientRatingsScreen from './components/ClientRatingsScreen';
import ServiceRequestScreen from './components/ServiceRequestScreen';
import RequestsViewScreen from './components/RequestsViewScreen';
import ProfileSettingsScreen from './components/ProfileSettingsScreen';
import NotificationsScreen from './components/NotificationsScreen';
import UserManagementScreen from './components/UserManagementScreen';
import TeamManagementScreen from './components/TeamManagementScreen';
import TeamReportsScreen from './components/TeamReportsScreen';
import ServiceCatalogScreen from './components/ServiceCatalogScreen';
import AdminRatingsScreen from './components/AdminRatingsScreen';
import EquipmentScreen from './components/EquipmentScreen';
import AdminTimeClockScreen from './components/AdminTimeClockScreen';
import ManagerTimeClockScreen from './components/ManagerTimeClockScreen';
import CollaboratorTimeClockScreen from './components/CollaboratorTimeClockScreen';
import MyScheduleScreen from './components/MyScheduleScreen';
import AIAssistant from './components/AIAssistant';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('administrador');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('dashboards');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

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

  const renderContent = () => {
    if (activeSection === 'perfis-usuario') {
      return <UserProfilesScreen />;
    }
    if (activeSection === 'fotos-servicos') {
      return (
        <div className="p-6">
          <PhotoUploadSection />
        </div>
      );
    }
    if (activeSection === 'comunicacao') {
      return <CommunicationScreen userType={currentUser} />;
    }
    if (activeSection === 'clientes') {
      return <ClientsScreen />;
    }
    if (activeSection === 'avaliacoes') {
      // Cliente vê suas avaliações
      if (currentUser === 'cliente') {
        return <ClientRatingsScreen />;
      }
      // Admin vê dashboard de avaliações
      return <AdminRatingsScreen />;
    }
    if (activeSection === 'solicitar-servicos') {
      return <ServiceRequestScreen />;
    }
    if (activeSection === 'profile-settings') {
      return <ProfileSettingsScreen userType={currentUser} />;
    }
    if (activeSection === 'notificacoes') {
      return <NotificationsScreen />;
    }
    if (activeSection === 'gerenciar-usuarios') {
      return <UserManagementScreen />;
    }
    if (activeSection === 'gerenciar-equipes') {
      return <TeamManagementScreen />;
    }
    if (activeSection === 'relatorios-equipes') {
      return <TeamReportsScreen />;
    }
    if (activeSection === 'catalogo-servicos') {
      return <ServiceCatalogScreen />;
    }
    if (activeSection === 'equipamentos') {
      return <EquipmentScreen />;
    }
    if (activeSection === 'controle-ponto') {
      if (currentUser === 'administrador') {
        return <AdminTimeClockScreen />;
      }
      if (currentUser === 'gestor') {
        return <ManagerTimeClockScreen />;
      }
    }
    if (activeSection === 'meu-ponto') {
      return <CollaboratorTimeClockScreen />;
    }
    if (activeSection === 'minha-agenda') {
      return <MyScheduleScreen />;
    }
    return <DashboardScreen userType={currentUser} />;
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
          onSectionChange={setActiveSection}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userType={currentUser}
          onOpenAIAssistant={handleOpenAIAssistant}
        />
        
        <main className="flex-1 overflow-hidden">
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
            <span className="text-sm text-black">Demonstração - Tipos de Usuário:</span>
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
                setCurrentUser('administrador');
                setActiveSection('controle-ponto');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-yellow-50"
              style={{ borderColor: '#FFFF20', color: '#6400A4', backgroundColor: 'rgba(255, 255, 32, 0.1)' }}
            >
              ⏰ Exportar Pontos
            </button>
            <button
              onClick={() => {
                setCurrentUser('colaborador');
                setActiveSection('minha-agenda');
              }}
              className="px-3 py-1 text-xs rounded-md transition-colors border-2 hover:bg-blue-50"
              style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
            >
              📅 Minha Agenda
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
      
      <Toaster />
    </div>
  );
}