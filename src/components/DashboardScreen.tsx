import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard'; 
import CollaboratorDashboard from './CollaboratorDashboard';
import ClientDashboard from './ClientDashboard';
import React from 'react';


interface DashboardScreenProps {
  userType: string;
}

export default function DashboardScreen({ userType }: DashboardScreenProps) {
  switch (userType) {
    case 'administrador':
      return <AdminDashboard />;
    case 'gestor':
      return <ManagerDashboard />;
    case 'colaborador':
      return <CollaboratorDashboard />;
    case 'cliente':
      return <ClientDashboard />;
    default:
      return <AdminDashboard />;
  }
}