export interface Address {
  street: string;
  number: string;
  complement: string;
  zipCode: string; // No frontend usamos camelCase
  neighborhood: string;
  city: string;
  state: string;
}

export interface ClientLocation {
  id: string;
  name: string;
  email?: string;        // NOVO - Email da filial
  phone?: string;        // NOVO - Telefone da filial
  cnpj?: string;         // NOVO - CNPJ da filial
  address: Address;
  area: string;
  isPrimary: boolean;
}

export interface Client {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: Address;
  area: string;
  locations?: ClientLocation[];
  status: 'active' | 'inactive';
  servicesActive: number;
  servicesCompleted: number;
  lastService: string;
  rating: number;
  totalValue: string;
  notes?: string;
  createdAt?: string;
}

// Opcional: você pode criar um tipo para o formulário de unidade
export interface ClientLocationFormData {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  isPrimary: boolean;
}