# 🚀 TanaMind Deployment Guide

This guide covers deploying TanaMind with secure AI Analytics features.

## 🔒 Security Overview

The AI Analytics feature uses a **secure architecture** that protects the Gemini API key:

- ✅ **Server-side proxy**: API key never exposed to client
- ✅ **Vercel Functions**: Serverless backend for AI requests  
- ✅ **Environment variables**: Secure key management
- ✅ **CORS protection**: Request validation and security headers

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **GitHub Repository**: Code pushed to GitHub

## 🌐 Production Deployment

### Step 1: Initial Deployment

1. **Connect to Vercel**:
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Follow the prompts**:
   - Link to existing project? **N**
   - Project name: **tanamind-pwa** (or your preference)
   - Directory: **./src** ➜ Press Enter (use current directory)
   - Build command: **npm run build** ➜ Press Enter (auto-detected)
   - Output directory: **dist** ➜ Press Enter (auto-detected)

### Step 2: Configure Environment Variables

1. **Add Gemini API Key**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   - Environment: **Production**
   - Value: Paste your Gemini API key

2. **Optional - Add other environment variables**:
   ```bash
   # If using custom backend URL
   vercel env add VITE_API_BASE_URL
   ```

### Step 3: Deploy to Production

```bash
vercel --prod
```

## 🧪 Testing the Deployment

1. **Visit your deployed URL**
2. **Test basic functionality**:
   - User registration/login
   - Plant management
   - Dashboard views

3. **Test AI Analytics**:
   - Navigate to Analytics page
   - Should show "Ready for Analysis" instead of setup guide
   - Try "Refresh Analysis" button
   - Test "Chat with AI" feature

## 🔧 Local Development with Proxy

For local development with AI features:

1. **Create local environment file**:
   ```bash
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   ```

2. **Run Vercel dev server**:
   ```bash
   vercel dev
   ```

3. **Access application**:
   - Frontend: `http://localhost:3000`
   - AI Proxy: `http://localhost:3000/api/ai-chat`

## 🔍 Troubleshooting

### AI Features Not Working

1. **Check environment variable**:
   ```bash
   vercel env ls
   ```

2. **Verify API key is set**:
   - Should see `GEMINI_API_KEY` in production environment

3. **Check function logs**:
   ```bash
   vercel logs [deployment-url]
   ```

### API Key Exposed Error

If you accidentally exposed the API key in client code:

1. **Regenerate API key** in Google AI Studio
2. **Update Vercel environment variable**:
   ```bash
   vercel env rm GEMINI_API_KEY
   vercel env add GEMINI_API_KEY
   ```
3. **Redeploy**:
   ```bash
   vercel --prod
   ```

## 📊 Monitoring

### Performance Monitoring

- **Vercel Analytics**: Enable in project settings
- **Function Metrics**: Monitor AI proxy usage
- **Error Tracking**: Check function logs for errors

### Security Best Practices

1. **Regular API key rotation**: Update keys periodically
2. **Monitor usage**: Check Gemini API quotas
3. **Error handling**: Ensure graceful fallbacks
4. **Rate limiting**: Consider implementing if needed

## 🔄 Updates and Maintenance

### Updating the Application

1. **Push changes to GitHub**
2. **Automatic deployment** via Vercel GitHub integration
3. **Or manual deployment**:
   ```bash
   vercel --prod
   ```

### Environment Variable Updates

```bash
# Update existing variable
vercel env rm GEMINI_API_KEY
vercel env add GEMINI_API_KEY

# Redeploy after environment changes
vercel --prod
```

## 🌍 Domain Configuration

1. **Add custom domain** in Vercel dashboard
2. **Configure DNS** with your domain provider
3. **Update CORS settings** if needed for custom domain

## 📱 PWA Deployment Notes

- **HTTPS required**: Vercel provides automatic HTTPS
- **Service Worker**: Automatically built and deployed
- **Manifest**: Included in build output
- **Offline functionality**: Works immediately after deployment

---

## ✅ Post-Deployment Checklist

- [ ] AI Analytics page loads without setup guide
- [ ] Chat functionality works
- [ ] Plant analysis generates recommendations
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] All plant management features work
- [ ] Authentication flows work correctly

For support, check the [main README](README.md) or create an issue in the repository.