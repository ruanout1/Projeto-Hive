import { useState, useEffect } from 'react';
import { User, Bell, Moon, Sun, HelpCircle, Shield, Camera, Mail, Lock, Smartphone, Clock, AlertCircle, CheckCircle, Settings, UserCog } from 'lucide-react';
import ScreenHeader from './ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';

interface ProfileSettingsScreenProps {
  userType: string;
  onBack?: () => void;
}

export default function ProfileSettingsScreen({ userType, onBack }: ProfileSettingsScreenProps) {
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
    name: 'João Silva',
    email: 'joao.silva@email.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [originalProfile, setOriginalProfile] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
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

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(50);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Permissões de Gestor (apenas para admin)
  const [managerPermissions, setManagerPermissions] = useState({
    canEditClients: true,
    canToggleClientStatus: true
  });
  const [originalManagerPermissions, setOriginalManagerPermissions] = useState({
    canEditClients: true,
    canToggleClientStatus: true
  });

  // Timer para o token
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      toast.error('Token expirado! Solicite um novo token.');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

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
      /[A-Z]/.test(password), // maiúscula
      /[a-z]/.test(password), // minúscula
      /[!@#$%^&*(),.?":{}|<>]/.test(password), // especial
      password.length >= 8 && password.length <= 15 // tamanho
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

  const handleSaveProfile = () => {
    // Resetar erros
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Validar apenas se há alteração de senha
    if (profile.currentPassword || profile.newPassword || profile.confirmPassword) {
      let hasErrors = false;

      if (!profile.currentPassword) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: 'Digite sua senha atual' }));
        hasErrors = true;
      }

      if (!profile.newPassword) {
        setPasswordErrors(prev => ({ 
          ...prev, 
          newPassword: 'Digite sua nova senha' 
        }));
        hasErrors = true;
      } else if (!validatePassword(profile.newPassword)) {
        setPasswordErrors(prev => ({ 
          ...prev, 
          newPassword: 'Sua nova senha deve conter ao menos: uma letra maiúscula, uma letra minúscula, um caractere especial e 8 a 15 dígitos ao todo.' 
        }));
        hasErrors = true;
      }

      if (!profile.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Digite a mesma senha novamente' }));
        hasErrors = true;
      } else if (profile.newPassword !== profile.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }));
        hasErrors = true;
      }

      if (hasErrors) return;

      // Se chegou até aqui, abrir modal do token
      setIsTokenModalOpen(true);
      setTimeLeft(50);
      setIsTimerActive(true);
      setToken('');
    } else {
      // Salvar apenas dados do perfil (sem senha)
      toast.success('Perfil atualizado com sucesso!');
    }
  };

  const handleResendToken = () => {
    setTimeLeft(50);
    setIsTimerActive(true);
    setToken('');
    toast.info('Novo token enviado para seu e-mail!');
  };

  const handleConfirmToken = () => {
    if (token.length !== 6) {
      toast.error('Digite o token completo (6 dígitos)');
      return;
    }

    // Simular validação do token
    if (token === '123456') {
      setIsTokenModalOpen(false);
      setIsTimerActive(false);
      // Limpar campos de senha
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      toast.success('Senha alterada com sucesso!');
    } else {
      toast.error('Token inválido. Tente novamente.');
    }
  };

  const handleSaveNotifications = () => {
    // Implementar lógica de salvar notificações
    console.log('Salvando notificações:', notifications);
    setOriginalNotifications({...notifications});
    toast.success('Preferências de notificação salvas com sucesso!');
  };

  const hasProfileChanges = () => {
    return profile.name !== originalProfile.name || 
           profile.email !== originalProfile.email ||
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
    console.log('Salvando permissões de gestor:', managerPermissions);
    setOriginalManagerPermissions({...managerPermissions});
    toast.success('Permissões de gestor salvas com sucesso!');
  };

  const hasManagerPermissionChanges = () => {
    return JSON.stringify(managerPermissions) !== JSON.stringify(originalManagerPermissions);
  };

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
                    <User className="h-8 w-8" />
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
                                backgroundColor: getPasswordStrength(profile.newPassword).score === 4 ? '#FFFF20' : 
                                                getPasswordStrength(profile.newPassword).score === 3 ? '#8B20EE' :
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

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <Bell className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Notificações Push</Label>
                    <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Notificações por E-mail
                    </Label>
                    <p className="text-sm text-gray-600">Receba atualizações por e-mail</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Notificações SMS
                    </Label>
                    <p className="text-sm text-gray-600">Receba alertas importantes via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotifications}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                  disabled={!hasNotificationChanges()}
                >
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userType === 'Administrador' && (
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black flex items-center">
                  <UserCog className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                  Permissões de Gestor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-purple-200 bg-purple-50">
                  <Settings className="h-4 w-4" />
                  <AlertDescription style={{ color: '#6400A4' }}>
                    Configure as permissões que os gestores terão ao acessar a tela de clientes. 
                    Apenas administradores podem excluir clientes, independentemente dessas configurações.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Permitir Edição de Clientes</Label>
                      <p className="text-sm text-gray-600">
                        Gestor pode editar informações dos clientes de sua área
                      </p>
                    </div>
                    <Switch
                      checked={managerPermissions.canEditClients}
                      onCheckedChange={(checked) => handleManagerPermissionChange('canEditClients', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Permitir Ativar/Desativar Clientes</Label>
                      <p className="text-sm text-gray-600">
                        Gestor pode ativar ou desativar clientes de sua área
                      </p>
                    </div>
                    <Switch
                      checked={managerPermissions.canToggleClientStatus}
                      onCheckedChange={(checked) => handleManagerPermissionChange('canToggleClientStatus', checked)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveManagerPermissions}
                    style={{ backgroundColor: '#6400A4', color: 'white' }}
                    disabled={!hasManagerPermissionChanges()}
                  >
                    Salvar Permissões
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <Moon className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Preferências de Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base flex items-center">
                    {isDarkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    Modo {isDarkMode ? 'Escuro' : 'Claro'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {isDarkMode ? 'Interface com cores escuras' : 'Interface com cores claras'}
                  </p>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-black">Pré-visualização</h3>
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                  <h4 className="mb-2">Exemplo de Interface</h4>
                  <p className="text-sm mb-4">
                    Este é um exemplo de como a interface ficará com o tema selecionado.
                  </p>
                  <Button 
                    size="sm"
                    style={{ backgroundColor: '#6400A4', color: 'white' }}
                  >
                    Botão de Exemplo
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Aplicar Tema
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Ajuda e Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <HelpCircle className="h-6 w-6" />
                  <span>FAQ - Perguntas Frequentes</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Bell className="h-6 w-6" />
                  <span>Chat de Suporte</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Mail className="h-6 w-6" />
                  <span>Abrir Ticket</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Smartphone className="h-6 w-6" />
                  <span>Contato Direto</span>
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-black">Informações de Contato</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>E-mail: suporte@hive.com</p>
                  <p>Telefone: (11) 1234-5678</p>
                  <p>Horário de atendimento: Segunda a Sexta, 8h às 18h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <Shield className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Políticas e Termos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                >
                  <div className="text-left">
                    <div className="font-medium">Política de Privacidade</div>
                    <div className="text-sm text-gray-600">Como tratamos seus dados pessoais</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                >
                  <div className="text-left">
                    <div className="font-medium">Termos de Uso</div>
                    <div className="text-sm text-gray-600">Condições para uso da plataforma</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                >
                  <div className="text-left">
                    <div className="font-medium">LGPD - Lei Geral de Proteção de Dados</div>
                    <div className="text-sm text-gray-600">Seus direitos sobre dados pessoais</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                >
                  <div className="text-left">
                    <div className="font-medium">Política de Cookies</div>
                    <div className="text-sm text-gray-600">Como utilizamos cookies</div>
                  </div>
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-black">Versão Atual</h3>
                <p className="text-sm text-gray-600">
                  Última atualização: 23 de setembro de 2024
                </p>
                <p className="text-sm text-gray-600">
                  Versão 2.1.0 dos Termos de Uso e Política de Privacidade
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Verificação de Token */}
      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-black flex items-center justify-center">
              <Mail className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Verificação de Segurança
            </DialogTitle>
            <DialogDescription>
              Para continuar com a alteração da senha, digite o token de 6 dígitos enviado para seu e-mail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-blue-700">
                Enviamos um token de confirmação para o seu e-mail contendo 6 dígitos, 
                informe ele abaixo para continuar com essa alteração:
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={token}
                  onChange={(value) => setToken(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">
                    O token expira em {timeLeft} segundos
                  </span>
                </div>

                {/* Dica para desenvolvimento */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 Para demonstração, use o token: <strong>123456</strong>
                </div>

                <Button
                  variant="link"
                  onClick={handleResendToken}
                  className="text-sm"
                  disabled={timeLeft > 0}
                >
                  Não recebeu o Token ❔ Click aqui para reenviar
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsTokenModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmToken}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="flex-1"
                disabled={token.length !== 6}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}