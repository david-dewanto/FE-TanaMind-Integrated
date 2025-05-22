# 🧪 Development Testing Guide

This guide shows you how to test the AI Analytics features in your local development environment.

## 🚀 **Quick Setup (Recommended)**

### Step 1: Deploy to Vercel First

1. **Deploy your app**:
   ```bash
   vercel
   ```

2. **Add your Gemini API key**:
   ```bash
   vercel env add GEMINI_API_KEY
   # Paste your API key when prompted
   ```

3. **Deploy to production**:
   ```bash
   vercel --prod
   ```

4. **Note your deployment URL** (e.g., `https://your-app.vercel.app`)

### Step 2: Configure Local Development

1. **Create local environment file**:
   ```bash
   # Replace with your actual Vercel deployment URL
   echo "VITE_AI_PROXY_URL=https://your-app.vercel.app" > .env
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Test AI features**:
   - Navigate to `http://localhost:5173` (or your dev port)
   - Go to Analytics page
   - Try "Refresh Analysis" and "Chat with AI"

## ✅ **How It Works**

```
Local Dev Server (localhost:5173) 
    ↓ AI requests
Vercel Proxy (your-app.vercel.app/api/ai-chat)
    ↓ Secure API calls  
Google Gemini API
```

- Your **frontend runs locally** for fast development
- **AI requests go to your deployed Vercel function**
- **API key stays secure** on Vercel servers
- **No local setup** of proxy server needed

## 🔧 **Alternative: Full Local Setup**

If you prefer everything local:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Create local environment**:
   ```bash
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   ```

3. **Run Vercel dev server**:
   ```bash
   vercel dev
   ```

4. **Access at**: `http://localhost:3000`

## 🧪 **Testing Checklist**

### Basic Functionality
- [ ] App loads normally
- [ ] Authentication works
- [ ] Plant management works
- [ ] Dashboard displays correctly

### AI Analytics Features  
- [ ] Analytics page loads without "setup guide"
- [ ] "Refresh Analysis" button works
- [ ] Plant analysis cards appear
- [ ] "Chat with AI" modal opens
- [ ] Chat responses are generated
- [ ] "Ask AI" on plant cards works
- [ ] Error handling works (try with invalid inputs)

### Development Experience
- [ ] Hot reload works for frontend changes
- [ ] Console shows no critical errors
- [ ] Network tab shows successful AI API calls
- [ ] Loading states display properly

## 🔍 **Troubleshooting**

### "AI Not Available" Message
- ✅ Check your `.env` file has `VITE_AI_PROXY_URL`
- ✅ Verify your Vercel deployment URL is correct
- ✅ Ensure Vercel deployment has `GEMINI_API_KEY` set

### CORS Errors
- ✅ Make sure you're using `https://` not `http://` for Vercel URL
- ✅ Check that your Vercel deployment is actually live

### Slow AI Responses
- ✅ Normal in development (network latency)
- ✅ Production will be faster

### API Key Issues
- ✅ Verify API key is set in Vercel: `vercel env ls`
- ✅ Check Google AI Studio for key validity

## 🔄 **Development Workflow**

1. **Make frontend changes** → Hot reload works instantly
2. **Make AI proxy changes** → Need to redeploy Vercel
3. **Test new features** → Use the Analytics page
4. **Debug issues** → Check browser console and Network tab

## 📝 **Environment Variables Summary**

### Local Development (.env)
```bash
# Point to your deployed Vercel app
VITE_AI_PROXY_URL=https://your-app.vercel.app

# Optional: if using different backend
VITE_API_BASE_URL=http://localhost:8000
```

### Vercel Production (vercel env)
```bash
# Set via: vercel env add GEMINI_API_KEY
GEMINI_API_KEY=your_actual_gemini_api_key
```

## 🎯 **Benefits of This Setup**

- ✅ **Fast development**: Frontend hot reload
- ✅ **Secure**: API key never on your machine
- ✅ **Simple**: No complex local setup
- ✅ **Realistic**: Tests actual production environment
- ✅ **Collaborative**: Team can use same proxy

Happy coding! 🚀