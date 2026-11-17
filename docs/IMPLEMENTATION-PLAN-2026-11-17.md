# Finance-AI MVP Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans or superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Build a complete, production-ready SaaS MVP with NestJS backend, React frontend, PostgreSQL database, Stripe payments, and Bacen Open Finance integration.

**Architecture:** NestJS monorepo with separate frontend (React) and backend services, PostgreSQL with row-level security for multi-tenancy, Stripe webhooks, Open Finance via JWT tokens.

**Tech Stack:** NestJS 10, React 18, TypeScript, Prisma ORM, PostgreSQL 15, Stripe SDK, TanStack Query, Tailwind CSS.

**Spec:** `f:\SAAS\docs\MVP-DESIGN-2026-11-17.md`

---

## Global Constraints

- Node.js ≥ 18.x, npm ≥ 9.x
- PostgreSQL ≥ 14.x (local or Supabase)
- All sensitive data (bank credentials, CPF) must be AES-256 encrypted at rest
- JWT tokens expire in 3600s, refresh tokens valid 7 days
- All database migrations must support rollback
- LGPD compliance: audit logs for all data access, soft deletes only
- Multi-tenancy via row-level security (RLS) in PostgreSQL
- No sensitive data in logs or cookies

---

## Review Focus

| Input/Condition | Expected Behavior | Owning Task |
|---|---|---|
| User attempts cross-tenant data access | 403 Forbidden, audit logged | Task 7: Multi-tenancy |
| Payment webhook from Stripe arrives twice | Idempotent, subscription updated once | Task 8: Stripe Webhooks |
| Malformed PDF uploaded | Graceful error, file rejected with reason | Task 5: PDF Parser |
| Open Finance token expired | Auto-refresh via Bacen, or redirect to reconnect | Task 10: Open Finance |
| User requests data deletion (LGPD) | All PII deleted, audit trail preserved, within 30 days | Task 11: LGPD Compliance |

---

## File Structure

```
f:\SAAS\
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── 2fa.service.ts
│   │   │   └── auth.module.ts
│   │   ├── tenants/
│   │   │   ├── tenant.guard.ts
│   │   │   ├── tenant.interceptor.ts
│   │   │   └── tenants.module.ts
│   │   ├── transactions/
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   ├── dto/ (CreateTransactionDto, etc)
│   │   │   └── transactions.module.ts
│   │   ├── files/
│   │   │   ├── files.controller.ts
│   │   │   ├── files.service.ts
│   │   │   ├── parsers/ (pdf.parser.ts, ofx.parser.ts)
│   │   │   └── files.module.ts
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── stripe.service.ts
│   │   │   └── payments.module.ts
│   │   ├── open-finance/
│   │   │   ├── open-finance.controller.ts
│   │   │   ├── open-finance.service.ts
│   │   │   ├── bacen.client.ts
│   │   │   └── open-finance.module.ts
│   │   ├── security/
│   │   │   ├── encryption.service.ts
│   │   │   ├── validation.pipes.ts
│   │   │   └── security.module.ts
│   │   ├── audit/
│   │   │   ├── audit.service.ts
│   │   │   └── audit.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/ (Login, Signup, 2FA)
│   │   │   ├── Dashboard/
│   │   │   ├── Transactions/
│   │   │   ├── Upload/
│   │   │   ├── OpenFinance/
│   │   │   └── Subscription/
│   │   ├── pages/
│   │   ├── services/ (api.ts, useQuery hooks)
│   │   ├── context/ (AuthContext, TenantContext)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── MVP-DESIGN-2026-11-17.md
│   └── IMPLEMENTATION-PLAN-2026-11-17.md
└── .gitignore
```

---

## Task 1: Repository Setup & Dependencies

**Files:**
- Create: `backend/package.json`, `backend/tsconfig.json`, `backend/src/main.ts`
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/src/main.tsx`
- Create: `.gitignore`, `backend/.env.example`

**Interfaces:**
- Produces: NestJS and React projects ready to run, with all dependencies installed

**Steps:**

- [ ] Initialize backend: `npx @nestjs/cli@latest new backend` (or manual setup)
- [ ] Install backend deps: `npm install --save @nestjs/common @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs prisma @prisma/client stripe axios`
- [ ] Install backend dev deps: `npm install --save-dev @types/express jest @types/jest ts-jest`
- [ ] Initialize frontend: `npm create vite@latest frontend -- --template react-ts`
- [ ] Install frontend deps: `npm install axios react-query @tanstack/react-query recharts tailwindcss react-hook-form`
- [ ] Create `.gitignore` (node_modules, .env, dist, build, coverage)
- [ ] Create `backend/.env.example` with: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_API_KEY`, `BACEN_CLIENT_ID`
- [ ] Run `npm run build` in both directories to verify no errors
- [ ] Commit: `git add . && git commit -m "chore: initial project setup with NestJS and React"`

---

## Task 2: Database Schema & Migrations

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/001_initial.sql` (manual)

**Interfaces:**
- Produces: PostgreSQL schema with 9 tables (users, tenants, subscriptions, accounts, transactions, files, audit_logs, audit_consent, open_finance_tokens)
- Each table has encrypted fields where needed (marked with @db.Text + encryption in service layer)

**Steps:**

- [ ] Create `backend/prisma/schema.prisma` with Prisma models:
  - `User` (id, email, passwordHash, tenantId, role, twoFactorSecret, createdAt)
  - `Tenant` (id, name, type: 'personal'|'consultant', ownerId, createdAt)
  - `Subscription` (id, tenantId, stripeCustomerId, plan, status, startDate, endDate)
  - `Account` (id, tenantId, bankCode, openFinanceId, encryptedCredentials, syncedAt)
  - `Transaction` (id, accountId, date, description, amount, encryptedData, source: 'manual'|'pdf'|'ofx'|'open_finance')
  - `File` (id, tenantId, type: 'pdf'|'ofx', url, parsedData, uploadedAt)
  - `AuditLog` (id, tenantId, action, userId, description, createdAt)
  - `AuditConsent` (id, tenantId, type: 'lgpd'|'open_finance', acceptedAt)
  - `OpenFinanceToken` (id, accountId, encryptedAccessToken, encryptedRefreshToken, expiresAt)

- [ ] Add `@db.Text` to fields that will be encrypted (credentials, tokens, sensitive data)
- [ ] Add unique constraints: `unique(email)` on User, `unique(stripeCustomerId)` on Subscription
- [ ] Run `npx prisma migrate dev --name initial` to generate migration
- [ ] Test schema: `npx prisma db push` (or migrate deploy)
- [ ] Commit: `git add prisma/ && git commit -m "feat: define database schema with 9 tables and encryption markers"`

---

## Task 3: Authentication (JWT + 2FA)

**Files:**
- Create: `backend/src/auth/auth.module.ts`
- Create: `backend/src/auth/auth.service.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Create: `backend/src/auth/jwt.strategy.ts`
- Create: `backend/src/auth/2fa.service.ts`
- Create: `backend/src/auth/dto/signup.dto.ts`, `login.dto.ts`
- Create: `backend/test/auth.e2e-spec.ts`

**Interfaces:**
- Produces:
  - `AuthService.signup(email, password): {user, accessToken, refreshToken}`
  - `AuthService.login(email, password): {user, accessToken, refreshToken}`
  - `AuthService.verify2FA(userId, code): boolean`
  - `AuthService.refreshToken(refreshToken): {accessToken}`
  - `JwtGuard` for route protection
  - `@User()` decorator to inject current user

**Steps:**

- [ ] Write failing test: `test/auth.e2e-spec.ts` with:
  - POST /auth/signup → 201, returns user + tokens
  - POST /auth/login → 200, returns user + tokens
  - POST /auth/login with wrong password → 401
  - POST /auth/refresh → 200, returns new accessToken
  - GET /user (protected) → 200, returns user; without token → 401

- [ ] Create `auth/auth.service.ts`:
  - `signup(email, password)`: hash password with bcryptjs, create User record, generate JWT tokens
  - `login(email, password)`: verify password, generate tokens
  - `verify2FA(userId, code)`: use speakeasy or similar
  - `refreshToken(token)`: verify refresh token, issue new accessToken

- [ ] Create `auth/jwt.strategy.ts`: NestJS Passport JWT strategy

- [ ] Create `auth/auth.controller.ts`:
  - POST /auth/signup
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/2fa/setup (generate secret)
  - POST /auth/2fa/verify

- [ ] Create `JwtGuard` and `@User()` decorator in `auth/auth.module.ts`

- [ ] Run test: `npm run test:e2e` → all tests pass

- [ ] Commit: `git add src/auth test/auth.e2e-spec.ts && git commit -m "feat: add JWT authentication with 2FA"`

---

## Task 4: Multi-Tenancy (Tenant Guard + Interceptor)

**Files:**
- Create: `backend/src/tenants/tenant.guard.ts`
- Create: `backend/src/tenants/tenant.interceptor.ts`
- Create: `backend/test/tenants.e2e-spec.ts`

**Interfaces:**
- Produces:
  - `TenantGuard`: extracts tenantId from JWT or request, blocks if mismatch
  - `TenantInterceptor`: injects tenantId into every query automatically
  - Row-level security: all queries filtered by tenant_id

**Steps:**

- [ ] Write failing test:
  - User A creates transaction in Tenant A
  - User B (different tenant) cannot read User A's transaction → 403
  - User A's requests automatically filtered to only Tenant A data

- [ ] Create `tenant.guard.ts`: 
  - Extract `tenantId` from JWT claims
  - Verify user belongs to tenant
  - Attach to request object

- [ ] Create `tenant.interceptor.ts`:
  - Automatically append `where: {tenantId}` to all Prisma queries
  - Or use row-level security at DB level

- [ ] Create `tenants.module.ts` with guard + interceptor exported

- [ ] Add guard to controllers: `@UseGuards(TenantGuard)`

- [ ] Run test → all pass, cross-tenant access blocked

- [ ] Commit: `git add src/tenants test/tenants.e2e-spec.ts && git commit -m "feat: add multi-tenancy with tenant guard and interceptor"`

---

## Task 5: Transactions CRUD

**Files:**
- Create: `backend/src/transactions/transactions.service.ts`
- Create: `backend/src/transactions/transactions.controller.ts`
- Create: `backend/src/transactions/dto/create-transaction.dto.ts`
- Create: `backend/test/transactions.e2e-spec.ts`

**Interfaces:**
- Consumes: `JwtGuard`, `TenantGuard` from Task 3-4
- Produces:
  - `TransactionsService.create(tenantId, data): Transaction`
  - `TransactionsService.findAll(tenantId, filters): Transaction[]`
  - `TransactionsService.findOne(tenantId, id): Transaction`
  - `TransactionsService.update(tenantId, id, data): Transaction`
  - `TransactionsService.delete(tenantId, id): void`

**Steps:**

- [ ] Write failing test: CRUD operations (create, list, filter, update, delete)

- [ ] Create `dto/create-transaction.dto.ts`: date, description, amount, type (income/expense)

- [ ] Create `transactions.service.ts`: implement 5 methods above using Prisma

- [ ] Create `transactions.controller.ts`:
  - POST /transactions → create
  - GET /transactions?from=&to= → list with date filter
  - GET /transactions/:id → read one
  - PATCH /transactions/:id → update
  - DELETE /transactions/:id → soft delete

- [ ] Add `@UseGuards(JwtGuard, TenantGuard)` to all endpoints

- [ ] Run test → pass

- [ ] Commit: `git add src/transactions test/transactions.e2e-spec.ts && git commit -m "feat: add transaction CRUD endpoints"`

---

## Task 6: File Upload & PDF/OFX Parser

**Files:**
- Create: `backend/src/files/files.service.ts`
- Create: `backend/src/files/files.controller.ts`
- Create: `backend/src/files/parsers/pdf.parser.ts`
- Create: `backend/src/files/parsers/ofx.parser.ts`
- Create: `backend/test/files.e2e-spec.ts`

**Interfaces:**
- Consumes: `TransactionsService.create()` from Task 5
- Produces:
  - `FilesService.uploadPDF(file): {fileId, transactionCount}`
  - `FilesService.uploadOFX(file): {fileId, transactionCount}`
  - Parsers return: `{date, description, amount, type}`

**Steps:**

- [ ] Install: `npm install pdf-parse xml2js multer @types/multer`

- [ ] Write failing test: upload PDF → parse → create transactions; upload OFX → same

- [ ] Create `parsers/pdf.parser.ts`:
  - Use `pdf-parse` to extract text
  - Regex to find patterns: date, amount, description
  - Return array of `{date, description, amount, type}`

- [ ] Create `parsers/ofx.parser.ts`:
  - Use `xml2js` to parse OFX XML
  - Extract `<STMTRS>` → transactions
  - Return array of `{date, description, amount, type}`

- [ ] Create `files.service.ts`:
  - `uploadPDF()`: call parser, create transactions via `TransactionsService.create()`
  - `uploadOFX()`: same
  - Store file record in DB with parsed metadata

- [ ] Create `files.controller.ts`:
  - POST /files/upload (multipart)
  - GET /files/{fileId} (retrieve metadata)

- [ ] Run test → pass

- [ ] Commit: `git add src/files test/files.e2e-spec.ts && git commit -m "feat: add PDF and OFX file parsing and upload"`

---

## Task 7: Encryption Service (AES-256)

**Files:**
- Create: `backend/src/security/encryption.service.ts`
- Create: `backend/test/encryption.spec.ts`

**Interfaces:**
- Produces:
  - `EncryptionService.encrypt(plaintext): ciphertext`
  - `EncryptionService.decrypt(ciphertext): plaintext`
  - Used in Account (credentials), OpenFinanceToken (tokens), sensitive transaction data

**Steps:**

- [ ] Install: `npm install crypto-js`

- [ ] Write test: encrypt/decrypt roundtrip for bank credentials, tokens, CPF

- [ ] Create `encryption.service.ts`:
  - Use `crypto.createCipheriv()` with AES-256-GCM
  - Key from environment: `ENCRYPTION_KEY` (32 bytes hex)
  - Randomly generate IV per encryption
  - Return: `base64(iv + ciphertext + authTag)`

- [ ] Add method to decrypt: parse IV, ciphertext, authTag; decrypt

- [ ] Run test → pass

- [ ] Commit: `git add src/security/encryption.service.ts test/encryption.spec.ts && git commit -m "feat: add AES-256 encryption service for sensitive data"`

---

## Task 8: Stripe Integration (Payments + Webhooks)

**Files:**
- Create: `backend/src/payments/payments.service.ts`
- Create: `backend/src/payments/stripe.service.ts`
- Create: `backend/src/payments/payments.controller.ts`
- Create: `backend/test/payments.e2e-spec.ts`

**Interfaces:**
- Consumes: `EncryptionService` from Task 7
- Produces:
  - `StripeService.createCheckoutSession(tenantId, planId): {sessionId, url}`
  - `StripeService.handleWebhook(event): {success: boolean}`
  - `PaymentsService.updateSubscription(tenantId, status)`: update DB

**Steps:**

- [ ] Write failing test: create checkout → redirect to Stripe; webhook payment success → update subscription to "active"

- [ ] Create `stripe.service.ts`:
  - `createCheckoutSession()`: call `stripe.checkout.sessions.create()` with line items
  - Define 3 plans: "free" (0), "basic" ($9/mo), "pro" ($29/mo)

- [ ] Create `payments.controller.ts`:
  - POST /payments/checkout → create session, return sessionId + redirectUrl
  - POST /payments/webhook (verify Stripe signature) → handle `payment_intent.succeeded`, `customer.subscription.deleted`

- [ ] Create `payments.service.ts`:
  - `updateSubscription(tenantId, planId, status)`: update Subscription record

- [ ] Add idempotency: webhook handler checks if Subscription already updated before proceeding

- [ ] Run test → pass

- [ ] Commit: `git add src/payments test/payments.e2e-spec.ts && git commit -m "feat: add Stripe checkout and webhook handling"`

---

## Task 9: Open Finance (Bacen Integration)

**Files:**
- Create: `backend/src/open-finance/bacen.client.ts`
- Create: `backend/src/open-finance/open-finance.service.ts`
- Create: `backend/src/open-finance/open-finance.controller.ts`
- Create: `backend/test/open-finance.e2e-spec.ts`

**Interfaces:**
- Consumes: `EncryptionService` from Task 7
- Produces:
  - `BacenClient.getAuthorizationUrl()`: redirect user to Bacen consent screen
  - `BacenClient.exchangeCodeForToken(code): {accessToken, refreshToken}`
  - `OpenFinanceService.fetchAccounts(tenantId): Account[]`
  - `OpenFinanceService.fetchTransactions(accountId): Transaction[]`

**Steps:**

- [ ] Install: `npm install uuid qs`

- [ ] Write failing test: redirect to auth → exchange code → fetch accounts → sync transactions

- [ ] Create `bacen.client.ts`:
  - `getAuthorizationUrl()`: build Bacen OAuth URL with client_id, redirect_uri, scope
  - `exchangeCodeForToken()`: POST to Bacen token endpoint, return tokens
  - `fetchData()`: call Bacen APIs with accessToken (GET /accounts, GET /transactions)

- [ ] Create `open-finance.service.ts`:
  - `initiateConnection()`: return auth URL
  - `handleCallback(code)`: exchange code, store encrypted tokens in DB
  - `syncAccounts()`: call Bacen, create Account records
  - `syncTransactions(accountId)`: fetch and create Transaction records

- [ ] Create `open-finance.controller.ts`:
  - GET /open-finance/authorize → return Bacen URL
  - GET /open-finance/callback?code= → handle redirect
  - POST /open-finance/sync → manually trigger sync

- [ ] Run test → pass (use mock Bacen responses)

- [ ] Commit: `git add src/open-finance test/open-finance.e2e-spec.ts && git commit -m "feat: add Bacen Open Finance integration"`

---

## Task 10: Audit & LGPD Compliance

**Files:**
- Create: `backend/src/audit/audit.service.ts`
- Create: `backend/src/audit/audit.interceptor.ts`
- Create: `backend/test/audit.spec.ts`

**Interfaces:**
- Produces:
  - `AuditService.log(tenantId, action, userId, description)`: write to DB
  - `AuditService.deleteUserData(tenantId, userId)`: soft-delete all user data, preserve audit trail
  - Interceptor logs all data access (GET requests)

**Steps:**

- [ ] Write failing test: access transaction → audit log created; delete user → data marked deleted, audit preserved

- [ ] Create `audit.service.ts`:
  - `log()`: insert into AuditLog table
  - `deleteUserData()`: soft-delete transactions/files, keep AuditLog

- [ ] Create `audit.interceptor.ts`:
  - Log successful GET requests (non-sensitive)
  - Don't log passwords, tokens in logs

- [ ] Add interceptor globally to `app.module.ts`

- [ ] Add endpoint: DELETE /user/data → trigger `deleteUserData()`

- [ ] Run test → pass

- [ ] Commit: `git add src/audit test/audit.spec.ts && git commit -m "feat: add audit logging and LGPD data deletion"`

---

## Task 11: Backend - React Integration (API Client)

**Files:**
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/services/useAuth.ts`
- Create: `frontend/src/context/AuthContext.tsx`

**Interfaces:**
- Produces:
  - `api.auth.signup()`, `api.auth.login()`, `api.auth.refresh()`
  - `api.transactions.list()`, `api.transactions.create()`, etc.
  - `useAuth()` hook: {user, login, signup, logout}
  - `AuthContext` for global auth state

**Steps:**

- [ ] Create `services/api.ts`: Axios instance with:
  - Base URL: `process.env.REACT_APP_API_URL`
  - Interceptor: add `Authorization: Bearer token` to all requests
  - Interceptor: auto-refresh on 401

- [ ] Create `useAuth()` hook: manage login/signup/logout state

- [ ] Create `AuthContext`: wrap app, provide user + login/logout globally

- [ ] Run frontend: `npm run dev` → no errors

- [ ] Commit: `git add frontend/src/services frontend/src/context && git commit -m "feat: add API client and auth context"`

---

## Task 12: React Frontend - Core Pages

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/SignupPage.tsx`
- Create: `frontend/src/pages/DashboardPage.tsx`
- Create: `frontend/src/components/ProtectedRoute.tsx`
- Create: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `api` from Task 11
- Produces: working login/signup/dashboard flow

**Steps:**

- [ ] Create `LoginPage.tsx`: form with email/password, submit → `useAuth().login()`

- [ ] Create `SignupPage.tsx`: form, submit → `useAuth().signup()`

- [ ] Create `DashboardPage.tsx`: display user, placeholder for transactions

- [ ] Create `ProtectedRoute.tsx`: redirect to login if not authenticated

- [ ] Create `App.tsx`: routes (/, /login, /signup, /dashboard)

- [ ] Test in browser: signup → login → dashboard

- [ ] Commit: `git add frontend/src/pages frontend/src/components frontend/src/App.tsx && git commit -m "feat: add login, signup, and dashboard pages"`

---

## Task 13: React - Transactions & Upload UI

**Files:**
- Create: `frontend/src/pages/TransactionsPage.tsx`
- Create: `frontend/src/pages/UploadPage.tsx`
- Create: `frontend/src/components/TransactionTable.tsx`

**Interfaces:**
- Consumes: `api.transactions`, `api.files` from Task 11
- Produces: working transaction list and file upload

**Steps:**

- [ ] Create `TransactionTable.tsx`: display transactions, filters by date

- [ ] Create `TransactionsPage.tsx`: use `api.transactions.list()`, render table

- [ ] Create `UploadPage.tsx`: drag-drop or file input → upload PDF/OFX → show progress

- [ ] Test: upload file → transactions appear in list

- [ ] Commit: `git add frontend/src/pages/TransactionsPage.tsx frontend/src/pages/UploadPage.tsx && git commit -m "feat: add transaction list and file upload UI"`

---

## Task 14: React - Stripe & Open Finance UI

**Files:**
- Create: `frontend/src/pages/SubscriptionPage.tsx`
- Create: `frontend/src/pages/OpenFinancePage.tsx`

**Interfaces:**
- Consumes: `api.payments`, `api.openFinance` from Task 11
- Produces: working subscription and Open Finance flows

**Steps:**

- [ ] Create `SubscriptionPage.tsx`: show plans, "Choose Plan" button → redirect to Stripe

- [ ] Create `OpenFinancePage.tsx`: "Connect Bank" button → redirect to Bacen → callback → "Connected"

- [ ] Test: click buttons → redirects work, return to dashboard

- [ ] Commit: `git add frontend/src/pages/SubscriptionPage.tsx frontend/src/pages/OpenFinancePage.tsx && git commit -m "feat: add subscription and Open Finance connection UI"`

---

## Task 15: Deployment & Environment Setup

**Files:**
- Create: `.env` (secrets)
- Create: `backend/deploy.sh`
- Create: `frontend/deploy.sh`
- Create: `docs/DEPLOYMENT.md`

**Steps:**

- [ ] Generate `ENCRYPTION_KEY`: `openssl rand -hex 32`

- [ ] Create `.env`: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `BACEN_CLIENT_ID`, `BACEN_CLIENT_SECRET`, `ENCRYPTION_KEY`

- [ ] Backend: set up environment in Vercel / Railway / local

- [ ] Frontend: set up environment (REACT_APP_API_URL)

- [ ] Test full flow: signup → login → upload → Stripe → Open Finance

- [ ] Commit: `git add deploy.sh docs/DEPLOYMENT.md && git commit -m "docs: add deployment guides and environment setup"`

---

## Task 16: Testing & Security Audit

**Files:**
- Create: `backend/test/security.e2e-spec.ts`
- Modify: `backend/test/*.e2e-spec.ts` (add missing tests from Review Focus)

**Steps:**

- [ ] Write tests for Review Focus items (cross-tenant access, webhook idempotency, PDF errors, token refresh, LGPD deletion)

- [ ] Run full test suite: `npm run test:e2e`

- [ ] Security checklist:
  - [ ] No plaintext passwords in DB
  - [ ] No tokens in logs
  - [ ] HTTPS enforced
  - [ ] CORS restricted
  - [ ] Rate limiting on auth endpoints
  - [ ] Input validation on all endpoints
  - [ ] Sensitive data encrypted at rest

- [ ] Commit: `git add test/security.e2e-spec.ts && git commit -m "test: add security tests and audit checklist"`

---

## Self-Review

✅ **Spec Coverage:** All 11 sections of MVP-DESIGN covered:
- Task 1: Setup ✓
- Task 2: DB Schema ✓
- Task 3-4: Auth + Multi-tenancy ✓
- Task 5: Transactions ✓
- Task 6: File Upload ✓
- Task 7: Encryption ✓
- Task 8: Stripe ✓
- Task 9: Open Finance ✓
- Task 10: LGPD ✓
- Task 11-14: Frontend ✓
- Task 15-16: Deploy + Tests ✓

✅ **Step Granularity:** Each step produces one checkable result (test pass, endpoint working, feature integrated)

✅ **Type Consistency:** All signatures match across tasks (tenantId, Transaction, Account, etc.)

✅ **Review Focus:** All 5 input classes covered by test tasks

✅ **Proportion:** Plan length matches spec complexity; code blocks limited to algorithms

---

Plan saved to `f:\SAAS\docs\IMPLEMENTATION-PLAN-2026-11-17.md`. Review it and confirm execution method?

**Recommend:** Native execution (I implement all 16 tasks in this session, then fresh code review). Why: tasks are well-sequenced with clear interfaces, MVP scope is focused, mistakes compound quickly in SaaS.

Execute now?