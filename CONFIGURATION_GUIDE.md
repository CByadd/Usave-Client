# Configuration Guide

## Centralized Configuration

All application URLs, API endpoints, and environment variables are centralized in:
**`src/app/lib/config.js`**

This makes it easy to move from development to production.

## Environment Variables

Create a `.env.local` file in the client root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# For Production (uncomment when deploying)
# NEXT_PUBLIC_API_URL=https://usave-server.vercel.app/api

# Client URL (optional, auto-detected)
# NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

# Cloudinary (optional)
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dvmuf6jfj

# Support Email
# NEXT_PUBLIC_SUPPORT_EMAIL=support@usave.com

# Admin Email
# NEXT_PUBLIC_ADMIN_EMAIL=admin@usave.com
```

## Usage in Code

### Importing Config

```javascript
import { config } from '../lib/config';
import { getApiUrl, getPageUrl } from '../lib/config';
```

### Using API URLs

```javascript
// Get base API URL
const apiUrl = config.api.baseURL;

// Get full API endpoint URL
const loginUrl = getApiUrl(config.endpoints.auth.login);
// Returns: http://localhost:3001/api/auth/login (dev)
// or: https://usave-server.vercel.app/api/auth/login (prod)
```

### Using Page URLs

```javascript
// Get page URL
const checkoutUrl = getPageUrl(config.urls.checkout);
// Returns: http://localhost:3000/checkout (dev)
// or: https://usave-client.vercel.app/checkout (prod)

// Dynamic URLs
const productUrl = config.urls.product('123');
// Returns: /products/123
```

### Accessing Configuration Values

```javascript
// API Configuration
config.api.baseURL
config.api.timeout

// Application Settings
config.app.name
config.app.version
config.app.supportEmail

// Feature Flags
config.features.enableAnalytics
config.features.useMockAPI

// Validation Rules
config.validation.email.pattern
config.validation.phone.pattern

// Cart Configuration
config.cart.freeShippingThreshold
config.cart.taxRate
```

## Server Configuration

The server (port 3001) should allow CORS from:
- Development: `http://localhost:3000`
- Production: `https://usave-client.vercel.app`

Check `Server/server.js` for CORS configuration.

## URL Patterns

### Development
- Client: `http://localhost:3000`
- Server: `http://localhost:3001`
- API Base: `http://localhost:3001/api`

### Production
- Client: `https://usave-client.vercel.app`
- Server: `https://usave-server.vercel.app`
- API Base: `https://usave-server.vercel.app/api`

## Important Notes

1. **Never use HTTPS with localhost** - Use HTTP (`http://`) for local development
2. **Always use the config file** - Don't hardcode URLs in components
3. **Environment variables take precedence** - Set `NEXT_PUBLIC_API_URL` to override defaults
4. **Server-side vs Client-side** - Server-side code (API routes) may need different URL handling

## Troubleshooting

### SSL Protocol Error
If you see `ERR_SSL_PROTOCOL_ERROR`:
- Check that you're using `http://` (not `https://`) for localhost
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Ensure the server is running on the correct port

### CORS Errors
- Verify server CORS configuration includes your client URL
- Check that the server is running and accessible

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check server is running: `http://localhost:3001/api/health`
- Review browser console for detailed error messages

## Migration Checklist

When moving to production:

1. ✅ Update `.env.local` with production URLs
2. ✅ Verify server CORS settings
3. ✅ Test all API endpoints
4. ✅ Verify SSL certificates (for HTTPS)
5. ✅ Update environment variables in hosting platform


