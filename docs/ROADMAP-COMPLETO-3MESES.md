# Finance AI - Roadmap Completo (3-4 Meses)

**Objetivo:** Sistema de gestão de finanças pessoais COMERCIAL com todas as features essenciais.

**Timeline:** 12 semanas (Sprint de 1 semana cada)

---

## 📅 SPRINT 1-2: Foundation Avançada (Semanas 1-2)

### Sprint 1: Orçamento (Budget Planning)
**Backend:**
- [ ] Model: `Budget` (categoria, limite, período: mensal/semanal/anual)
- [ ] Service: `BudgetService` - create/read/update/delete
- [ ] Controller: `BudgetController` - CRUD endpoints
- [ ] Logic: Comparar gasto real vs orçado
- [ ] Alert: Disparar quando passar de 80% do limite

**Frontend:**
- [ ] Page: `/budget` - Listar orçamentos
- [ ] Form: Criar novo orçamento
- [ ] Widget: "Usado R$800 de R$1000 (80%)"
- [ ] Visual: Progressbar por categoria

**Database:**
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  tenantId UUID REFERENCES tenants(id),
  category VARCHAR (50), -- "Alimentação", "Transporte", etc
  limit DECIMAL(10,2),
  period VARCHAR(20), -- "monthly", "weekly", "annual"
  createdAt TIMESTAMP,
  UNIQUE(tenantId, category, period)
);
```

### Sprint 2: Metas Financeiras (Financial Goals)
**Backend:**
- [ ] Model: `Goal` (nome, valor alvo, deadline, categoria)
- [ ] Service: `GoalService` - Tracking de progresso
- [ ] Controller: `GoalController`
- [ ] Calculation: % progress = poupança atual / meta
- [ ] Notification: "Faltam X dias para sua meta"

**Frontend:**
- [ ] Page: `/goals` - Listar metas
- [ ] Form: "Juntar R$10k em 6 meses" 
- [ ] Progress: Visual com timeline
- [ ] Recommendation: "Poupe R$1.666/mês"

**Database:**
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  tenantId UUID,
  name VARCHAR(255), -- "Viagem", "Carro", etc
  targetAmount DECIMAL(10,2),
  currentAmount DECIMAL(10,2),
  deadline DATE,
  category VARCHAR(50),
  createdAt TIMESTAMP
);
```

---

## 📅 SPRINT 3-4: Monitoramento & Recorrentes (Semanas 3-4)

### Sprint 3: Alertas Inteligentes (Smart Alerts)
**Backend:**
- [ ] Model: `Alert` (tipo, threshold, frequência)
- [ ] Types:
  - Budget excedido (80%, 100%)
  - Transação anormal (3x média)
  - Meta próxima vencimento
  - Conta zerada
- [ ] Service: `AlertService` - Trigger alerts
- [ ] Integration: Email/SMS via SendGrid
- [ ] Store: Histórico de alertas

**Frontend:**
- [ ] Bell icon com contador
- [ ] Drawer: Lista de alertas
- [ ] Settings: Personalizar frequência
- [ ] Mark as read/dismiss

**Database:**
```sql
CREATE TABLE alerts (
  id UUID,
  tenantId UUID,
  type VARCHAR(50),
  message TEXT,
  read BOOLEAN,
  createdAt TIMESTAMP
);
```

### Sprint 4: Transações Recorrentes (Recurring Transactions)
**Backend:**
- [ ] Model: `Recurrence` (frequência: diária, semanal, mensal, anual)
- [ ] Logic: Gerar automaticamente no dia correto
- [ ] Service: Cron job para criar mensais
- [ ] Edit: Modificar recorrência sem quebrar histórico
- [ ] Cancel: Parar recorrência a partir de data

**Frontend:**
- [ ] Transaction form: Adicionar "É recorrente?"
- [ ] Calendar: Ver próximas recorrências
- [ ] Edit: Modificar/pausar/cancelar

**Database:**
```sql
CREATE TABLE recurrences (
  id UUID,
  tenantId UUID,
  transactionId UUID,
  frequency VARCHAR(20), -- "daily", "weekly", "monthly"
  endDate DATE NULL,
  nextOccurrence DATE,
  createdAt TIMESTAMP
);
```

---

## 📅 SPRINT 5-6: Contas & Cartões (Semanas 5-6)

### Sprint 5: Gerenciar Contas Bancárias (Bank Accounts)
**Backend:**
- [ ] Model: `BankAccount` (banco, agência, conta, saldo)
- [ ] Service: Atualizar saldo, reconciliação
- [ ] Controller: CRUD de contas
- [ ] Integration: Open Finance para auto-sync
- [ ] Alert: Saldo baixo (threshold customizável)

**Frontend:**
- [ ] Dashboard: Cards de cada conta
- [ ] Extrato: Transações por conta
- [ ] Configurar alerta de saldo baixo
- [ ] Reconciliar manualmente

**Database:**
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  tenantId UUID,
  bankCode VARCHAR(10),
  bankName VARCHAR(100),
  accountNumber VARCHAR(50),
  balance DECIMAL(12,2),
  balanceUpdatedAt TIMESTAMP,
  createdAt TIMESTAMP
);
```

### Sprint 6: Cartões de Crédito (Credit Cards)
**Backend:**
- [ ] Model: `CreditCard` (banco, limite, vencimento, bandeira)
- [ ] Service: Rastrear limite disponível
- [ ] Logic: Fatura mensal (soma transações do mês)
- [ ] Alert: "Vencimento em 3 dias"
- [ ] Histórico de faturas

**Frontend:**
- [ ] Dashboard: Cards com limite/usado
- [ ] Fatura: Visualizar transações do mês
- [ ] Alerta: Notificação de vencimento
- [ ] Simulador: "Se gastar mais X, quanto devo?"

**Database:**
```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY,
  tenantId UUID,
  bankCode VARCHAR(10),
  cardName VARCHAR(100),
  limit DECIMAL(12,2),
  usedAmount DECIMAL(12,2),
  dueDay INT, -- Dia do vencimento (1-31)
  brand VARCHAR(20), -- "Visa", "Mastercard"
  createdAt TIMESTAMP
);

CREATE TABLE credit_card_bills (
  id UUID PRIMARY KEY,
  creditCardId UUID,
  month INT,
  year INT,
  totalAmount DECIMAL(12,2),
  status VARCHAR(20), -- "pending", "paid"
  dueDate DATE
);
```

---

## 📅 SPRINT 7-8: Gestão de Dívidas & Relatórios (Semanas 7-8)

### Sprint 7: Rastreador de Dívidas (Debt Tracker)
**Backend:**
- [ ] Model: `Debt` (credor, valor, juros, parcelas, vencimento)
- [ ] Service: Calcular saldo devedor + juros
- [ ] Simulador: Pagar tudo agora vs parcelado
- [ ] Alert: "Dívida com juros vencida"

**Frontend:**
- [ ] Dashboard: Total de dívidas
- [ ] Detalhes: Credor, juros, próximo vencimento
- [ ] Simulador: "Se pagar R$500 extra, quando termina?"
- [ ] Plano de quitação sugerido

**Database:**
```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY,
  tenantId UUID,
  creditorName VARCHAR(255),
  totalAmount DECIMAL(12,2),
  remainingAmount DECIMAL(12,2),
  interestRate DECIMAL(5,2), -- % ao mês
  monthlyPayment DECIMAL(12,2),
  startDate DATE,
  endDate DATE,
  createdAt TIMESTAMP
);
```

### Sprint 8: Relatórios PDF & Exportação (Reports)
**Backend:**
- [ ] Service: Gerar PDF com tabelas
- [ ] Data: Incluir resumo, transações, análise
- [ ] Customization: Período customizável
- [ ] Assinatura digital (opcional)

**Frontend:**
- [ ] Button: "Exportar Relatório"
- [ ] Options: Período, formato (PDF, CSV, Excel)
- [ ] Preview: Antes de baixar

**Tech:**
- Usar `pdfkit` ou `puppeteer` para gerar PDF

---

## 📅 SPRINT 9-10: Investimentos & Aposentadoria (Semanas 9-10)

### Sprint 9: Portfolio de Investimentos (Investments)
**Backend:**
- [ ] Model: `Investment` (tipo: ação, fundo, cripto, tesouro)
- [ ] Integration: B3 API para preços em tempo real
- [ ] Service: Calcular rentabilidade (% ganho/perda)
- [ ] Dashboard: Composição do portfolio

**Frontend:**
- [ ] Page: `/investments` - Ver portfolio
- [ ] Add: Adicionar novo investimento
- [ ] Real-time: Preço atualizado
- [ ] Chart: Composição (pizza chart)
- [ ] Performance: % ganho/perda

**Database:**
```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY,
  tenantId UUID,
  type VARCHAR(50), -- "stock", "fund", "crypto", "treasury"
  name VARCHAR(255),
  ticker VARCHAR(20), -- "PETR4", "VALE3"
  quantity DECIMAL(10,2),
  averageCost DECIMAL(12,2),
  currentPrice DECIMAL(12,2),
  createdAt TIMESTAMP
);
```

### Sprint 10: Calculadora de Aposentadoria (Retirement)
**Backend:**
- [ ] Service: Calcular quando pode aposentar
- [ ] Logic:
  - Despesa mensal atual
  - Tempo até aposentadoria
  - Rentabilidade esperada
  - Inflação
- [ ] Simulador: "Com quanto/mês consigo aposentar aos 50?"

**Frontend:**
- [ ] Interactive: Sliders para ajustar
- [ ] Result: "Faltam 15 anos" / "Precisa de R$2M"
- [ ] Recommendation: "Poupe mais X ou trabalhe até Y"
- [ ] Chart: Projeção de patrimônio

**Formula:**
```
Para aposentar = (Despesa mensal × 12 × 25) / Taxa de saques
Tempo = raiz(meta / (aporte mensal × rendimento anual))
```

---

## 📅 SPRINT 11: IA & Multi-User (Semana 11)

### Sprint 11A: IA Recomendações (AI Recommendations)
**Backend:**
- [ ] Service: Análise automática
- [ ] Rules:
  - Se gasta 80% em alimentação → "Reduza ou aumenta renda"
  - Se dívida > 3 meses despesa → "Foco em quitar dívida"
  - Se poupança 0 → "Comece com R$100/mês"
  - Se investimento < 10% patrimônio → "Diversifique"

**Frontend:**
- [ ] Widget: Dicas inteligentes
- [ ] Card: "Baseado em seus dados..."
- [ ] Accept/Dismiss: Usuário pode ignorar

### Sprint 11B: Multi-User / Família (Family Accounts)
**Backend:**
- [ ] Model: `FamilyMember` (role: admin, viewer, editor)
- [ ] Security: Row-level security por role
- [ ] Shared: Orçamento familiar
- [ ] Individual: Transações pessoais

**Frontend:**
- [ ] Settings: Adicionar membro
- [ ] Permissions: Definir acesso
- [ ] Shared Budget: Ver juntos
- [ ] Activity: Quem fez o quê

**Database:**
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY,
  tenantId UUID,
  userId UUID,
  role VARCHAR(20), -- "admin", "editor", "viewer"
  inviteStatus VARCHAR(20), -- "pending", "accepted"
  createdAt TIMESTAMP
);
```

---

## 📅 SPRINT 12: Testes, Polishing & Deploy (Semana 12)

### Sprint 12A: Testes Automatizados (Testing)
**Backend:**
- [ ] Jest tests para 80% do código crítico
- [ ] Tests: Auth, Budget, Goals, Alerts, Calculations
- [ ] Integration: Fluxo completo usuário

**Frontend:**
- [ ] Componentes críticos
- [ ] Fluxo: Login → Criar orçamento → Ver alerta

### Sprint 12B: Deployment & Documentação
**Backend:**
- [ ] Docker + docker-compose
- [ ] GitHub Actions CI/CD
- [ ] Deploy em Vercel/Railway + Supabase

**Frontend:**
- [ ] Build otimizado
- [ ] SEO básico
- [ ] Performance audit

**Docs:**
- [ ] API Swagger
- [ ] User manual
- [ ] Video tutorial

---

## 💰 Planos de Precificação (Implementar ao longo)

```
FREE
├─ Transações básicas
├─ 1 conta bancária
├─ Orçamento simples
└─ Sem alertas

BASIC ($9/mês)
├─ Tudo do Free
├─ 5 contas
├─ Orçamentos ilimitados
├─ Alertas
├─ Metas
├─ Relatório PDF
└─ Recorrentes

PRO ($29/mês)
├─ Tudo do Basic
├─ Cartões de crédito
├─ Rastreador dívidas
├─ Fluxo de caixa 12 meses
├─ IA recomendações
├─ Portfolio investimentos
├─ Calculadora aposentadoria
├─ Open Finance real-time
└─ Multi-user (3 pessoas)

CONSULTANT ($99/mês)
├─ Tudo do Pro
├─ Gerenciar ilimitados clientes
├─ White-label (?)
├─ API acesso
└─ Suporte prioritário
```

---

## 📊 Métricas de Sucesso

**Semana 4:** 1º MVP com Budget + Metas + Alerts
- Usuários podem criar conta e orçamento
- Alert funciona por email

**Semana 8:** Produto robusto
- 80% features implementadas
- Pronto para beta testing
- 100 beta users

**Semana 12:** Pronto para produção
- All features implementadas
- Testes passando
- Deploy em produção

---

## 🛠️ Tech Stack (Mantém o que temos + novos)

**Backend:**
- NestJS (continua)
- PostgreSQL (continua)
- Prisma ORM (continua)
- Jest (testes)
- pdfkit (relatórios)
- cron jobs (recorrentes)

**Frontend:**
- React 18 (continua)
- Recharts (gráficos)
- react-big-calendar (calendar)
- date-fns (manipular datas)
- zustand (state management opcional)

**Infra:**
- Docker + compose
- GitHub Actions
- Vercel + Supabase (ou VPS)

---

## 🚀 Próximas Etapas Pós-MVP

1. **Mês 4:** Beta testing com 100 usuários
2. **Mês 5:** Feedback loop + ajustes
3. **Mês 6:** Launch em produção + marketing
4. **Mês 7+:** 
   - Integração com mais bancos
   - App mobile
   - Integração B2B (consultor)
   - IA avançada

---

## 📝 Notas Importantes

✅ Este roadmap é **flexível** - pode ajustar sprints conforme feedback
✅ Priorize **features que geram valor** sobre "legais"
✅ **Teste com usuários reais** a cada sprint
✅ **Segurança** em primeiro lugar (LGPD, criptografia)
✅ **Performance** = essencial (alertas devem ser rápidos)
