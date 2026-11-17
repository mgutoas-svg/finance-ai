# 🚀 Deploy em VPS - Finance AI

**Para quando você comprar a VPS**

---

## 📋 VPS Recomendada

| Provider | Config | Preço |
|----------|--------|-------|
| **DigitalOcean** | 2GB RAM, 1 vCPU | $12/mês |
| **Linode** | 2GB RAM, 1 vCPU | $12/mês |
| **AWS** | t3.small | ~$10-20/mês |
| **Vultr** | 2GB RAM, 1 vCPU | $12/mês |

**Recomendo:** DigitalOcean (melhor docs + suporte)

---

## 🔧 Setup VPS (Ubuntu 22.04 LTS)

### 1. SSH para VPS

```bash
# Substituir com seu IP e chave
ssh root@YOUR_VPS_IP

# Ou com senha
ssh -i /path/to/key.pem ubuntu@YOUR_VPS_IP
```

### 2. Update System

```bash
apt update
apt upgrade -y
apt install -y curl wget git
```

### 3. Install Node.js

```bash
# Node 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verificar
node --version
npm --version
```

### 4. Install PostgreSQL

```bash
# Install
apt install -y postgresql postgresql-contrib

# Start service
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres psql <<EOF
CREATE DATABASE finance_ai;
CREATE USER finance_user WITH PASSWORD 'your_secure_password';
ALTER ROLE finance_user SET client_encoding TO 'utf8';
ALTER ROLE finance_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE finance_user SET default_transaction_deferrable TO on;
ALTER ROLE finance_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE finance_ai TO finance_user;
\q
EOF
```

### 5. Install PM2 (Process Manager)

```bash
npm install -g pm2

# Start on boot
pm2 startup
pm2 save
```

### 6. Install Nginx

```bash
apt install -y nginx

# Start
systemctl start nginx
systemctl enable nginx
```

---

## 📦 Deploy Application

### 1. Clone Repository

```bash
cd /var/www
git clone https://github.com/mgutoas-svg/finance-ai.git
cd finance-ai
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env
cat > .env <<EOF
DATABASE_URL="postgresql://finance_user:your_secure_password@localhost:5432/finance_ai"
JWT_SECRET="$(openssl rand -hex 32)"
ENCRYPTION_KEY="$(openssl rand -hex 32)"
STRIPE_API_KEY="sk_live_YOUR_STRIPE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_live_YOUR_WEBHOOK"
BACEN_CLIENT_ID="your_bacen_id"
BACEN_CLIENT_SECRET="your_bacen_secret"
BACKEND_URL="https://api.yourdomainname.com"
FRONTEND_URL="https://yourdomainname.com"
PORT=3001
NODE_ENV="production"
EOF

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start "npm run start" --name "finance-backend"
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install
npm install

# Build
npm run build

# Output está em 'dist' folder
```

### 4. Nginx Configuration

```bash
# Create config
cat > /etc/nginx/sites-available/finance-ai <<'EOF'
upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name api.yourdomainname.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomainname.com;

    root /var/www/finance-ai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable config
ln -s /etc/nginx/sites-available/finance-ai /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test
nginx -t

# Restart
systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomainname.com -d api.yourdomainname.com

# Auto-renew
systemctl enable certbot.timer
```

---

## ✅ Verificar Deploy

```bash
# Check backend running
pm2 list
pm2 logs finance-backend

# Check Nginx
systemctl status nginx
curl http://localhost:3001/health

# Check database
psql -U finance_user -d finance_ai -c "SELECT 1"

# Check frontend
curl http://localhost/index.html
```

---

## 🔐 Firewall Setup

```bash
# If using UFW
ufw enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5432/tcp  # PostgreSQL (apenas local)
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Start monitoring
pm2 start ecosystem.config.js

# Or install PM2 Plus
pm2 plus
```

### Create ecosystem.config.js

```bash
cat > /var/www/finance-ai/backend/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'finance-backend',
    script: 'npm start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
EOF
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
cd /var/www/finance-ai

# Pull latest
git pull origin main

# Update dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart finance-backend
```

### Backup Database

```bash
# Daily backup
pg_dump -U finance_user finance_ai | gzip > /backups/finance_ai_$(date +%Y%m%d).sql.gz

# Or setup automated:
cat > /etc/cron.daily/backup-finance <<'EOF'
#!/bin/bash
pg_dump -U finance_user finance_ai | gzip > /backups/finance_ai_$(date +%Y%m%d).sql.gz
# Keep only last 7 days
find /backups -name "finance_ai_*.sql.gz" -mtime +7 -delete
EOF
chmod +x /etc/cron.daily/backup-finance
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

```bash
# In Nginx config, add:
gzip on;
gzip_types text/plain text/css text/xml application/json application/javascript;
gzip_min_length 1000;
```

### 2. Database Connection Pooling

```bash
# Install PgBouncer
apt install -y pgbouncer

# Configure pooling
```

### 3. CDN for Frontend Assets

```bash
# Use Cloudflare (free)
# Point domain to Cloudflare nameservers
```

---

## 🆘 Troubleshooting

### "Connection refused"
```bash
# Check if backend is running
pm2 list

# Check logs
pm2 logs finance-backend

# Restart
pm2 restart finance-backend
```

### "Database connection error"
```bash
# Check PostgreSQL running
systemctl status postgresql

# Check credentials
psql -U finance_user -d finance_ai -c "SELECT 1"
```

### "Nginx 502 Bad Gateway"
```bash
# Check backend
curl http://localhost:3001

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### "SSL certificate issues"
```bash
# Renew manually
certbot renew --dry-run

# Force renew
certbot renew --force-renewal
```

---

## 🎯 Launch Checklist

- [ ] VPS provisionado
- [ ] Node.js + npm instalado
- [ ] PostgreSQL running
- [ ] PM2 instalado
- [ ] Application clonado
- [ ] .env configurado
- [ ] Database migrations rodadas
- [ ] Backend buildado e rodando
- [ ] Frontend buildado
- [ ] Nginx configurado
- [ ] SSL certificado
- [ ] DNS apontando corretamente
- [ ] Backend acessível via HTTPS
- [ ] Frontend acessível via HTTPS
- [ ] Emails (SendGrid) testados
- [ ] Stripe webhooks funcionando
- [ ] Backups automatizados

---

## 📞 Support

Se tiver problemas:
1. Check logs: `pm2 logs`
2. Check Nginx: `tail -f /var/log/nginx/error.log`
3. SSH para VPS e debug localmente

---

## 💰 Estimated Costs

| Item | Monthly |
|------|---------|
| VPS (DigitalOcean) | $12 |
| Domain (.com) | ~$12 (yearly) |
| SSL (Let's Encrypt) | FREE |
| Stripe (2.9% + $0.30) | Variable |
| Email (SendGrid) | FREE (100/day) |
| **Total** | ~$12-50 |

---

**Ready? Let's launch! 🚀**
