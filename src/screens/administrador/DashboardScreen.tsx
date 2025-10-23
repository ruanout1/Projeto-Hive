import AdminDashboard from './../administrador/AdminDashboard';
import ManagerDashboard from '../../components/ManagerDashboard'; 
import CollaboratorDashboard from './../colaborador/CollaboratorDashboard';
import ClientDashboard from './../cliente/ClientDashboard';

interface DashboardScreenProps {
  userType: string;
  onSectionChange?: (section: string, params?: any) => void;
}

export default function DashboardScreen({ userType, onSectionChange }: DashboardScreenProps) {
  switch (userType) {
    case 'administrador':
      return <AdminDashboard onSectionChange={onSectionChange} />;
    case 'gestor':
      return <ManagerDashboard onSectionChange={onSectionChange} />;
    case 'colaborador':
      return <CollaboratorDashboard onSectionChange={onSectionChange} />;
    case 'cliente':
      return <ClientDashboard onSectionChange={onSectionChange} />;
    default:
      return <AdminDashboard onSectionChange={onSectionChange} />;
  }
}