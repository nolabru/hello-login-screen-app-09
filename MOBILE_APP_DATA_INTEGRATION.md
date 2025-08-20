# 📱 INTEGRAÇÃO DE DADOS DO APP MOBILE CALMA

## 📊 STATUS DA IMPLEMENTAÇÃO

### ✅ FASE 1 - Service Layer (CONCLUÍDO)
- [x] Service de dados do app mobile criado (`mobileAppDataService.ts`)
- [x] Funções para todas as métricas principais
- [x] Integração com dados reais disponíveis
- [x] Simulação inteligente quando dados reais não disponíveis

### 🚧 FASE 2 - Integração no Dashboard (EM PROGRESSO)
- [ ] Substituir dados mockados por dados reais
- [ ] Criar novos widgets de impacto
- [ ] Implementar atualização em tempo real

### 📋 FASE 3 - Dashboards Especializados (PENDENTE)
- [ ] CEO Dashboard
- [ ] RH Dashboard  
- [ ] Gestor Dashboard

---

## 🎯 MÉTRICAS DISPONÍVEIS

### 1. **MEDITAÇÃO E MINDFULNESS**
```typescript
getMeditationStats(companyId)
// Retorna:
- totalTracks: Trilhas disponíveis
- completedTracks: Trilhas completas
- totalPhases: Total de fases
- completedPhases: Fases completas
- totalHours: Horas de meditação
- activeUsers: Usuários ativos
- completionRate: Taxa de conclusão
```

### 2. **SONS TERAPÊUTICOS**
```typescript
getSoundUsageStats(companyId)
// Retorna:
- totalMinutes: Minutos totais
- byCategory: {Natureza, Instrumental, Urbanos}
- byType: {Dormir, Estudar, Relaxar}
- topSounds: Top 5 sons mais ouvidos
- activeUsers: Usuários ativos
```

### 3. **DIÁRIO EMOCIONAL**
```typescript
getDiaryEngagement(companyId)
// Retorna:
- totalEntries: Total de entradas
- activeUsers: Usuários ativos
- emotionDistribution: Distribuição de emoções
- averageEntriesPerUser: Média por usuário
- last30Days: Entradas últimos 30 dias
```

### 4. **SESSÕES DE IA (AIA)**
```typescript
getAISessionsStats(companyId)
// Retorna:
- totalSessions: Total de sessões
- totalHours: Horas totais
- averageDuration: Duração média
- moodDistribution: Distribuição de humor
- riskIndicators: Indicadores de risco
- insights: Insights gerados
- activeUsers: Usuários ativos
```

### 5. **CHAT E INTERAÇÕES**
```typescript
getChatEngagement(companyId)
// Retorna:
- totalConversations: Total de conversas
- totalDuration: Duração total (minutos)
- averageMessages: Média de mensagens
- activeUsers: Usuários ativos
```

### 6. **ENGAJAMENTO (STREAKS)**
```typescript
getUserStreakStats(companyId)
// Retorna:
- activeToday: Ativos hoje
- averageStreak: Streak médio
- maxStreak: Maior streak
- totalActiveUsers: Total usuários ativos
- engagementRate: Taxa de engajamento
```

### 7. **WELL-BEING SCORE**
```typescript
getRealWellBeingScore(companyId)
// Retorna:
- score: Score de 0-10
- components: Componentes do score
  - meditation: % conclusão meditação
  - diary: Usuários ativos no diário
  - aiSessions: Usuários em sessões IA
  - engagement: Taxa de engajamento
```

### 8. **DISTRIBUIÇÃO DE RISCOS**
```typescript
getRealRiskDistribution(companyId)
// Retorna:
- lowRisk: Baixo risco (count)
- moderateRisk: Risco moderado (count)
- highRisk: Alto risco (count)
- distribution: Array com percentuais
```

### 9. **ROI E ECONOMIA**
```typescript
getROIData(companyId)
// Retorna:
- totalInvestment: Investimento total
- totalSavings: Economia total
- roi: ROI percentual
- monthlyData: Dados mensais
```

---

## 🔄 COMO USAR NO DASHBOARD

### Importar o Service:
```typescript
import { 
  getCompanyDashboardData,
  getMeditationStats,
  getRealWellBeingScore,
  getRealRiskDistribution
} from '@/services/mobileAppDataService';
```

### Buscar Dados Consolidados:
```typescript
useEffect(() => {
  const fetchRealData = async () => {
    const data = await getCompanyDashboardData(companyId);
    
    if (data) {
      // Atualizar estados com dados reais
      setWellBeingScore(data.wellBeing?.score || 7.2);
      setRiskDistribution(data.risks?.distribution || []);
      setEvolution(data.evolution || []);
      setROIData(data.roi?.monthlyData || []);
    }
  };
  
  fetchRealData();
}, [companyId]);
```

---

## 📈 WIDGETS PLANEJADOS

### 1. **Widget de Engajamento em Tempo Real**
- Usuários ativos agora
- Atividade por hora do dia
- Mapa de calor semanal

### 2. **Widget de Saúde Mental Score**
- Score geral da empresa
- Breakdown por componente
- Tendência histórica

### 3. **Widget de ROI e Impacto**
- Economia acumulada
- Redução de absenteísmo
- Aumento de produtividade

### 4. **Widget de Uso do App**
- Features mais utilizadas
- Tempo médio de uso
- Taxa de retenção

---

## 🎨 NOVOS COMPONENTES A CRIAR

### 1. `MobileAppEngagementCard.tsx`
```typescript
// Card mostrando engajamento em tempo real
- Usuários online
- Atividades em andamento
- Streak do dia
```

### 2. `WellBeingScoreGauge.tsx`
```typescript
// Gauge visual do well-being score
- Score de 0-10
- Indicador de tendência
- Breakdown dos componentes
```

### 3. `RiskHeatmap.tsx`
```typescript
// Mapa de calor de riscos por departamento
- Visualização por setor
- Drill-down para detalhes
- Ações recomendadas
```

### 4. `ROICalculator.tsx`
```typescript
// Calculadora de ROI em tempo real
- Investimento vs Economia
- Projeções futuras
- Métricas de impacto
```

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Integrar dados reais no CompanyDashboard.tsx**
   - [ ] Substituir mockWellBeingEvolution
   - [ ] Substituir mockRiskDistribution
   - [ ] Substituir mockROIData

2. **Criar novo widget de Uso do App**
   - [ ] Mostrar meditação, sons, diário, IA
   - [ ] Tempo real de uso
   - [ ] Usuários ativos

3. **Adicionar seção de Insights Automáticos**
   - [ ] Análise de tendências
   - [ ] Alertas proativos
   - [ ] Recomendações de ação

4. **Implementar Auto-refresh**
   - [ ] Polling a cada 5 minutos
   - [ ] WebSocket para dados críticos
   - [ ] Cache inteligente

---

## 📊 SCHEMA DE DADOS FUTUROS

### Tabelas a serem criadas no Supabase:

```sql
-- Tabela de progresso de meditação
CREATE TABLE meditation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  track_id TEXT,
  phase_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER
);

-- Tabela de uso de sons
CREATE TABLE sound_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  sound_id TEXT,
  category TEXT,
  type TEXT,
  listened_minutes INTEGER,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de streaks
CREATE TABLE user_engagement_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_active_days INTEGER DEFAULT 0
);
```

---

## 🔐 CONSIDERAÇÕES DE SEGURANÇA

1. **RLS (Row Level Security)**
   - Usuários só veem dados da própria empresa
   - Gestores veem dados agregados
   - Proteção de dados sensíveis

2. **Performance**
   - Cache de dados agregados
   - Índices nas queries frequentes
   - Paginação para grandes volumes

3. **Privacidade**
   - Dados sempre agregados
   - Sem identificação individual
   - Compliance com LGPD

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Dados Reais vs Simulados
- **Reais disponíveis:** call_sessions, mental_health_alerts, user_profiles
- **Simulados inteligentes:** meditation, sounds, diary, chat
- **Proporcionais:** Todos os dados simulados são proporcionais ao número real de funcionários

### Fórmulas de Cálculo
- **Well-being Score:** Média ponderada de 4 componentes
- **ROI:** (Economia - Investimento) / Investimento × 100
- **Engagement Rate:** Usuários ativos / Total usuários × 100

### Benchmarks do Setor
- Well-being médio: 6.5/10
- Taxa de engajamento: 55%
- ROI esperado: 150% em 12 meses

---

## 💡 INSIGHTS PARA O RELATÓRIO

Os dados coletados alimentam automaticamente:
1. Relatório Executivo Mensal
2. Compliance Lei 14.831
3. Dashboard de KPIs
4. Alertas de Saúde Mental
5. Planos de Ação

---

**Última atualização:** 14/08/2025
**Status:** Service Layer Completo ✅
**Próximo milestone:** Integração Visual no Dashboard
