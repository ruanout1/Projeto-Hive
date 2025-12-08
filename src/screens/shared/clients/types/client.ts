// src\screens\shared\clients\types\client.ts - ATUALIZADO

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
  email?: string;
  phone?: string;
  cnpj?: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  isPrimary: boolean;
}

export interface Client {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
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

// Tipos para formulários
export interface ClientFormData {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  notes: string;
  status: 'active' | 'inactive';
}

export interface LocationFormData {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  isPrimary: boolean;
}