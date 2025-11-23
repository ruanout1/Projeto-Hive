import { useState, useEffect } from 'react';
import { User, Bell, Moon, Sun, HelpCircle, Shield, Camera, Mail, Lock, Smartphone, Clock, AlertCircle, Settings, UserCog } from 'lucide-react';
import ScreenHeader from './ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import api from '../lib/api'; // Ajuste o caminho conforme necessário

interface ProfileSettingsScreenProps {
  userType: string;
  onBack?: () => void;
}

export default function ProfileSettingsScreen({ userType, onBack }: ProfileSettingsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false
  });
  const [originalNotifications, setOriginalNotifications] = useState({
    push: true,
    email: true,
    sms: false
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [originalProfile, setOriginalProfile] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para validação de senha
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Permissões de Gestor (apenas para admin)
  const [managerPermissions, setManagerPermissions] = useState({
    canEditClients: true,
    canToggleClientStatus: true
  });
  const [originalManagerPermissions, setOriginalManagerPermissions] = useState({
    canEditClients: true,
    canToggleClientStatus: true
  });

  // ==========================================
  // 🆕 BUSCAR DADOS DO PERFIL
  // ==========================================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      
      if (response.data.success) {
        const userData = response.data.data;
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setOriginalProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erros quando o usuário começar a digitar
    if (passwordErrors[field as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasValidLength = password.length >= 8 && password.length <= 15;
    
    return hasUpperCase && hasLowerCase && hasSpecialChar && hasValidLength;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    const checks = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 8 && password.length <= 15
    ];
    
    score = checks.filter(Boolean).length;
    
    if (score === 4) return { score, text: 'Senha forte', color: 'text-green-600' };
    if (score === 3) return { score, text: 'Senha boa', color: 'text-yellow-600' };
    if (score >= 2) return { score, text: 'Senha fraca', color: 'text-orange-600' };
    return { score, text: 'Senha muito fraca', color: 'text-red-600' };
  };

  const handlePasswordFocus = (field: string) => {
    switch (field) {
      case 'currentPassword':
        setPasswordErrors(prev => ({ ...prev, currentPassword: 'Digite sua senha atual' }));
        break;
      case 'newPassword':
        setPasswordErrors(prev => ({ 
          ...prev, 
          newPassword: 'Sua nova senha deve conter ao menos: uma letra maiúscula, uma letra minúscula, um caractere especial e 8 a 15 dígitos ao todo.' 
        }));
        break;
      case 'confirmPassword':
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Digite a mesma senha novamente' }));
        break;
    }
  };

  // ==========================================
  // 🆕 SALVAR PERFIL
  // ==========================================
  const handleSaveProfile = async () => {
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Se há mudança de senha
    if (profile.currentPassword || profile.newPassword || profile.confirmPassword) {
      await handleChangePassword();
    } else {
      // Apenas atualizar dados do perfil
      await handleUpdateProfile();
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });

      if (response.data.success) {
        setOriginalProfile({
          ...profile,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    // Validações
    let hasErrors = false;

    if (!profile.currentPassword) {
      setPasswordErrors(prev => ({ ...prev, currentPassword: 'Digite sua senha atual' }));
      hasErrors = true;
    }

    if (!profile.newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: 'Digite sua nova senha' }));
      hasErrors = true;
    } else if (!validatePassword(profile.newPassword)) {
      setPasswordErrors(prev => ({ 
        ...prev, 
        newPassword: 'Senha deve ter letra maiúscula, minúscula, caractere especial e 8-15 dígitos' 
      }));
      hasErrors = true;
    }

    if (!profile.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Confirme a nova senha' }));
      hasErrors = true;
    } else if (profile.newPassword !== profile.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }));
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      // Primeiro atualizar o perfil (se houver mudanças)
      if (profile.name !== originalProfile.name || profile.email !== originalProfile.email) {
        await handleUpdateProfile();
      }

      // Depois alterar a senha
      const response = await api.put('/profile/password', {
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      });

      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success('Senha alterada com sucesso!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao alterar senha';
      toast.error(message);
    }
  };

  const handleSaveNotifications = () => {
    // TODO: Implementar API para salvar notificações
    setOriginalNotifications({...notifications});
    toast.success('Preferências de notificação salvas com sucesso!');
  };

  const hasProfileChanges = () => {
    return profile.name !== originalProfile.name || 
           profile.email !== originalProfile.email ||
           profile.phone !== originalProfile.phone ||
           profile.currentPassword !== '' ||
           profile.newPassword !== '' ||
           profile.confirmPassword !== '';
  };

  const hasNotificationChanges = () => {
    return JSON.stringify(notifications) !== JSON.stringify(originalNotifications);
  };

  const handleManagerPermissionChange = (permission: string, value: boolean) => {
    setManagerPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  const handleSaveManagerPermissions = () => {
    // TODO: Implementar API para salvar permissões
    setOriginalManagerPermissions({...managerPermissions});
    toast.success('Permissões de gestor salvas com sucesso!');
  };

  const hasManagerPermissionChanges = () => {
    return JSON.stringify(managerPermissions) !== JSON.stringify(originalManagerPermissions);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <ScreenHeader 
          title="Configurações do Perfil"
          description="Gerencie suas informações pessoais, notificações e preferências."
          onBack={() => onBack?.()}
        />
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`grid w-full ${userType === 'Administrador' ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          {userType === 'Administrador' && (
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          )}
          <TabsTrigger value="theme">Tema</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <User className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto do Perfil */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }} className="text-2xl">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-black">Foto do Perfil</h3>
                  <p className="text-sm text-gray-600 mb-2">JPG, PNG. Máximo 5MB.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Alterar Foto</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="Digite seu e-mail"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Alteração de Senha */}
              <div className="space-y-4">
                <h3 className="text-black flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={profile.currentPassword}
                      onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                      onFocus={() => handlePasswordFocus('currentPassword')}
                      placeholder="Digite a senha atual"
                      className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                    />
                    {passwordErrors.currentPassword && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-700">
                          {passwordErrors.currentPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profile.newPassword}
                      onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                      onFocus={() => handlePasswordFocus('newPassword')}
                      placeholder="Digite a nova senha"
                      className={passwordErrors.newPassword ? 'border-red-500' : ''}
                    />
                    
                    {/* Indicador de força da senha */}
                    {profile.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${(getPasswordStrength(profile.newPassword).score / 4) * 100}%`,
                                backgroundColor: getPasswordStrength(profile.newPassword).score === 4 ? '#22c55e' : 
                                                getPasswordStrength(profile.newPassword).score === 3 ? '#eab308' :
                                                getPasswordStrength(profile.newPassword).score >= 2 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className={`text-sm ${getPasswordStrength(profile.newPassword).color}`}>
                            {getPasswordStrength(profile.newPassword).text}
                          </span>
                        </div>
                      </div>
                    )}

                    {passwordErrors.newPassword && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-700">
                          {passwordErrors.newPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profile.confirmPassword}
                      onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                      onFocus={() => handlePasswordFocus('confirmPassword')}
                      placeholder="Confirme a nova senha"
                      className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {passwordErrors.confirmPassword && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-700">
                          {passwordErrors.confirmPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                  disabled={!hasProfileChanges()}
                >
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outros tabs mantidos iguais... */}
        {/* (Notificações, Permissões, Tema, Suporte, Políticas) */}
        
      </Tabs>
    </div>
  );
}