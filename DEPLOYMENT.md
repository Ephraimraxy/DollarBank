# Deployment Guide

This guide covers deploying Vault ID to production environments.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ database
- SSL/TLS certificates (for HTTPS)
- Domain name configured
- Reverse proxy (nginx recommended)

## Environment Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Production settings
NODE_ENV=production
PORT=3000
ENFORCE_HTTPS=true

# Database
DATABASE_URL=postgresql://user:password@host:5432/vault_db

# Security
JWT_SECRET=<generate-strong-secret-min-32-chars>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=Vault ID <noreply@yourdomain.com>

# AI
GOOGLE_API_KEY=your-google-api-key

# Frontend
FRONTEND_URL=https://yourdomain.com
```

### 2. Generate Strong Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE vault_db;
CREATE USER vault_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE vault_db TO vault_user;
```

### 2. Run Migrations

```bash
npm run db:init
npm run db:seed  # Optional: seed test data
```

## Application Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Build application
npm run build

# Start application
pm2 start server/index.js --name vault-id

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server/index.js"]
```

Build and run:
```bash
docker build -t vault-id .
docker run -d -p 3000:3000 --env-file .env vault-id
```

### Option 3: Systemd Service

Create `/etc/systemd/system/vault-id.service`:

```ini
[Unit]
Description=Vault ID Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/vault-id
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable vault-id
sudo systemctl start vault-id
```

## Nginx Configuration

```nginx
upstream vault_id {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Proxy settings
    location / {
        proxy_pass http://vault_id;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /dist {
        alias /var/www/vault-id/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Security Checklist

- [ ] HTTPS enabled and enforced
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Database credentials secured
- [ ] CORS origins restricted
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Logging configured
- [ ] Monitoring set up

## Monitoring

### Health Checks

Monitor these endpoints:
- `GET /api/health` - Application health
- `GET /api/ready` - Readiness check

### Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Recommended Tools

- **APM**: New Relic, Datadog, or Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Log Aggregation**: Loggly, Papertrail

## Database Backups

### Automated Backup Script

```bash
#!/bin/bash
BACKUP_DIR="/backups/vault-id"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"
```

### Cron Job

```cron
0 2 * * * /path/to/backup-script.sh
```

## Scaling

### Horizontal Scaling

1. Run multiple instances behind load balancer
2. Use session store (Redis) for shared sessions
3. Configure sticky sessions if needed

### Database Scaling

1. Use connection pooling (pgBouncer)
2. Set up read replicas for read-heavy workloads
3. Consider database sharding for very large scale

## Troubleshooting

### Application won't start

1. Check environment variables
2. Verify database connection
3. Check logs: `logs/error.log`
4. Verify port availability

### Database connection errors

1. Verify DATABASE_URL format
2. Check firewall rules
3. Verify database credentials
4. Check PostgreSQL logs

### Performance issues

1. Check database indexes
2. Review query performance
3. Monitor memory usage
4. Check rate limiting settings

## Rollback Procedure

1. Stop application
2. Restore database backup
3. Revert code changes
4. Restart application
5. Verify functionality

## Support

For deployment issues, check:
- Application logs: `logs/`
- System logs: `journalctl -u vault-id`
- Nginx logs: `/var/log/nginx/`


