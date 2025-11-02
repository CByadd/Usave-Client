# Environment Variables Example

## Client (.env.local)

Create a file named `.env.local` in the `client` root directory with the following content:

```env
# ============================================
# USave Client Environment Variables
# ============================================
# Copy this content to .env.local file
# ============================================

# API Configuration
# Development: Use HTTP for localhost (no SSL)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Production: Use HTTPS with your production server
# NEXT_PUBLIC_API_URL=https://usave-server.vercel.app/api

# Client URL (Optional - Auto-detected if not set)
# NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

# Image & Media Configuration
# Cloudinary Cloud Name (for image optimization)
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dvmuf6jfj

# Application Settings
# Support Email Address
NEXT_PUBLIC_SUPPORT_EMAIL=support@usave.com

# Admin Email Address (for order approvals, etc.)
NEXT_PUBLIC_ADMIN_EMAIL=admin@usave.com

# NextAuth Configuration (if using)
# NEXTAUTH_SECRET=your-secret-key-here
# NEXTAUTH_URL=http://localhost:3000

# Environment
# Set to 'production' for production builds
# NODE_ENV=development
```

## Server (.env)

Create a file named `.env` in the `Server` root directory with the following content:

```env
# ============================================
# USave Server Environment Variables
# ============================================
# Copy this content to .env file in Server directory
# ============================================

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/usave_db

# JWT & Authentication
JWT_SECRET=your-jwt-secret-key-here-change-in-production
JWT_EXPIRATION=604800

# CORS Configuration
# Allowed Origins (comma-separated)
# CORS_ORIGIN=http://localhost:3000,https://usave-client.vercel.app

# Email Configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@usave.com

# Resend API (Alternative to SMTP)
# RESEND_API_KEY=re_your_resend_api_key

# Payment Gateway
# STRIPE_SECRET_KEY=sk_test_...
# PAYPAL_CLIENT_ID=your-paypal-client-id
# PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Cloudinary
# CLOUDINARY_CLOUD_NAME=dvmuf6jfj
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Logging
LOG_LEVEL=info

# Security
BCRYPT_SALT_ROUNDS=10
SESSION_SECRET=your-session-secret-change-in-production
```

## Quick Setup

### For Development:

1. **Client**: Create `client/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPPORT_EMAIL=support@usave.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@usave.com
```

2. **Server**: Create `Server/.env`:
```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/usave_db
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### For Production:

1. **Client**: Update `.env.local` or set environment variables:
```bash
NEXT_PUBLIC_API_URL=https://usave-server.vercel.app/api
NEXT_PUBLIC_CLIENT_URL=https://usave-client.vercel.app
```

2. **Server**: Update environment variables:
```bash
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=strong-production-secret
FRONTEND_URL=https://usave-client.vercel.app
BACKEND_URL=https://usave-server.vercel.app
```

## Important Notes

1. ✅ **Never commit `.env` or `.env.local` files** - They're in `.gitignore`
2. ✅ **Use `http://` for localhost** - Never use `https://` with localhost
3. ✅ **Use strong secrets in production** - Generate with: `openssl rand -base64 32`
4. ✅ **Update CORS settings** - Add your production frontend URL to server CORS
5. ✅ **Environment variables take precedence** - They override config.js defaults

## Generating Secrets

To generate secure secrets for production:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Session Secret
openssl rand -base64 32

# Generate NextAuth Secret
openssl rand -base64 32
```


