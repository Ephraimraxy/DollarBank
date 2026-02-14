# Railway Quick Start Guide

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Connect to Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and start building

### 3. Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically sets `DATABASE_URL`

### 4. Set Environment Variables
In Railway dashboard → Variables tab, add:

**Required:**
```
NODE_ENV=production
JWT_SECRET=<generate-32-char-secret>
FRONTEND_URL=https://your-app-name.up.railway.app
ALLOWED_ORIGINS=https://your-app-name.up.railway.app
RESEND_API_KEY=your-resend-key
GOOGLE_API_KEY=your-google-key
```

**Optional:**
```
ENFORCE_HTTPS=true
LOG_LEVEL=info
```

### 5. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Deploy!
Railway automatically:
- ✅ Installs dependencies (`npm install`)
- ✅ Builds React app (`npm run build`)
- ✅ Runs database migrations
- ✅ Starts server (`npm start`)

## ✅ Verify Deployment

1. Check Railway logs for "Server is running"
2. Visit your Railway domain
3. Test `/api/health` endpoint
4. Try logging in

## 🔧 Railway Auto-Detects

- ✅ Node.js version (from `.nvmrc`)
- ✅ Build command (`npm run build`)
- ✅ Start command (`npm start`)
- ✅ Port (from `PORT` env var)

## 📝 Important Notes

- **Database migrations run automatically** on first deploy
- **Port is set by Railway** (don't hardcode)
- **HTTPS is automatic** (Railway provides SSL)
- **Build happens automatically** via `postinstall` hook

## 🆘 Troubleshooting

**Build fails?**
- Check Railway logs
- Verify all dependencies in `package.json`

**Database connection fails?**
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set

**App won't start?**
- Check Railway logs
- Verify all required env vars are set
- Check `/api/health` endpoint

For detailed guide, see `RAILWAY_DEPLOYMENT.md`


