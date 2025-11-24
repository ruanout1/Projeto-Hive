import { useState, useRef, useEffect } from 'react';
import { Send, Search, Plus, Phone, Video, MoreVertical, Paperclip, FileText, AlertCircle, ArrowLeft, Bell, Edit, Info, X  } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface Contact {
  id: number;
  name: string;
  role: string;
  position?: string;
  status: 'online' | 'away' | 'offline';
  category: 'gestores';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  area?: string;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

interface Service {
  id: string;
  name: string;
  date: string;
  status: string;
  managerId: number;
  managerName: string;
}

interface ClientCommunicationScreenProps {
  onBack?: () => void;
}

export default function ClientCommunicationScreen({ onBack }: ClientCommunicationScreenProps) {
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionDescription, setActionDescription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Estados específicos para cliente
  const [showServiceSelection, setShowServiceSelection] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedReason, setSelectedReason] = useState('');

  // Mock de serviços do cliente
  const clientServices: Service[] = [
    { id: '1', name: 'Limpeza Comercial - Escritório Centro', date: '25/10/2025', status: 'Em Andamento', managerId: 1, managerName: 'Ana Paula Rodrigues' },
    { id: '2', name: 'Faxina Residencial - Apt 501', date: '22/10/2025', status: 'Concluído', managerId: 1, managerName: 'Ana Paula Rodrigues' },
    { id: '3', name: 'Jardinagem - Casa Jardins', date: '28/10/2025', status: 'Agendado', managerId: 2, managerName: 'Fernanda Lima' },
  ];

  // Motivos para cliente
  const clientReasons = [
    { id: 'atraso', label: 'Serviço em Atraso' },
    { id: 'nao-concluido', label: 'Serviço Não Foi Concluído' },
    { id: 'comportamento', label: 'Comportamento do Colaborador' },
    { id: 'cancelamento', label: 'Cancelamento de Serviço Agendado' },
    { id: 'outros', label: 'Outros' },
  ];

  // Mock data de contatos para Cliente (apenas gestores)
  const contacts: Contact[] = [
    { id: 1, name: 'Ana Paula Rodrigues', role: 'Gestor Responsável', category: 'gestores', status: 'online', lastMessage: 'Chegarei às 9h', lastMessageTime: '07:30', unreadCount: 0, area: 'Norte' },
    { id: 2, name: 'Fernanda Lima', role: 'Gestor Responsável', category: 'gestores', status: 'online', lastMessage: 'Serviço confirmado', lastMessageTime: 'Ontem', unreadCount: 0, area: 'Sul' }
  ];

  // ... (resto do código similar, mas com lógica específica para cliente)
}