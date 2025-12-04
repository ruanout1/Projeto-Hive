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