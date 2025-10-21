import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import HiveLogo from './HiveLogo';
import ForgotPasswordScreen from './ForgotPasswordScreen';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo do Sistema */}
        <div className="flex justify-center mb-8">
          <div className="scale-75">
            <HiveLogo />
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="hive-screen-title mb-2">
              Entrar
            </h1>
            <p className="text-black text-sm">
              Acesse sua conta no Sistema Hive.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-black">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
              <button
                type="button"
                className="text-sm mt-2"
                style={{ color: '#6400A4' }}
              >
                Entrar com Matrícula
              </button>
            </div>

            <div>
              <Label htmlFor="password" className="text-black">
                Senha
              </Label>
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
            >
              Entrar
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm hover:underline"
                style={{ color: '#6400A4' }}
                onClick={() => setShowForgotPassword(true)}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}