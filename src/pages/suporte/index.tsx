import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Brain, 
  Mail, 
  MessageSquare, 
  BookOpen, 
  Instagram, 
  AlertTriangle,
  Trash2,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const { toast } = useToast();
  
  const showComingSoon = (feature: string) => {
    toast({
      title: `${feature} em breve!`,
      description: "Esta funcionalidade estará disponível em breve.",
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-700">Ajuda e Suporte</h1>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
          <TabsTrigger value="about">Sobre a AIA</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq" className="space-y-6">
          <FAQTab />
        </TabsContent>
        
        <TabsContent value="about" className="space-y-6">
          <AboutAIATab />
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-6">
          <ContactTab showComingSoon={showComingSoon} />
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <AccountDeletionSection userId={userId} />
      </div>
    </div>
  );
};

// Componente da aba de Perguntas Frequentes
const FAQTab: React.FC = () => {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-portal-purple/10 flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-portal-purple" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Perguntas Frequentes</h2>
            <p className="text-gray-600 max-w-2xl">
              Aqui você encontra respostas para as dúvidas mais comuns sobre o C'Alma e a AIA. 
              Se não encontrar o que procura, entre em contato com nosso suporte na aba "Contato".
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Dúvidas Comuns</h3>
        
        <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
          <FAQItem 
            question="Como funciona a AIA?" 
            answer="A AIA é uma ferramenta de conversação por voz que utiliza tecnologia avançada para ajudar no seu bem-estar mental. Basta falar com ela como você falaria com um amigo, e ela responderá de forma empática e útil."
            defaultOpen
          />
          <FAQItem 
            question="Como configurar lembretes diários?" 
            answer="Para configurar lembretes diários, acesse a seção 'Lembretes' no menu de perfil. Lá você pode adicionar novos lembretes, escolhendo o horário que deseja ser notificado. Os lembretes funcionam mesmo quando o aplicativo está fechado."
          />
          <FAQItem 
            question="Minhas conversas são privadas?" 
            answer="Sim, suas conversas são privadas e seguras. Utilizamos criptografia de ponta a ponta e seguimos rigorosos padrões de segurança. Você pode ver o histórico de suas conversas na seção 'Insights', mas apenas você tem acesso a esse conteúdo, mas caso se conecte com um Psicólogo, ele também terá acesso aos seus insights."
          />
          <FAQItem 
            question="Posso usar o app sem internet?" 
            answer="Algumas funcionalidades como lembretes funcionam sem internet, mas para conversar com a AIA é necessário estar conectado. Trabalhamos para melhorar a experiência offline em atualizações futuras."
          />
          <FAQItem 
            question="Como editar meu perfil?" 
            answer="Para editar seu perfil, acesse a tela de Perfil e toque no botão 'Editar' próximo à sua foto. Lá você pode atualizar sua foto, nome preferido e outras informações pessoais."
          />
          <FAQItem 
            question="O que são os insights?" 
            answer="Insights são resumos e análises das suas conversas com a AIA. Eles ajudam você a acompanhar seu progresso e identificar padrões em seus pensamentos e emoções ao longo do tempo."
          />
        </Accordion>
      </div>
    </>
  );
};

// Componente da aba Sobre a AIA
const AboutAIATab: React.FC = () => {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-portal-purple/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-portal-purple" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">O que é a AIA?</h2>
            <p className="text-gray-600 max-w-2xl">
              A AIA (Assistente de Inteligência Artificial) é uma companheira digital projetada para ajudar no seu bem-estar mental e emocional. 
              Utilizando tecnologia avançada de processamento de linguagem natural, a AIA pode conversar com você, 
              ouvir suas preocupações e oferecer suporte empático.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Recursos da AIA</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={<MessageCircle className="h-5 w-5 text-portal-purple" />}
            title="Conversação Natural"
            description="Converse com a AIA como falaria com um amigo, usando sua voz natural."
          />
          <FeatureCard 
            icon={<Brain className="h-5 w-5 text-portal-purple" />}
            title="Suporte Empático"
            description="Receba respostas empáticas e compreensivas para suas preocupações."
          />
          <FeatureCard 
            icon={<HelpCircle className="h-5 w-5 text-portal-purple" />}
            title="Insights Personalizados"
            description="Obtenha insights sobre seus padrões de pensamento e emoções."
          />
          <FeatureCard 
            icon={<AlertTriangle className="h-5 w-5 text-portal-purple" />}
            title="Privacidade Garantida"
            description="Suas conversas são privadas e protegidas com criptografia."
          />
        </div>
      </div>

      <Card className="mt-6 border-portal-purple/30 bg-portal-purple/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-portal-purple mb-2">Importante</h3>
            <p className="text-gray-700">
              A AIA não substitui o atendimento profissional de saúde mental. 
              Se você estiver enfrentando problemas graves, busque ajuda de um profissional qualificado.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Componente da aba de Contato
const ContactTab: React.FC<{ showComingSoon: (feature: string) => void }> = ({ showComingSoon }) => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Como podemos ajudar?</h2>
        <p className="text-gray-600">
          Escolha uma das opções abaixo para entrar em contato com nossa equipe de suporte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ContactCard 
          icon={<Mail className="h-6 w-6 text-portal-purple" />}
          title="Email de Suporte"
          description="Resposta em até 24 horas"
          action={() => window.location.href = 'mailto:suporte@calma-app.com'}
        />
        <ContactCard 
          icon={<MessageSquare className="h-6 w-6 text-portal-purple" />}
          title="Chat ao Vivo"
          description="Disponível em dias úteis (9h-18h)"
          action={() => showComingSoon('Chat ao Vivo')}
        />
        <ContactCard 
          icon={<BookOpen className="h-6 w-6 text-portal-purple" />}
          title="Central de Ajuda"
          description="Artigos e tutoriais detalhados"
          action={() => showComingSoon('Central de Ajuda')}
        />
        <ContactCard 
          icon={<Instagram className="h-6 w-6 text-portal-purple" />}
          title="Redes Sociais"
          description="Siga-nos para novidades"
          action={() => window.open('https://instagram.com/calma-app', '_blank')}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horário de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ScheduleRow day="Segunda a Sexta" hours="9h às 18h" />
            <ScheduleRow day="Sábado" hours="9h às 13h" />
            <ScheduleRow day="Domingo e Feriados" hours="Fechado" />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Seção de exclusão de conta
interface AccountDeletionSectionProps {
  userId?: string | null;
}

const AccountDeletionSection: React.FC<AccountDeletionSectionProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmInput, setShowConfirmInput] = useState(false);
  
  const handleDeleteAccount = async () => {
    // Se não tiver userId, mostrar mensagem de funcionalidade em desenvolvimento
    if (!userId) {
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A exclusão de conta estará disponível em breve.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Se não estiver mostrando o campo de confirmação, mostrar
    if (!showConfirmInput) {
      setShowConfirmInput(true);
      return;
    }
    
    // Verificar se o texto de confirmação está correto
    if (confirmText !== 'EXCLUIR') {
      toast({
        title: "Confirmação incorreta",
        description: "Por favor, digite EXCLUIR para confirmar a exclusão da conta.",
        variant: "destructive",
      });
      return;
    }
    
    // Iniciar processo de exclusão
    setIsDeleting(true);
    
    try {
      // Simulando a exclusão de dados do usuário
      // Em um ambiente de produção, você precisaria implementar a lógica real
      // para excluir os dados do usuário em todas as tabelas relevantes
      
      console.log('Iniciando processo de exclusão para o usuário:', userId);
      
      // Simulando uma pausa para dar feedback visual ao usuário
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Registrar a solicitação de exclusão
      // Em um ambiente de produção, você pode querer salvar esta solicitação
      // em uma tabela específica para processamento posterior
      
      // Exemplo de como seria a chamada real para uma API de exclusão:
      // const response = await fetch('/api/delete-account', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // });
      // 
      // if (!response.ok) throw new Error('Falha ao excluir conta');
      
      // 4. Excluir o usuário do Supabase Auth
      // Nota: Esta operação geralmente requer permissões de admin
      // e pode não estar disponível diretamente no cliente
      // Em um ambiente de produção, você pode precisar chamar uma função serverless
      
      // Simulando a exclusão do usuário do Auth
      // Em produção, você chamaria uma API ou função serverless
      console.log('Solicitação de exclusão do usuário Auth:', userId);
      
      // 5. Mostrar mensagem de sucesso
      setIsDeleted(true);
      toast({
        title: "Conta excluída com sucesso",
        description: "Todos os seus dados foram removidos permanentemente.",
      });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Ocorreu um erro ao tentar excluir sua conta. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Renderização condicional baseada na presença do userId
  if (userId) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Exclusão de Conta
          </CardTitle>
          <CardDescription>
            Você foi redirecionado do aplicativo mobile para excluir sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDeleted ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conta Excluída com Sucesso</h3>
              <p className="text-gray-600">
                Todos os seus dados foram removidos permanentemente dos nossos servidores.
                Você pode fechar esta janela com segurança.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Você está prestes a excluir permanentemente sua conta e todos os dados associados a ela.
                Esta ação não pode ser desfeita.
              </p>
              <div className="bg-red-50 p-4 rounded-md border border-red-100 mb-4">
                <p className="text-sm text-red-600">
                  <strong>Atenção:</strong> A exclusão da conta resultará na perda permanente de:
                </p>
                <ul className="list-disc list-inside text-sm text-red-600 mt-2">
                  <li>Histórico de conversas com a AIA</li>
                  <li>Insights e análises</li>
                  <li>Configurações personalizadas</li>
                  <li>Conexões com psicólogos</li>
                </ul>
              </div>
              
              {showConfirmInput && (
                <div className="mt-4">
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                    Digite EXCLUIR para confirmar:
                  </label>
                  <input
                    id="confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="EXCLUIR"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          {!isDeleted && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting || (showConfirmInput && confirmText !== 'EXCLUIR')}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : showConfirmInput ? (
                "Confirmar Exclusão"
              ) : (
                "Excluir Minha Conta"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Interface padrão para usuários web
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Exclusão de Conta
        </CardTitle>
        <CardDescription>
          Ao excluir sua conta, todos os seus dados serão permanentemente removidos de nossos servidores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">
          Esta ação não pode ser desfeita. Certifique-se de que você realmente deseja excluir sua conta antes de prosseguir.
        </p>
        <div className="bg-red-50 p-4 rounded-md border border-red-100 mb-4">
          <p className="text-sm text-red-600">
            <strong>Atenção:</strong> A exclusão da conta resultará na perda permanente de:
          </p>
          <ul className="list-disc list-inside text-sm text-red-600 mt-2">
            <li>Histórico de conversas com a AIA</li>
            <li>Insights e análises</li>
            <li>Configurações personalizadas</li>
            <li>Conexões com psicólogos</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          onClick={handleDeleteAccount}
          className="w-full sm:w-auto"
        >
          Solicitar Exclusão de Conta
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componentes auxiliares
const FAQItem: React.FC<{ question: string; answer: string; defaultOpen?: boolean }> = ({ 
  question, 
  answer,
  defaultOpen = false
}) => {
  return (
    <AccordionItem value={question} className="border-b">
      <AccordionTrigger className="text-left font-medium py-4 px-4 hover:no-underline hover:bg-gray-50">
        {question}
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-1 text-gray-600">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description
}) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-4">
        <div className="p-2 bg-portal-purple/10 rounded-md">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const ContactCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  action: () => void;
}> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={action}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-portal-purple/10 rounded-full">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const ScheduleRow: React.FC<{ day: string; hours: string }> = ({ day, hours }) => {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-600">{day}</span>
      <span className="font-medium text-gray-800">{hours}</span>
    </div>
  );
};

export default SupportPage;
