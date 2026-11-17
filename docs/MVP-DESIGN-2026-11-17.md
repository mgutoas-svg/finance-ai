# Finance-AI MVP — Design Completo
**Data:** 2026-11-17  
**Versão:** 1.0 - MVP Completo com Integração, Autenticação, Pagamentos e Open Finance

---

## 1. INTENT & WHY

Criar um **sistema financeiro SaaS multi-tenant** que permite:
- **Pessoas físicas**: rastrear contas pessoais, metas, extratos
- **Consultores/contadores**: gerenciar múltiplas contas de clientes
- **Importação de dados**: PDFs, OFX, Estratos + integração Open Finance (Bacen Brasil)
- **Pagamentos**: Stripe para subscriptions
- **Autenticação**: JWT + OAuth pronto para expansão

**Por quê?** Testar modelo de negócio SaaS rapidamente, escalar pra VPS própria com arquitetura sólida desde o início.

---

## 2. GOALS, NON-GOALS, ANTI-GOALS

### ✅ GOALS (Deve ter no MVP)
- Autenticação segura (JWT + refresh tokens)
- Multi-tenancy funcional (pessoa física = 1 tenant, consultor = múltiplos tenants)
- Integração Stripe para pagamentos (assinatura mensal/plano)
- Leitura de PDFs e OFX (parsing + armazenamento)
- Open Finance (Bacen) - conexão com instituições brasileiras
- Dashboard básico (saldo, últimas transações, metas)
- Segurança: criptografia de dados sensíveis, validação LGPD
- Pronto para deploy em Vercel + Supabase OU em VPS própria

### ❌ NON-GOALS (Fase 2+)
- Machine Learning / insights avançados
- Mobile app nativa (apenas responsivo web)
- Integração com múltiplos países (apenas Brasil MVP)
- Sistema de relatórios complexos
- Auditoria detalhada (básica sim, complexa não)

### 🔴 ANTI-GOALS (Nunca)
- Armazenar senhas em plain text
- Expor dados financeiros sem autenticação
- Violar LGPD/compliance bancário
- Permitir um usuário acessar dados de outro
- Integração insegura com Open Finance

---

## 3. CONSTRAINTS

| Constraint | Impacto |
|-----------|---------|
| **Segurança bancária** | Criptografia AES-256 em dados sensíveis, validação de entrada rigorosa |
| **LGPD/Compliance** | Consentimento explícito, direito ao esquecimento, auditoria mínima |
| **Open Finance Bacen** | Requer certificado digital, integração via FAPI-compliant APIs |
| **Escala Phase 1** | ≤ 100 usuários iniciais (MVP em Vercel + Supabase free tier possível) |
| **Stack escolhido** | NestJS + React + PostgreSQL (decisão do usuário) |
| **Pagamentos** | Apenas Stripe (1 provider, simplicidade) |
| **Deployment** | Inicialmente nuvem (Vercel/Supabase), depois VPS própria |

---

## 4. APPROACHES CONSIDERADAS

### Opção A: Next.js + Supabase (Rápido, Nuvem)
- **Prós:** Deploy em 1 clique, autenticação built-in, full-stack JavaScript
- **Contras:** Menos flexibilidade se migrar pra VPS, menos estruturado
- **Descartada?** Sim — usuário quer NestJS (mais robusto)

### Opção B: NestJS + React + PostgreSQL (Escolhida ✅)
- **Prós:** Arquitetura escalável, fácil migrar pra VPS, enterprise-ready
- **Contras:** Mais setup inicial, 2 linguagens (TS mesmo)
- **Decisão:** Escolhida pelo usuário
- **Trade-off:** +1-2 semanas vs solidez arquitetural

### Opção C: Python + React + PostgreSQL
- **Prós:** Django/FastAPI robusto, integração financeira mais simples
- **Contras:** Dois stacks diferentes, menos comunidade em finanças
- **Descartada:** Usuário quer JavaScript/TypeScript

---

## 5. ARQUITETURA ESCOLHIDA

```
┌─────────────────────────────────────────────────────────────┐
│                    FINANCE-AI MVP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           FRONTEND (React + TypeScript)              │  │
│  │  ├─ Dashboard (saldo, transações, metas)            │  │
│  │  ├─ Upload PDFs/OFX                                  │  │
│  │  ├─ Conexão Open Finance                             │  │
│  │  ├─ Gerenciamento de Assinatura (Stripe)            │  │
│  │  └─ Painel Admin (consultores)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↕ (REST API)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         BACKEND (NestJS + TypeScript)                │  │
│  │  ├─ Auth Controller (JWT + OAuth2 ready)            │  │
│  │  ├─ Transactions Service (CRUD)                     │  │
│  │  ├─ File Upload Service (PDF/OFX parser)            │  │
│  │  ├─ Open Finance Service (Bacen API)                │  │
│  │  ├─ Payment Service (Stripe webhook)                │  │
│  │  ├─ Multi-tenancy Middleware                        │  │
│  │  └─ Security & Encryption (AES-256)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↕ (ORM - Prisma)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    DATABASE (PostgreSQL + Encryption at rest)       │  │
│  │  ├─ users (login, tenant, role)                     │  │
│  │  ├─ subscriptions (plano, status, Stripe ID)        │  │
│  │  ├─ accounts (conexões bancárias, Open Finance)     │  │
│  │  ├─ transactions (movimentações, criptografadas)    │  │
│  │  ├─ files (PDFs/OFX histórico)                      │  │
│  │  ├─ audit_logs (compliance LGPD)                    │  │
│  │  └─ audit_consent (consentimento usuário)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          EXTERNAL INTEGRATIONS                       │  │
│  │  ├─ Stripe (pagamentos)                              │  │
│  │  ├─ Bacen Open Finance (autenticação + dados)       │  │
│  │  ├─ AWS S3 / Vercel Blob (storage de PDFs)         │  │
│  │  └─ SendGrid (emails)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. COMPONENTES & RESPONSABILIDADES

### FRONTEND (React)
| Componente | Responsabilidade |
|-----------|-----------------|
| **Auth Pages** | Login, Signup, 2FA, Reset Password |
| **Dashboard** | Resumo saldo, últimas transações, metas |
| **Transactions** | Listar, filtrar, editar, deletar |
| **Upload** | PDFs/OFX, preview, confirmação |
| **Open Finance** | Conectar banco, selecionar contas, sincronizar |
| **Subscription** | Escolher plano, pagamento Stripe, cancelar |
| **Admin Panel** (Consultores) | Listar clientes, gerenciar permissões |

### BACKEND (NestJS)
| Módulo | Responsabilidade |
|--------|-----------------|
| **Auth Module** | JWT, OAuth2, 2FA, refresh tokens |
| **Tenant Module** | Isolamento de dados por tenant |
| **Transaction Module** | CRUD, validação, criptografia |
| **File Module** | Upload, parsing PDF/OFX, storage |
| **OpenFinance Module** | Integração Bacen, sincronização |
| **Payment Module** | Stripe integration, webhook |
| **Audit Module** | Logs, compliance, consentimento |
| **Security** | Encryption, validation, rate limiting |

### DATABASE (PostgreSQL)
```sql
-- Essencial
users (id, email, password_hash, tenant_id, role, 2fa_secret)
tenants (id, name, type: 'personal'|'consultant', owner_id)
subscriptions (id, tenant_id, stripe_customer_id, plan, status)
accounts (id, tenant_id, bank_code, open_finance_id, encrypted_credentials)
transactions (id, account_id, date, description, amount, encrypted_data)
files (id, tenant_id, type: 'pdf'|'ofx', url, parsed_data)
audit_logs (id, tenant_id, action, user_id, timestamp)
audit_consent (id, tenant_id, type: 'lgpd'|'open_finance', accepted_at)
```

---

## 7. FLUXOS CRÍTICOS

### 🔐 Autenticação
```
User → Login → Verificar email/senha → JWT + Refresh Token
                                     → 2FA (SMS/Authenticator)
                                     → Dashboard
```

### 💰 Pagamento (Stripe)
```
User → Escolhe Plano → Redirect Stripe Checkout
                     → Webhook Stripe (payment_intent.succeeded)
                     → Update subscription (ativo)
                     → Dashboard (features desbloqueadas)
```

### 📄 Upload PDF/OFX
```
User → Select File → Upload Backend → Parse (pdf-parse, xml2js)
                                    → Extract transactions
                                    → Validar (data, valor)
                                    → Store em DB (criptografado)
                                    → Dashboard (atualizado)
```

### 🏦 Open Finance
```
User → "Conectar Banco" → Redirect Bacen Consent Screen
                        → Usuário autoriza em app do banco
                        → Callback com authorization code
                        → Exchange code → Access Token
                        → Fetch accounts + transactions (Bacen API)
                        → Store em DB (tokens criptografados)
                        → Dashboard (sincronizado)
```

### 👥 Multi-tenancy
```
Consultor → Convida Cliente → Cliente cria conta
                             → Vinculado ao "tenant" do consultor
                             → Consultor vê dados do cliente (permissão)
                             → Cliente vê apenas seus dados
```

---

## 8. SEGURANÇA (LGPD + Dados Sensíveis)

| Aspecto | Implementação |
|---------|---------------|
| **Autenticação** | JWT (3600s) + Refresh (7 dias), 2FA opcional |
| **Criptografia em Trânsito** | HTTPS/TLS 1.3 |
| **Criptografia em Repouso** | AES-256-GCM (bcryptjs, crypto-js) |
| **Dados Sensíveis** | Credenciais bancárias, números de conta, CPF (criptografados) |
| **Multi-tenancy** | Row-level security (RLS) em PostgreSQL, tenant_id em cada query |
| **Validação** | Input sanitization (DOMPurify, express-validator) |
| **Rate Limiting** | 100 req/min por IP, auth endpoints mais restritivos |
| **Logs** | Auditoria (ações críticas), sem dados sensíveis em logs |
| **LGPD** | Consentimento (opt-in), direito ao esquecimento (soft delete), acesso a dados |
| **Compliance** | Nenhuma dados sensível em cookies, apenas tokens; CORS restritivo |

---

## 9. TECNOLOGIAS ESPECÍFICAS

### Frontend
- **React 18** (hooks, context API)
- **TypeScript** (type safety)
- **Tailwind CSS** (UI rápida)
- **TanStack Query** (data fetching, caching)
- **Axios** (HTTP client)
- **React Hook Form** (forms)
- **Recharts** (gráficos)

### Backend
- **NestJS 10** (framework)
- **TypeScript**
- **Prisma** (ORM, type-safe)
- **PostgreSQL 15** (banco)
- **Stripe SDK** (pagamentos)
- **jsonwebtoken** (JWT)
- **bcryptjs** (password hashing)
- **pdf-parse** (PDF extraction)
- **xml2js** (OFX parsing)
- **axios** (HTTP, Open Finance)
- **express-validator** (validation)

### Deployment (Fase 1 - Nuvem)
- **Frontend:** Vercel
- **Backend:** Vercel Functions / Railway / Render
- **Database:** Supabase (PostgreSQL managed) OU Render PostgreSQL
- **Storage:** Vercel Blob OU AWS S3

### Deployment (Fase 2 - VPS)
- **Frontend:** Nginx (reverse proxy) OU PM2
- **Backend:** PM2 (Node.js process manager)
- **Database:** PostgreSQL (self-managed)
- **Storage:** Local FS ou MinIO (S3-compatible)

---

## 10. PLANO DE DESENVOLVIMENTO

### Sprint 1 (Semana 1-2): Setup + Auth + DB
- [ ] Scaffold NestJS + React
- [ ] Prisma schema + migrations
- [ ] PostgreSQL local/Supabase
- [ ] Auth (JWT, signup, login, 2FA)
- [ ] Dashboard mínimo (autenticado)

### Sprint 2 (Semana 3): Transactions + Upload
- [ ] CRUD transações
- [ ] Upload PDFs/OFX
- [ ] Parser PDF/OFX
- [ ] Dashboard com transações

### Sprint 3 (Semana 4-5): Stripe + Multi-tenancy
- [ ] Integração Stripe
- [ ] Webhook Stripe
- [ ] Planos de assinatura
- [ ] Multi-tenancy (consultores)

### Sprint 4 (Semana 5-6): Open Finance
- [ ] Setup Bacen (certificado digital)
- [ ] Integração Open Finance
- [ ] Conexão de contas
- [ ] Sincronização automática

### Sprint 5 (Semana 7): Segurança + Compliance
- [ ] Criptografia dados sensíveis
- [ ] LGPD (consentimento, direito esquecimento)
- [ ] Auditoria
- [ ] Rate limiting
- [ ] Testes de segurança

### Sprint 6 (Semana 8): Deploy + Docs
- [ ] Deploy Vercel + Supabase
- [ ] Documentação API (Swagger)
- [ ] Guia deployment VPS
- [ ] Testes E2E

---

## 11. DECIDIDO PELO USUÁRIO

✅ **Stack:** NestJS + React + PostgreSQL  
✅ **Deployment inicial:** Nuvem (Vercel + Supabase)  
✅ **Deployment futuro:** VPS própria  
✅ **Pagamento:** Stripe  
✅ **Escopo:** Tudo integrado (Auth + Payments + Open Finance + Uploads)  
✅ **Multi-tenancy:** Sim (pessoas físicas + consultores)  
✅ **Segurança:** Completa (LGPD, criptografia, 2FA)

---

## 12. O QUE FICA PRA BUILDER

- Escolher hosting específico (Vercel vs Render vs Railway)
- Escolher database managed (Supabase vs Render vs Railway)
- Configurar variáveis de ambiente (secrets Stripe, Bacen)
- Setup CI/CD (GitHub Actions)
- Testar integração Open Finance (requer sandbox Bacen)
- Performance tuning

---

## 13. TIMELINE ESTIMADO

- **Total:** 8 semanas (MVP completo)
- **Fase 1 (2 semanas):** Setup + Auth + DB
- **Fase 2 (3 semanas):** Features core (transações, upload, Stripe)
- **Fase 3 (2 semanas):** Open Finance
- **Fase 4 (1 semana):** Segurança, compliance, deploy

**Pode ser comprimido a 5-6 semanas** com focus total.

---

