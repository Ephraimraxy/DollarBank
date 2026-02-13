# Railway Deployment Guide

This guide covers deploying Vault ID to Railway.

## 🚂 Railway Setup

### 1. Connect Repository

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Railway will automatically detect the project

### 2. Environment Variables

Railway will automatically detect and use environment variables. Set these in Railway dashboard:

#### Required Variables

```bash
# Server
NODE_ENV=production
PORT=3000  # Railway sets this automatically, but you can override

# Database (Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway auto-provides this

# Security
JWT_SECRET=<generate-strong-secret-min-32-chars>
ENFORCE_HTTPS=true

# Frontend URL (your Railway domain)
FRONTEND_URL=https://your-app-name.up.railway.app

# CORS (your Railway domain)
ALLOWED_ORIGINS=https://your-app-name.up.railway.app

# Email Service
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=Vault ID <noreply@yourdomain.com>

# AI Service
GOOGLE_API_KEY=your-google-gemini-api-key
GEMINI_API_KEY=your-google-gemini-api-key  # Alternative name

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Generate JWT Secret

In Railway's environment variables, generate a strong secret:

```bash
# Use Railway's built-in generator or run locally:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Add PostgreSQL Database

1. In Railway dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically:
   - Create the database
   - Set `DATABASE_URL` environment variable
   - Connect it to your service

### 5. Deployment Process

Railway automatically:
1. Runs `npm install` (installs dependencies)
2. Runs `npm run build` (builds the React app via postinstall)
3. Runs `npm start` (starts the server)
4. Runs database migrations automatically on first deploy

## 🔧 Railway-Specific Configuration

### Port Configuration

Railway automatically sets the `PORT` environment variable. The app listens on `0.0.0.0` to accept connections from Railway's proxy.

### Database Migrations

Migrations run automatically on startup in production mode. They only execute pending migrations, so they're safe to run on every deploy.

### Build Process

The build process:
1. `npm install` - Installs all dependencies
2. `npm run build` - Builds React app (via postinstall hook)
3. `npm start` - Starts Express server

### Static Files

The Express server serves static files from the `dist/` directory, which is created during the build process.

## 📋 Railway Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (auto-set by Railway PostgreSQL)
- [ ] `JWT_SECRET` (32+ characters)
- [ ] `FRONTEND_URL` (your Railway domain)
- [ ] `ALLOWED_ORIGINS` (your Railway domain)
- [ ] `RESEND_API_KEY`
- [ ] `GOOGLE_API_KEY` or `GEMINI_API_KEY`
- [ ] `ENFORCE_HTTPS=true` (optional, Railway provides HTTPS)

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Railway Auto-Deploys**
   - Railway detects the push
   - Starts building automatically
   - Deploys when build completes

3. **Check Logs**
   - Go to Railway dashboard
   - Click on your service
   - View "Deployments" tab
   - Check logs for any errors

4. **Verify Deployment**
   - Visit your Railway domain
   - Check `/api/health` endpoint
   - Test authentication flow

## 🔍 Troubleshooting

### Build Fails

**Issue**: Build fails during `npm run build`

**Solution**:
- Check Railway logs for specific error
- Ensure all dependencies are in `package.json`
- Check `vite.config.ts` for issues

### Database Connection Fails

**Issue**: Cannot connect to database

**Solution**:
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure database service is connected to your app

### Migrations Fail

**Issue**: Database migrations fail

**Solution**:
- Check database connection
- Verify migration files exist in `server/migrations/`
- Check Railway logs for specific error

### Port Already in Use

**Issue**: Port conflict

**Solution**:
- Railway handles this automatically
- Ensure you're using `PORT` from environment
- Don't hardcode port numbers

### Static Files Not Loading

**Issue**: React app not loading

**Solution**:
- Verify `dist/` folder exists after build
- Check `vite.config.ts` build output directory
- Ensure Express serves static files correctly

## 📊 Monitoring

### Railway Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request logs

### Application Logs

View logs in Railway dashboard:
1. Click on your service
2. Go to "Logs" tab
3. Filter by level (info, error, warn)

### Health Checks

Railway can monitor:
- `/api/health` - Application health
- `/api/ready` - Readiness check

Set up in Railway dashboard:
1. Go to service settings
2. Add health check path: `/api/health`
3. Set check interval

## 🔄 Updating Deployment

To update your deployment:

1. **Make changes locally**
2. **Commit and push**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. **Railway auto-deploys**
   - New deployment starts automatically
   - Old deployment stays running until new one is ready
   - Zero-downtime deployment

## 🔐 Security Checklist

- [ ] `JWT_SECRET` is strong (32+ characters)
- [ ] `ENFORCE_HTTPS=true` (Railway provides HTTPS)
- [ ] `ALLOWED_ORIGINS` set to your Railway domain
- [ ] Database credentials secured (Railway handles this)
- [ ] No sensitive data in code
- [ ] Environment variables set in Railway dashboard

## 💡 Tips

1. **Use Railway's PostgreSQL**: It's automatically configured and connected
2. **Monitor Logs**: Check Railway logs regularly for issues
3. **Set Up Alerts**: Configure Railway notifications for deployment failures
4. **Use Railway CLI**: Install Railway CLI for easier management
5. **Custom Domain**: Add your custom domain in Railway settings

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs for deployment issues

## ✅ Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Database migrations completed
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Static files load
- [ ] Health check passes
- [ ] Logs show no errors
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)

