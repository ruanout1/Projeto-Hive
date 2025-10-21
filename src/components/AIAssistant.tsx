import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userType: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAssistant({ isOpen, onClose, userType }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sugestões específicas por perfil
  const getSuggestions = () => {
    switch (userType) {
      case 'administrador':
        return [
          'Consultar métricas de desempenho das equipes',
          'Gerar sugestões de otimização de custos',
          'Status de documentos pendentes ou vencidos',
          'Gerar relatório resumido'
        ];
      case 'gestor':
        return [
          'Resumo das tarefas concluídas hoje',
          'Alertas de colaboradores inativos',
          'Insights sobre produtividade da equipe',
          'Criar nova tarefa rapidamente'
        ];
      case 'colaborador':
        return [
          'Próximo horário/escala de serviço',
          'Confirmar ponto ou jornada ativa',
          'Solicitar troca de turno',
          'Lembretes de tarefas pendentes'
        ];
      case 'cliente':
        return [
          'Status de serviços contratados',
          'Segunda via de boleto ou fatura',
          'Enviar feedback sobre serviço',
          'Resumo mensal dos serviços'
        ];
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();

  // Scroll automático para última mensagem
  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const scrollToBottom = () => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        };
        
        // Scroll imediato
        scrollToBottom();
        
        // Scroll com delay para garantir que o conteúdo foi renderizado
        setTimeout(scrollToBottom, 50);
        setTimeout(scrollToBottom, 150);
      }
    }
  }, [messages, isLoading, isOpen]);

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Olá! Eu sou o assistente IA do Hive. Como posso ajudar você hoje como ${userType}?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userType, messages.length]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, userType);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (question: string, userType: string): string => {
    const lowerQuestion = question.toLowerCase();

    // Respostas específicas por perfil
    if (userType === 'administrador') {
      if (lowerQuestion.includes('métricas') || lowerQuestion.includes('desempenho')) {
        return 'Com base nos dados atuais, suas equipes estão performando bem: Equipe Norte com 94% de eficiência, Equipe Sul com 89%, e Equipe Centro com 91%. A produtividade geral aumentou 12% este mês.';
      }
      if (lowerQuestion.includes('custos') || lowerQuestion.includes('otimização')) {
        return 'Identifiquei oportunidades de economia: 1) Reorganizar rotas pode reduzir combustível em 15%, 2) Otimizar horários das equipes pode economizar R$ 8.500/mês, 3) Renegociar contratos de fornecedores pode gerar economia de 8%.';
      }
      if (lowerQuestion.includes('documentos') || lowerQuestion.includes('pendentes')) {
        return 'Você tem 3 documentos vencidos: Contrato Empresa XYZ (vencido há 5 dias), Licença ambiental (vence em 2 dias), e Certificação ISO (vence em 15 dias). Precisa de ajuda para priorizá-los?';
      }
    }

    if (userType === 'gestor') {
      if (lowerQuestion.includes('tarefas') || lowerQuestion.includes('concluídas')) {
        return 'Hoje sua equipe concluiu 23 tarefas: 8 serviços de manutenção, 12 instalações, e 3 reparos urgentes. Taxa de conclusão: 96%. Parabéns pela excelente gestão!';
      }
      if (lowerQuestion.includes('colaboradores') || lowerQuestion.includes('inativos')) {
        return 'Atenção: João Silva não registra atividade há 2 horas, e Maria Santos está com produtividade 30% abaixo da média esta semana. Recomendo uma verificação.';
      }
      if (lowerQuestion.includes('produtividade') || lowerQuestion.includes('insights')) {
        return 'Sua equipe está 15% acima da meta mensal! Pontos fortes: agilidade nas instalações (+22%) e qualidade dos reparos (98% aprovação). Área de melhoria: tempo de deslocamento pode ser otimizado.';
      }
    }

    if (userType === 'colaborador') {
      if (lowerQuestion.includes('horário') || lowerQuestion.includes('escala')) {
        return 'Seu próximo serviço está agendado para amanhã às 14:00 no endereço Rua das Flores, 123 - Bairro Centro. Tipo: Instalação de equipamentos. Tempo estimado: 2h30min.';
      }
      if (lowerQuestion.includes('ponto') || lowerQuestion.includes('jornada')) {
        return 'Seu ponto foi registrado com sucesso! Jornada atual: 6h45min trabalhadas hoje. Você está dentro do esperado e pode fazer sua pausa de 15 minutos quando desejar.';
      }
      if (lowerQuestion.includes('troca') || lowerQuestion.includes('turno')) {
        return 'Solicitação de troca registrada! Enviei sua solicitação para o gestor Pedro Santos. Você receberá uma resposta em até 24 horas. Precisa trocar algum dia específico?';
      }
    }

    if (userType === 'cliente') {
      if (lowerQuestion.includes('status') || lowerQuestion.includes('serviços')) {
        return 'Seus serviços estão em andamento: Ordem #1847 (Instalação) - 80% concluída, previsão de finalização amanhã. Ordem #1852 (Manutenção) - agendada para próxima terça-feira às 9h.';
      }
      if (lowerQuestion.includes('boleto') || lowerQuestion.includes('fatura')) {
        return 'Segunda via enviada para seu e-mail! Valor: R$ 450,00, vencimento: 15/10/2024. Você também pode acessar pelo portal do cliente ou pagar via PIX: chave disponível no documento.';
      }
      if (lowerQuestion.includes('feedback') || lowerQuestion.includes('avaliação')) {
        return 'Obrigado pelo seu feedback! Sua avaliação foi registrada e enviada para nossa equipe de qualidade. Caso tenha sugestões específicas, posso encaminhar diretamente para o gestor responsável.';
      }
    }

    // Resposta genérica
    return 'Entendi sua solicitação. Como posso ajudar você especificamente com isso? Posso fornecer mais detalhes ou executar alguma ação relacionada ao sistema Hive.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Máximo de ~5 linhas
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible overlay for click outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-2/5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" style={{ color: '#6400A4' }} />
            <h2 className="text-lg">Assistente IA</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col h-[calc(100%-80px)]">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            <div className="space-y-4">
              {/* Sugestões iniciais */}
              {messages.length <= 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Sugestões para você:</p>
                  {suggestions.map((suggestion, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Mensagens */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gray-200' 
                        : 'bg-purple-100'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-gray-600" />
                      ) : (
                        <Bot className="h-4 w-4" style={{ color: '#6400A4' }} />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      style={message.sender === 'user' ? { backgroundColor: '#6400A4' } : {}}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="h-4 w-4" style={{ color: '#6400A4' }} />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-2">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta ou comando..."
                className="flex-1 min-h-[40px] max-h-[120px] resize-none overflow-y-auto scrollbar-hide"
                disabled={isLoading}
                style={{ height: '40px' }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 mb-1"
                style={{ backgroundColor: '#6400A4', color: 'white' }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}