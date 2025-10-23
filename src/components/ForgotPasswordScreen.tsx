import { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import HiveLogo from './Logo/HiveLogo';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, informe seu e-mail');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, informe um e-mail válido');
      return;
    }

    setIsLoading(true);

    // Simular envio do e-mail (em produção, fazer chamada à API)
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #6400A4 0%, #8B20EE 100%)' }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <HiveLogo />
            </div>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#6400A4' }} />
              </div>
            </div>
            <CardTitle style={{ color: '#6400A4' }}>E-mail Enviado!</CardTitle>
            <CardDescription className="text-center mt-2">
              Enviamos um link de redefinição de senha para:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
              <p style={{ color: '#6400A4' }}>{email}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>Por favor, verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <p>O link é válido por 24 horas.</p>
            </div>

            <div className="bg-yellow-50 border-l-4 p-3 rounded" style={{ borderColor: '#FFFF20' }}>
              <p className="text-xs text-gray-700">
                <strong>Não recebeu o e-mail?</strong> Verifique sua caixa de spam ou tente novamente em alguns minutos.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
              >
                Reenviar E-mail
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={onBackToLogin}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #6400A4 0%, #8B20EE 100%)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <HiveLogo />
          </div>
          <CardTitle style={{ color: '#6400A4' }}>Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-center mt-2">
            Digite seu e-mail e enviaremos um link para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#8B20EE' }}>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Link de Redefinição
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBackToLogin}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border" style={{ borderColor: '#35BAE6' }}>
            <p className="text-xs text-gray-700">
              <strong>Dica de segurança:</strong> Nunca compartilhe o link de redefinição de senha com outras pessoas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
