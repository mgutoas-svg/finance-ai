# Finance AI - MVP Quick Start

## Setup Inicial

### 1. Database (PostgreSQL)

```bash
# Local (Windows)
# Download PostgreSQL from https://www.postgresql.org/download/windows/

# Or use Docker
docker run --name finance-ai-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=finance_ai -p 5432:5432 -d postgres:15

# Create .env file in backend directory
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_ai"
JWT_SECRET="your-super-secret-jwt-key-change-in-prod"
ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
STRIPE_API_KEY="sk_test_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_test_YOUR_KEY"
BACEN_CLIENT_ID="your-client-id"
BACEN_CLIENT_SECRET="your-client-secret"
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Auth
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Transactions
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PATCH /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Payments
- `POST /payments/checkout` - Create Stripe checkout session
- `POST /payments/webhook` - Stripe webhook handler

### Open Finance
- `GET /open-finance/authorize` - Get Bacen auth URL
- `GET /open-finance/callback?code=...` - Handle Bacen redirect

## Features Implemented

✅ Authentication (JWT + 2FA ready)
✅ Multi-tenancy (personal + consultant modes)
✅ Transaction CRUD
✅ Stripe integration (checkout + webhooks)
✅ Encryption (AES-256)
✅ Audit logging
✅ LGPD compliance
✅ React dashboard
✅ Open Finance (Bacen) scaffold

## Next Steps (Phase 2)

- [ ] File upload (PDF/OFX parsing)
- [ ] Open Finance full integration
- [ ] Advanced analytics
- [ ] Mobile responsiveness
- [ ] Admin panel
- [ ] Email notifications
- [ ] Production deployment

## Deployment to VPS

See `docs/DEPLOYMENT.md` (coming soon)

## Documentation

- Backend API: Swagger (coming soon at `/api/docs`)
- Frontend Components: Storybook (coming soon)
