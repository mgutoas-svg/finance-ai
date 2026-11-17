# Próximos Passos - Implementação Roadmap

## ✅ Status Atual (Hoje)

**MVP está funcionando com:**
- ✅ Autenticação JWT
- ✅ Transactions CRUD
- ✅ Upload PDF/OFX (parser)
- ✅ Stripe Payments
- ✅ Open Finance scaffold
- ✅ Analytics (NPS, Health Score)
- ✅ Multi-tenancy

**Commits:**
```
64c2d6e - Initial MVP
6fff877 - Phase 2 (Files, Open Finance)
62e5a90 - Phase 3 (Analytics)
d5bbe3b - Roadmap
```

---

## 🎯 Semana 1: Budget System (COMEÇAR AGORA)

### Backend Tasks:
```bash
# 1. Add Budget model to Prisma
# File: backend/prisma/schema.prisma

model Budget {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category  String   // "Alimentação", "Transporte", etc
  limit     Float
  period    String   @default("monthly") // "monthly", "weekly", "annual"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([tenantId])
  @@unique([tenantId, category, period])
}

# 2. Create Budget service
# File: backend/src/budgets/budgets.service.ts

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}
  
  async create(tenantId: string, data: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: { ...data, tenantId }
    });
  }
  
  async findAll(tenantId: string) {
    return this.prisma.budget.findMany({
      where: { tenantId }
    });
  }
  
  async getSpent(tenantId: string, categoryId: string, period: string) {
    // Calcula quanto foi gasto vs orçado
    const budget = await this.prisma.budget.findUnique({
      where: { id: categoryId }
    });
    
    const dateFrom = this.getPeriodStart(period);
    const spent = await this.prisma.transaction.aggregate({
      where: {
        account: { tenantId },
        date: { gte: dateFrom },
        type: 'expense',
        description: { contains: budget.category }
      },
      _sum: { amount: true }
    });
    
    return {
      limit: budget.limit,
      spent: spent._sum.amount || 0,
      percentage: ((spent._sum.amount || 0) / budget.limit) * 100,
      remaining: budget.limit - (spent._sum.amount || 0)
    };
  }
}

# 3. Create Budget controller
# File: backend/src/budgets/budgets.controller.ts

@Controller('budgets')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class BudgetsController {
  constructor(private budgets: BudgetsService) {}
  
  @Post()
  async create(@Body() body: CreateBudgetDto, @Req() req) {
    return this.budgets.create(req.tenantId, body);
  }
  
  @Get()
  async list(@Req() req) {
    return this.budgets.findAll(req.tenantId);
  }
  
  @Get(':id/spent')
  async getSpent(@Param('id') id: string) {
    return this.budgets.getSpent(id);
  }
}

# 4. Run migration
npx prisma migrate dev --name add_budgets
```

### Frontend Tasks:
```bash
# 1. Create Budget page
# File: frontend/src/pages/BudgetPage.tsx

import { useState, useEffect } from 'react';
import api from '../services/api';

export function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  
  useEffect(() => {
    const fetch = async () => {
      const { data } = await api.get('/budgets');
      setBudgets(data);
    };
    fetch();
  }, []);
  
  return (
    <div className="p-8">
      <h1>Orçamentos</h1>
      {budgets.map(budget => (
        <div key={budget.id} className="bg-gray-800 p-4 rounded mb-4">
          <h3>{budget.category}</h3>
          <p>Limite: R${budget.limit}</p>
          <p>Período: {budget.period}</p>
        </div>
      ))}
    </div>
  );
}

# 2. Add to API service
# File: frontend/src/services/api.ts

export const budgetsAPI = {
  list: () => api.get('/budgets'),
  create: (data) => api.post('/budgets', data),
  getSpent: (id) => api.get(`/budgets/${id}/spent`),
};

# 3. Add route to App.tsx
<Route path="/budgets" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
```

### Testing:
```bash
# 1. Test endpoint
curl -X POST http://localhost:3001/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Alimentação",
    "limit": 1000,
    "period": "monthly"
  }'

# Expected response:
{
  "id": "cuid123",
  "tenantId": "tenant123",
  "category": "Alimentação",
  "limit": 1000,
  "period": "monthly"
}

# 2. Get spent amount
curl http://localhost:3001/budgets/cuid123/spent \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected:
{
  "limit": 1000,
  "spent": 350,
  "percentage": 35,
  "remaining": 650
}
```

### Checklist Semana 1:
- [ ] Prisma schema + migration
- [ ] BudgetsService completo
- [ ] BudgetsController funcional
- [ ] Frontend BudgetPage básica
- [ ] API endpoints testados
- [ ] Commit com "feat: add budget system"

---

## 🎯 Semana 2: Goals System

Seguir padrão similar ao Budget:
1. Model em Prisma
2. Service (create, read, getProgress)
3. Controller
4. Frontend page
5. Test

**Padrão se repete para todas as features!**

---

## 🚀 Como Executar

### Setup
```bash
cd f:\SAAS

# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs (quando implementar Swagger)

---

## 📊 Monitoramento de Progresso

### Semana 1-2 (Budget + Goals)
- [ ] 2 models no DB
- [ ] 4 services criados
- [ ] 4 controllers criados
- [ ] 2 páginas no frontend
- [ ] 80% tests passando

### Semana 3-4 (Alerts + Recurrents)
- [ ] Sistema de alertas funcionando
- [ ] Email alerts enviando
- [ ] Recorrentes criadas automaticamente
- [ ] Cron job verificado

### Semana 5-6 (Bank Accounts + Credit Cards)
- [ ] Contas bancárias CRUD
- [ ] Cartões de crédito CRUD
- [ ] Fatura agregada
- [ ] Alerta de vencimento

### ...continue para 12 sprints

---

## 💡 Tips para Manter Ritmo

1. **Faça commit a cada feature** (não aguarde semana inteira)
2. **Teste no frontend imediatamente** (não deixe pra depois)
3. **Use o mesmo padrão** para todas as features (Model → Service → Controller → Frontend)
4. **Reutilize componentes** (ProtectedRoute, useQuery, etc)
5. **Documente enquanto faz** (não deixa pra final)

---

## 📋 Padrão de Implementação

Todos os CRUD seguem este padrão:

### Backend
```typescript
// 1. Model em schema.prisma
model Feature {
  id        String @id @default(cuid())
  tenantId  String
  // ... campos
  createdAt DateTime @default(now())
  @@index([tenantId])
}

// 2. Service
@Injectable()
export class FeaturesService {
  async create(tenantId, data) { }
  async findAll(tenantId) { }
  async findOne(tenantId, id) { }
  async update(tenantId, id, data) { }
  async delete(tenantId, id) { }
}

// 3. Controller
@Controller('features')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class FeaturesController {
  @Post() async create(...)
  @Get() async list(...)
  @Get(':id') async getOne(...)
  @Patch(':id') async update(...)
  @Delete(':id') async delete(...)
}

// 4. Module
@Module({
  providers: [FeaturesService, PrismaService],
  controllers: [FeaturesController],
})
```

### Frontend
```typescript
// 1. API service
export const featuresAPI = {
  list: () => api.get('/features'),
  create: (data) => api.post('/features', data),
  get: (id) => api.get(`/features/${id}`),
  update: (id, data) => api.patch(`/features/${id}`, data),
  delete: (id) => api.delete(`/features/${id}`),
};

// 2. Page
export function FeaturesPage() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch data }, []);
  return JSX;
}

// 3. Route
<Route path="/features" element={<ProtectedRoute><FeaturesPage /></ProtectedRoute>} />
```

---

## 🎯 Goal: Semana 1

**Objetivo:** Ter Budget + Goals funcionando no frontend.

**Resultado esperado:**
- Usuário pode criar orçamento de "Alimentação" com limite de R$1000
- Sistema avisa quando gasta acima de 80%
- Usuário pode criar meta "Juntar 10k" com deadline
- Dashboard mostra progresso da meta

**Success = estes 2 features funcionando completamente**

---

## ❓ Dúvidas Comuns

**P: Por onde começo?**
R: Sprint 1 - Budget. Siga o guia acima passo a passo.

**P: Quando começo Mês 2?**
R: Quando Sprint 1-2 estiverem 100% prontos (semana 2 completa).

**P: Preciso testar tudo?**
R: Sim. Pelo menos fluxo completo no frontend.

**P: Quanto tempo cada sprint?**
R: ~40-50 horas para alguém experiente. Você pode ajustar.

---

## 🚀 Próximo Commit

Quando terminar Sprint 1, o commit será:

```bash
git commit -m "feat: add budget system (Sprint 1)

- Backend: Budget model, service, controller
- Frontend: BudgetPage with CRUD
- Features: Create, list, check spent vs limit
- Tests: All endpoints verified

Co-Authored-By: Claude Haiku <noreply@anthropic.com>"
```

---

## ✅ Pronto?

Quer que eu comece a implementar Sprint 1 (Budget)?

Ou tem dúvidas sobre o roadmap antes?
