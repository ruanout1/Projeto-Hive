// Interface para o Usuário (Gestor ou Colaborador)
export interface User {
  id: string;
  name: string; // Vem como 'full_name' do backend
  email: string;
  role: 'gestor' | 'colaborador';
}

// Interface para a Equipe (como ela vem da API)
export interface Team {
  id: string;
  name: string;
  manager: User | null; // A API envia um objeto User (ou null)
  members: User[]; // A API envia um array de User
  status: 'active' | 'inactive'; // A API envia 'status'
  createdAt: string; // Vem como 'created_at' do backend
}

// Interface para o Formulário de Equipe (o que o frontend envia)
export interface TeamFormData {
  name: string;
  managerId: string;
  memberIds: string[];
}

// ==========================================================
//  ADICIONADO: Interface que faltava para 'useTeamMembers.ts'
// ==========================================================
export interface TeamMember {
  id: string; // ID da *relação* (team_member_id)
  userId: string;
  teamId: string;
  role: 'gestor' | 'colaborador' | 'member'; // 'member' como padrão
  isActive: boolean;
  // ... (adicione outros campos se necessário, como 'name' ou 'email')
}

