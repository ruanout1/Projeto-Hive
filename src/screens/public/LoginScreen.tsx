import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';

import HiveLogo from '../../components/Logo/HiveLogo';
import ForgotPasswordScreen from './ForgotPasswordScreen';

type LoginResponseUser = {
  id: number | string;
  name: string;
  email: string;
  role: string; // "client" | "admin" | ...
  avatar?: string | null;
  client_id?: number | string | null;
};

export default function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data as { token: string; user: LoginResponseUser };

      // ✅ padroniza storage: App.tsx lê "token" e "user"
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // compat: se algum lugar antigo usa authToken, mantém também
      localStorage.setItem('authToken', token);

      if (rememberMe) localStorage.setItem('rememberUser', email);
      else localStorage.removeItem('rememberUser');

      toast.success(`Bem-vindo de volta, ${user.name}!`);

      // ✅ chama App passando o role real
      onLogin(user.role);

    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Falha no login';

      toast.error('Falha no Login', {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberUser');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  if (showForgotPassword) {
    return (
      <ForgotPasswordScreen
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="scale-75">
            <HiveLogo />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="hive-screen-title mb-2">Entrar</h1>
            <p className="text-black text-sm">Acesse sua conta no Sistema Hive.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-black">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-black">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm text-black">
                Lembrar-me
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: '#6400A4' }}
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm hover:underline"
                style={{ color: '#6400A4' }}
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm mt-2"
              style={{ color: '#6400A4' }}
              onClick={() => toast.info("Login por matrícula ainda não implementado.")}
            >
              Entrar com Matrícula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
