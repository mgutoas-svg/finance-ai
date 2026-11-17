# 🚀 Setup Local - Finance AI

**Tempo:** ~15 minutos para ter tudo rodando localmente

---

## ✅ Pré-requisitos

Instale (se não tiver):
- [ ] Node.js 18+ (https://nodejs.org/)
- [ ] PostgreSQL 14+ (https://www.postgresql.org/download/)
- [ ] Git (https://git-scm.com/)

---

## 📥 1. Clone o Repositório

```bash
git clone https://github.com/mgutoas-svg/finance-ai.git
cd finance-ai
```

---

## 🗄️ 2. Setup Database (PostgreSQL Local)

### Windows:
```bash
# Instalar PostgreSQL (se não tiver)
# https://www.postgresql.org/download/windows/

# Ou usar Docker (mais fácil):
docker run --name finance-db ^
  -e POSTGRES_PASSWORD=password ^
  -e POSTGRES_DB=finance_ai ^
  -p 5432:5432 ^
  -d postgres:15
```

### Mac/Linux:
```bash
docker run --name finance-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=finance_ai \
  -p 5432:5432 \
  -d postgres:15
```

**Resultado esperado:** Conexão em `localhost:5432`

---

## 🔧 3. Setup Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
# Windows: type nul > .env
# Mac/Linux: touch .env

# Adicionar ao .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_ai"
JWT_SECRET="dev-secret-key-change-in-production"
ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
STRIPE_API_KEY="sk_test_123456789"
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

### Setup Database Schema

**IMPORTANTE: Você tem 2 opções**

#### Opção A: Usar Prisma 7 (Recomendado)
```bash
# Remover Prisma 8
npm uninstall prisma @prisma/client

# Instalar Prisma 7
npm install --save-dev @prisma/prisma7@7
npm install @prisma/client@^5.0.0

# Rodar migration
npx prisma migrate dev --name init

# Ou:
npx prisma7 migrate dev
```

#### Opção B: Usar Prisma DB Push (Mais rápido)
```bash
# Se tiver Prisma 8 (alternativa simples)
npx prisma db push
```

### Testar Conexão Backend

```bash
npm run dev
```

**Esperado:**
```
✓ Backend running on port 3001
✓ Database connected
```

---

## ⚛️ 4. Setup Frontend

**Em novo terminal:**

```bash
cd frontend

# Instalar dependências
npm install

# Rodar
npm run dev
```

**Esperado:**
```
✓ Frontend running on http://localhost:3000
```

---

## 🎯 5. Testar Fluxo Completo

### 1️⃣ Criar Conta
1. Abra http://localhost:3000
2. Clique em "Sign up"
3. Preencha:
   - Email: `teste@email.com`
   - Senha: `Senha123!`
4. Clique "Sign up"

**Esperado:** Redireciona para Dashboard

### 2️⃣ Dashboard
- Vê saldo $0
- Vê "No transactions yet"
- Vê botões: View Transactions, Upload File, Upgrade Plan

### 3️⃣ Criar Transação Manual
```bash
# Terminal (com backend rodando):
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "temp-account-id",
    "date": "2026-11-17T10:00:00Z",
    "description": "Salário",
    "amount": 5000,
    "type": "income"
  }'
```

**OU via Frontend:**
1. Clique "View Transactions"
2. Ver formulário para criar transação manualmente

### 4️⃣ Testar Orçamentos (NOVO - Sprint 1)
```bash
# Criar orçamento
curl -X POST http://localhost:3001/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Alimentação",
    "limit": 1000,
    "period": "monthly"
  }'

# Listar orçamentos
curl -X GET http://localhost:3001/budgets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5️⃣ Testar Analytics
```bash
# Health score
curl -X GET http://localhost:3001/analytics/health \
  -H "Authorization: Bearer YOUR_TOKEN"

# Métricas
curl -X GET http://localhost:3001/analytics/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Checklist de Testes

Marque conforme testar:

- [ ] Database conectado
- [ ] Backend rodando em 3001
- [ ] Frontend rodando em 3000
- [ ] Conseguir fazer signup
- [ ] Conseguir fazer login
- [ ] Dashboard carrega
- [ ] Listar transações (vazio)
- [ ] Criar transação via API
- [ ] Criar orçamento via API
- [ ] Listar orçamentos via API
- [ ] Analytics endpoints funcionam

---

## 🐛 Troubleshooting

### "Database connection refused"
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT 1"

# Se Docker:
docker ps | grep finance-db
```

### "Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001

# Matar processo e rodar em porta diferente
# Frontend pode rodar em 3000, backend em 3002
```

### "Prisma migration error"
```bash
# Resetar database (CUIDADO - deleta tudo)
npx prisma migrate reset

# Ou:
npx prisma db push --skip-generate
```

### "npm install fails"
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

---

## 📡 Como Obter Token para Testes

```bash
# 1. Fazer login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "Senha123!"
  }'

# Resposta:
{
  "user": { "id": "...", "email": "teste@email.com", "tenantId": "..." },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}

# 2. Copiar accessToken
# 3. Usar em curl com: -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Testar Endpoints Via Postman (Alternativa)

1. Download Postman: https://www.postman.com/downloads/
2. Criar nova Collection "Finance AI"
3. Adicionar Requests:

**POST /auth/signup**
```json
{
  "email": "teste@email.com",
  "password": "Senha123!"
}
```

**POST /auth/login**
```json
{
  "email": "teste@email.com",
  "password": "Senha123!"
}
```

**POST /transactions** (com Auth header)
```json
{
  "accountId": "temp",
  "date": "2026-11-17T10:00:00Z",
  "description": "Test",
  "amount": 100,
  "type": "income"
}
```

---

## ✅ Pronto!

Quando todos os itens do checklist passarem, você tem:
- ✅ Backend funcionando
- ✅ Frontend funcionando
- ✅ Database conectado
- ✅ Auth funcionando
- ✅ APIs respondendo
- ✅ Ready para VPS

---

## 🚀 Próxima Etapa: Deploy em VPS

Quando tiver um VPS, siga `DEPLOY-VPS.md` (vou criar)

Basicamente:
1. Comprar VPS (DigitalOcean, Linode, AWS)
2. SSH para VPS
3. Instalar Node + PostgreSQL
4. Git clone
5. npm install + configure .env
6. npm run build
7. PM2 para manter rodando
8. Nginx como reverse proxy
9. SSL certificate (Let's Encrypt)

---

## 📝 Logs Úteis

```bash
# Ver logs backend em tempo real
# (Terminal já aberto, Ctrl+C para parar)

# Ver logs frontend
# (Terminal já aberto, Ctrl+C para parar)

# Ver logs database
docker logs finance-db

# Ver containers rodando
docker ps
```

---

## 💾 Dados de Teste

Depois de criado, você pode:

```bash
# Exportar dados
pg_dump -U postgres -d finance_ai > backup.sql

# Restaurar
psql -U postgres -d finance_ai < backup.sql

# Limpar database
npx prisma migrate reset
```

---

## 🎯 Success!

Se chegou aqui e tudo funcionou:

✅ **Parabéns! Sistema 100% testado localmente**

Próximo: Preparar VPS para produção.

---

**Precisando de ajuda?**
- Reread este arquivo
- Ou ask no Discord/Slack

Good luck! 🚀
