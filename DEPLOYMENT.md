# Bionezis Frontend - Deployment Guide

## 🚀 Production Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

**Advantages:**
- Automatic builds and deployments
- Built-in SSL certificates
- Auto-scaling
- Easy domain management
- Integrated with GitHub

**Steps:**

1. **Push code to GitHub repository**
2. **Update `digitalocean-app.yaml`** with your repository details
3. **Deploy using doctl CLI:**
   ```bash
   doctl apps create --spec digitalocean-app.yaml
   ```
4. **Or deploy via DigitalOcean Console:**
   - Go to Apps in DigitalOcean Console
   - Create App → GitHub → Select repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Run Command: `npm start`
     - Port: 3000

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.ondigitalocean.app
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-url.ondigitalocean.app
```

### Option 2: Docker Deployment

**Build and run with Docker:**

```bash
# Build the image
docker build -t bionezis-frontend .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.bionezis.com \
  -e NEXT_PUBLIC_FRONTEND_URL=https://app.bionezis.com \
  bionezis-frontend
```

**Using docker-compose:**

```bash
# Production
docker-compose up frontend

# Development
docker-compose --profile development up frontend-dev

# With backend
docker-compose --profile with-backend up
```

### Option 3: Vercel (Alternative)

**Advantages:**
- Optimized for Next.js
- Global CDN
- Automatic deployments
- Built-in analytics

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

## 🔧 Environment Configuration

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.bionezis.com
NEXT_PUBLIC_FRONTEND_URL=https://app.bionezis.com
```

## 🌐 Domain Setup

### Custom Domain Configuration

1. **Point domain to deployment:**
   - DigitalOcean: Add domain in App settings
   - Vercel: Add domain in project settings

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: app (for app.bionezis.com)
   Value: your-app-url.ondigitalocean.app
   ```

3. **SSL Certificate:**
   - Automatically provided by DigitalOcean/Vercel
   - No additional configuration needed

## 🔒 Security Considerations

### Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled (automatic with platforms)
- [ ] API URLs point to production backend
- [ ] No development dependencies in production
- [ ] Error reporting configured (optional)
- [ ] Analytics configured (optional)

### CORS Configuration

Ensure backend allows frontend domain:
```python
# In Django backend settings.py
CORS_ALLOWED_ORIGINS = [
    "https://app.bionezis.com",
    "https://your-frontend-url.ondigitalocean.app",
]
```

## 📊 Monitoring & Analytics

### Optional Integrations

1. **Sentry (Error Tracking):**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Google Analytics:**
   ```bash
   npm install @next/third-parties
   ```

3. **Vercel Analytics:**
   - Automatic with Vercel deployment

## 🚀 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      
      - name: Build
        run: npm run build
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_FRONTEND_URL: ${{ secrets.NEXT_PUBLIC_FRONTEND_URL }}
      
      - name: Deploy to DigitalOcean
        uses: digitalocean/app_action@v1
        with:
          app_name: bionezis-frontend
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
```

## 🔄 Deployment Commands

### Quick Deployment Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Build and run with Docker
docker build -t bionezis-frontend .
docker run -p 3000:3000 bionezis-frontend

# Deploy to DigitalOcean
doctl apps create --spec digitalocean-app.yaml

# Deploy to Vercel
vercel --prod
```

## 🐛 Troubleshooting

### Common Issues

1. **Build fails:**
   - Check Node.js version (requires 18+)
   - Verify all dependencies installed
   - Check TypeScript errors

2. **API connection fails:**
   - Verify NEXT_PUBLIC_API_URL is correct
   - Check CORS configuration in backend
   - Ensure backend is accessible

3. **Routing issues:**
   - Verify middleware.ts configuration
   - Check locale routing setup
   - Ensure all required translations exist

### Debug Commands

```bash
# Check build output
npm run build

# Analyze bundle size
npm run build && npx @next/bundle-analyzer

# Check for TypeScript errors
npx tsc --noEmit

# Test production build locally
npm run build && npm start
```

## 📈 Performance Optimization

### Production Optimizations

- ✅ Standalone output enabled
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Font optimization
- ✅ Bundle analysis available

### Monitoring Performance

1. **Lighthouse CI** (optional)
2. **Web Vitals** monitoring
3. **Bundle size tracking**

## 🎯 Next Steps After Deployment

1. **Test all functionality** in production
2. **Configure monitoring** and alerts
3. **Set up backup strategy**
4. **Document API endpoints** for frontend
5. **Train users** on the new system
6. **Plan maintenance windows**

---

**🎉 Your Bionezis Manager Frontend is now production-ready!**
