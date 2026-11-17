# Finance AI - Features Financeiras Avançadas

## 📊 Conceitos Integrados

O Finance AI integra conceitos avançados de finanças pessoais baseados nas skills de educação financeira:

### 1. **NPS (Net Promoter Score) - Satisfação Financeira**
- Score de 0-100 baseado em:
  - Taxa de poupança (ideal: >20%)
  - Índice de despesas (ideal: <60%)
  - Superávit mensal

### 2. **Fundo de Emergência**
- Recomendação: 3-6 meses de despesas
- Cálculo automático baseado no histórico
- Alerta quando abaixo da recomendação
- Meta: cobrir despesas inesperadas

### 3. **Health Score (Saúde Financeira)**
- Métrica 0-100 que combina:
  - Fundo de emergência (30 pontos)
  - NPS/Satisfação (20 pontos)
  - Poupança consistente (30 pontos)
  - Controle de gastos (20 pontos)

### 4. **Taxa de Poupança**
- Percentual de renda que você poupa
- Fórmula: `(Receita - Despesas) / Receita × 100%`
- Ideal: 20-35%
- Metas: 10% (mínimo), 20% (bom), 35%+ (excelente)

### 5. **Índice de Despesas (Expense Ratio)**
- Percentual de renda gasto
- Fórmula: `Despesas / Receita × 100%`
- Ideal: <60%
- Alerta: >80%

### 6. **Categorização de Despesas**
Análise automática por categoria:
- 🍔 Alimentação (mercado, restaurante)
- 🚗 Transporte (Uber, combustível)
- 🏠 Moradia (aluguel, condomínio)
- 🏥 Saúde (médico, farmácia)
- 📚 Educação (cursos, aulas)
- 🎬 Entretenimento (cinema, lazer)
- 📋 Outros

### 7. **Recomendações Personalizadas**
Sistema inteligente que sugere:
- Como aumentar taxa de poupança
- Como reduzir despesas
- Quando construir fundo de emergência
- Oportunidades de investimento
- Aviso de gastos excessivos

### 8. **Previsão de Fluxo de Caixa**
- Despesas mensais médias
- Receita mensal média
- Projeção de saldo futuro
- Baseado em últimos 90 dias

## 🎯 Endpoints de Analytics

### GET `/analytics/metrics`
Retorna métricas financeiras principais:
```json
{
  "totalIncome": 5000,
  "totalExpenses": 3500,
  "netBalance": 1500,
  "monthlyAverage": 1500,
  "expenseRatio": 70,
  "savingsRate": 30
}
```

### GET `/analytics/health`
Retorna saúde financeira completa:
```json
{
  "healthScore": 72,
  "nps": 65,
  "emergencyFundMonths": 2.5,
  "recommendations": [
    "💰 Aumente sua taxa de poupança para pelo menos 10%",
    "💡 Continue construindo seu fundo de emergência para 6 meses"
  ]
}
```

### GET `/analytics/categories`
Retorna análise por categoria de despesas:
```json
[
  { "name": "Alimentação", "value": 800 },
  { "name": "Transporte", "value": 500 },
  { "name": "Moradia", "value": 1200 }
]
```

### GET `/analytics/forecast`
Retorna previsões de fluxo de caixa:
```json
{
  "monthlyExpenses": 1166.67,
  "monthlyIncome": 1666.67,
  "projectedBalance": 500,
  "savingsRate": 30
}
```

## 📱 Frontend Pages

### Dashboard (/)
- Resumo do mês
- 3 cards principais (saldo, receita, despesa)
- Últimas transações
- Links rápidos

### Analytics (/analytics)
- Health Score visual
- NPS com cor (green/yellow/red)
- Emergency Fund status
- Métricas detalhadas
- Gráfico de categorias
- Recomendações personalizadas

### Transactions (/transactions)
- Lista completa com filtros
- Por período (data)
- Delete com confirmação
- Fonte (manual, PDF, OFX, Open Finance)

### Upload (/upload)
- Drag-drop de PDFs e OFX
- Parsing automático
- Preview de transações encontradas
- Confirmação de import

### Subscription (/subscription)
- 3 planos (Free, Basic, Pro)
- Integração Stripe
- Features por plano
- FAQ

### Open Finance (/open-finance)
- Conexão com banco
- Redirect seguro Bacen
- Real-time sync
- Múltiplas contas

## 🔄 Fluxo de Dados

```
Transações (Manual/PDF/OFX/Open Finance)
        ↓
Database (Prisma + PostgreSQL)
        ↓
Analytics Service (Cálculos)
        ↓
Frontend (Visualização)
```

## 🛡️ Segurança Financeira

✅ AES-256 encryption para dados sensíveis
✅ Multi-tenancy - dados isolados por tenant
✅ LGPD compliant - consentimento explícito
✅ Auditoria - log de todas as ações
✅ Soft delete - preserva histórico

## 📈 Próximas Features

- [ ] Metas financeiras com progresso
- [ ] Investimentos (tipos, alocação)
- [ ] Aposentadoria (cálculo, projeção)
- [ ] Dívidas (acompanhamento, quitação)
- [ ] Relatórios PDF exportáveis
- [ ] Integração com investimentos (B3, corretoras)
- [ ] IA para insights avançados
- [ ] Alertas por SMS/Email
- [ ] Mobile app nativa
