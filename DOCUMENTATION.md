# 🌟 Portal C'Alma - Documentação Completa

> Portal Web para gestão de psicólogos, empresas e administração do ecossistema C'Alma

## 📋 Índice

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Pré-requisitos](#-pré-requisitos)
3. [Instalação e Configuração](#-instalação-e-configuração)
4. [Configuração do Ambiente](#-configuração-do-ambiente)
5. [Estrutura do Projeto](#-estrutura-do-projeto)
6. [Backend e Integrações](#-backend-e-integrações)
7. [Comandos Essenciais](#-comandos-essenciais)
8. [Build e Deploy](#-build-e-deploy)
9. [Troubleshooting](#-troubleshooting)
10. [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)

## 🎯 Visão Geral do Projeto

### O que é o Portal C'Alma?

O **Portal C'Alma** é uma aplicação web desenvolvida em React/TypeScript que complementa o aplicativo móvel C'Alma. Serve como centro de controle para:

- 👨‍⚕️ **Psicólogos**: Dashboard, gestão de pacientes, insights e relatórios
- 🏢 **Empresas**: Gestão de funcionários, licenças e compliance
- 👑 **Administradores**: Controle total do sistema, usuários e configurações
- 👤 **Usuários**: Perfis e configurações pessoais

### Funcionalidades Principais

- 📊 **Dashboards Interativos** com métricas em tempo real
- 👥 **Gestão de Usuários** (pacientes, psicólogos, empresas)
- 📈 **Relatórios e Analytics** com gráficos avançados
- 🔐 **Sistema de Autenticação** robusto
- 📱 **Interface Responsiva** para desktop e mobile
- 🎨 **UI Moderna** com shadcn/ui e Tailwind CSS
- 🔔 **Notificações** em tempo real
- 📄 **Geração de PDFs** para relatórios

### Tecnologias Principais

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Query + React Hook Form
- **Routing**: React Router DOM v6
- **Validation**: Zod
- **Charts**: Recharts
- **PDF Generation**: jsPDF

## 🛠 Pré-requisitos

### Software Necessário

- **Node.js** (>=18.0.0) - [Download](https://nodejs.org/)
- **npm** ou **yarn** (incluído com Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Editor de Código** (VS Code recomendado)

### Contas e Serviços

- **Supabase** - [Criar conta](https://supabase.com/)
- **GitHub** - Para versionamento (opcional)
- **Vercel/Netlify** - Para deploy (opcional)

### Verificação do Ambiente

```bash
# Verificar versões instaladas
node --version    # Deve ser >=18.0.0
npm --version     # Deve ser >=8.0.0
git --version     # Qualquer versão recente
```

## 🚀 Instalação e Configuração

### 1. Clone do Repositório

```bash
# Clone o repositório
git clone https://github.com/nolabru/hello-login-screen-app-09.git

# Navegue para o diretório
cd hello-login-screen-app-09

# Verifique a estrutura
ls -la
```

### 2. Instalação de Dependências

```bash
# Instalar dependências
npm install

# Ou usando yarn
yarn install

# Verificar instalação
npm list --depth=0
```

### 3. Configuração Inicial

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de ambiente
nano .env  # ou seu editor preferido
```

## ⚙️ Configuração do Ambiente

### Variáveis de Ambiente (.env)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Development Settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Como Obter as Chaves do Supabase

1. **Acesse** [Supabase Dashboard](https://app.supabase.com/)
2. **Crie** um novo projeto ou selecione existente
3. **Vá para** Settings > API
4. **Copie** a URL e a chave anônima
5. **Cole** no arquivo `.env`

### Configuração do Supabase

```sql
-- Exemplo de tabelas principais (já configuradas)
-- user_profiles, psychologists, companies, etc.
-- Verifique o schema em: supabase/migrations/
```

## 📁 Estrutura do Projeto

```
hello-login-screen-app-09/
├── public/                     # Arquivos estáticos
│   ├── favicon.ico
│   ├── robots.txt
│   └── lovable-uploads/        # Uploads de imagens
├── src/                        # Código fonte principal
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── layout/             # Layouts (Dashboard, Admin, etc.)
│   │   ├── admin/              # Componentes específicos do admin
│   │   ├── company/            # Componentes de empresa
│   │   ├── psychologist/       # Componentes de psicólogo
│   │   ├── dashboard/          # Componentes de dashboard
│   │   └── user/               # Componentes de usuário
│   ├── pages/                  # Páginas da aplicação
│   │   ├── admin/              # Páginas administrativas
│   │   ├── companies/          # Páginas de empresas
│   │   ├── suporte/            # Página de suporte
│   │   └── *.tsx               # Páginas principais
│   ├── hooks/                  # Custom hooks
│   ├── integrations/           # Integrações externas
│   │   └── supabase/           # Cliente e tipos Supabase
│   ├── lib/                    # Utilitários e helpers
│   ├── services/               # Serviços de API
│   ├── types/                  # Definições de tipos TypeScript
│   ├── App.tsx                 # Componente raiz
│   └── main.tsx                # Ponto de entrada
├── supabase/                   # Configurações Supabase
├── package.json                # Dependências e scripts
├── vite.config.ts              # Configuração Vite
├── tailwind.config.ts          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
└── .env                        # Variáveis de ambiente
```

### Principais Diretórios

#### `/src/components/`
- **ui/**: Componentes base do shadcn/ui (Button, Card, etc.)
- **layout/**: Layouts reutilizáveis para diferentes tipos de usuário
- **dashboard/**: Componentes específicos de dashboards
- **admin/**: Componentes administrativos

#### `/src/pages/`
- **Organização por funcionalidade**
- **Roteamento** definido em `App.tsx`
- **Lazy loading** para otimização

#### `/src/hooks/`
- **Custom hooks** para lógica reutilizável
- **Integração** com React Query
- **Estado local** e global

## 🔗 Backend e Integrações

### Supabase

#### Configuração
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### Principais Tabelas
- `user_profiles` - Perfis de usuários
- `psychologists` - Dados de psicólogos
- `companies` - Informações de empresas
- `call_sessions` - Sessões de conversa
- `session_insights` - Insights das sessões
- `ai_content_reports` - Relatórios de conteúdo
- `company_licenses` - Licenças empresariais

#### Autenticação
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Logout
await supabase.auth.signOut()
```

### React Query

```typescript
// Exemplo de hook customizado
export const usePatientStats = (psychologistId: string) => {
  return useQuery({
    queryKey: ['patient-stats', psychologistId],
    queryFn: () => fetchPatientStats(psychologistId),
    enabled: !!psychologistId
  })
}
```

## 🎮 Comandos Essenciais

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:8080

# Verificar tipos TypeScript
npx tsc --noEmit

# Linting
npm run lint

# Limpar cache
rm -rf node_modules/.vite
```

### Build

```bash
# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev

# Preview do build
npm run preview
```

### Manutenção

```bash
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix
```

## 🚀 Build e Deploy

### Build Local

```bash
# Build otimizado para produção
npm run build

# Verificar saída
ls -la dist/

# Testar build localmente
npm run preview
```

### Deploy - Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Deploy - Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

### Deploy - Manual

```bash
# Build
npm run build

# Upload da pasta dist/ para seu servidor
# Configurar servidor web (nginx, apache, etc.)
```

### Variáveis de Ambiente em Produção

```bash
# Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Netlify
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 2. Erro de TypeScript
```bash
# Verificar tipos
npx tsc --noEmit

# Regenerar tipos Supabase
npx supabase gen types typescript --project-id your-project-id
```

#### 3. Erro de Build
```bash
# Verificar variáveis de ambiente
cat .env

# Build com logs detalhados
npm run build -- --debug
```

#### 4. Erro de Supabase
```bash
# Verificar conexão
curl -I https://your-project.supabase.co

# Verificar chaves no dashboard Supabase
```

### Logs e Debug

```bash
# Logs do Vite
npm run dev -- --debug

# Logs do browser
# Abra DevTools > Console

# Verificar network requests
# DevTools > Network
```

## 🏗 Arquitetura e Tecnologias

### Padrões Arquiteturais

#### Component-Based Architecture
```typescript
// Componente reutilizável
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children 
}) => {
  return (
    <button className={cn(buttonVariants({ variant, size }))}>
      {children}
    </button>
  )
}
```

#### Custom Hooks Pattern
```typescript
// Hook para lógica reutilizável
export const useAuth = () => {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return { user }
}
```

### State Management

#### React Query para Server State
```typescript
// Cache e sincronização de dados do servidor
const { data, isLoading, error } = useQuery({
  queryKey: ['patients', psychologistId],
  queryFn: () => fetchPatients(psychologistId),
  staleTime: 5 * 60 * 1000, // 5 minutos
})
```

#### React Hook Form para Forms
```typescript
// Formulários performáticos
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    email: ''
  }
})
```

### Styling Strategy

#### Tailwind CSS + shadcn/ui
```typescript
// Componente estilizado
<Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
  <CardHeader>
    <CardTitle className="text-2xl font-bold text-gray-900">
      Dashboard
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### Performance Optimizations

#### Code Splitting
```typescript
// Lazy loading de páginas
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

// Suspense wrapper
<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

#### Memoization
```typescript
// Evitar re-renders desnecessários
const MemoizedComponent = memo(({ data }) => {
  return <ExpensiveComponent data={data} />
})
```

## 🔐 Segurança

### Autenticação e Autorização

```typescript
// Proteção de rotas
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />
  }
  
  return children
}
```

### Validação de Dados

```typescript
// Schema Zod para validação
const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
})
```

### Boas Práticas

- ✅ **Nunca** commitar `.env` no Git
- ✅ **Sempre** validar dados de entrada
- ✅ **Usar** HTTPS em produção
- ✅ **Implementar** rate limiting
- ✅ **Sanitizar** dados antes de exibir

## 📝 Checklist de Setup

### Desenvolvimento
- [ ] Node.js >=18.0.0 instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Supabase configurado
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)

### Produção
- [ ] Build funcionando (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] SSL/HTTPS configurado
- [ ] Domínio personalizado (opcional)
- [ ] Monitoramento configurado

## 🎯 Fluxo de Desenvolvimento

### Diário
```bash
# 1. Atualizar código
git pull origin main

# 2. Instalar novas dependências (se houver)
npm install

# 3. Iniciar desenvolvimento
npm run dev

# 4. Fazer alterações
# 5. Testar localmente
# 6. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Criando Nova Feature
```bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver
# 3. Testar
npm run build
npm run lint

# 4. Commit
git commit -m "feat: adiciona nova funcionalidade"

# 5. Push e PR
git push origin feature/nova-funcionalidade
```

## 📚 Recursos e Documentação

### Documentação Oficial
- [React](https://react.dev/) - Framework principal
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/docs) - Backend as a Service
- [React Query](https://tanstack.com/query) - Data fetching
- [React Router](https://reactrouter.com/) - Roteamento

### Ferramentas Úteis
- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debug React
- [Supabase Dashboard](https://app.supabase.com/) - Gerenciar banco
- [Vercel](https://vercel.com/) - Deploy fácil

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🆘 Suporte e Comunidade

### Onde Buscar Ajuda
- **GitHub Issues** - Para bugs e features
- **Documentação** - Primeira fonte de consulta
- **Stack Overflow** - Para dúvidas técnicas
- **Discord/Slack** - Comunidade (se disponível)

### Reportando Bugs
```markdown
## Bug Report

**Descrição:** Breve descrição do bug

**Passos para Reproduzir:**
1. Vá para página X
2. Clique em Y
3. Veja o erro

**Comportamento Esperado:** O que deveria acontecer

**Screenshots:** Se aplicável

**Ambiente:**
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 1.0.0]
```

## 📊 Métricas e Monitoramento

### Performance
- **Lighthouse** - Auditoria de performance
- **Web Vitals** - Métricas essenciais
- **Bundle Analyzer** - Análise do bundle

### Analytics (Opcional)
```typescript
// Google Analytics 4
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href
})
```

---

## 🎉 Conclusão

O **Portal C'Alma** é uma aplicação web robusta e moderna que oferece uma experiência completa para gestão do ecossistema C'Alma. Com esta documentação, você deve conseguir:

- ✅ **Configurar** o ambiente de desenvolvimento
- ✅ **Entender** a arquitetura do projeto
- ✅ **Desenvolver** novas funcionalidades
- ✅ **Fazer deploy** para produção
- ✅ **Resolver** problemas comuns

### Próximos Passos
1. **Configure** seu ambiente seguindo este guia
2. **Explore** o código fonte
3. **Faça** suas primeiras modificações
4. **Contribua** com melhorias

---

**Desenvolvido com ❤️ pela equipe C'Alma**

*Última atualização: Janeiro 2025*
