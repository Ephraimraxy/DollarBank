# Vault ID - Digital Banking Application

A modern, secure digital banking application built with React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure registration, login, email verification, and password reset
- **Account Management**: Multiple account types (Checking & Savings)
- **Money Transfers**: Send money between users securely
- **Transaction History**: View all your transactions with pagination
- **AI Assistant**: Integrated Gemini AI for banking assistance
- **Modern UI**: Beautiful, responsive interface with dark mode support
- **Security**: Rate limiting, input validation, JWT authentication, password hashing

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Environment variables configured (see `.env.example`)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:init
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
- `FRONTEND_URL`: Frontend URL for email links
- `RESEND_API_KEY`: Resend API key for emails
- `GOOGLE_API_KEY`: Google Gemini API key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🔒 Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs are validated and sanitized
- **Password Requirements**: Strong password policy enforced
- **HTTPS Enforcement**: Configurable HTTPS requirement
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Helmet.js security headers
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Account Endpoints

- `GET /api/accounts` - Get user accounts (requires auth)

### Transaction Endpoints

- `GET /api/transactions` - Get transaction history (requires auth)
- `POST /api/transactions/transfer` - Transfer money (requires auth)

### Health Check

- `GET /api/health` - Health check endpoint
- `GET /api/ready` - Readiness check endpoint

## 🏗️ Project Structure

```
vault/
├── server/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── schema.sql       # Database schema
├── components/          # React components
├── src/
│   ├── lib/             # Client-side utilities
│   └── types/           # TypeScript types
├── tests/               # Test files
└── dist/                # Build output
```

## 🚢 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Set `ENFORCE_HTTPS=true`
3. Configure `ALLOWED_ORIGINS` with production domains
4. Use strong `JWT_SECRET` (32+ characters)
5. Set up database backups
6. Configure logging and monitoring
7. Set up SSL/TLS certificates
8. Configure reverse proxy (nginx/Apache)

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Database Schema

See `server/schema.sql` for complete database schema.

Key tables:
- `users` - User accounts
- `accounts` - Bank accounts
- `transactions` - Transaction history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions, please open an issue on GitHub.

## 🔐 Security

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.
