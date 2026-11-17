# 🚀 Quick Deployment Guide for ArtiCube

## 📋 Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is set up
- [ ] You have API keys (Google AI, etc.)
- [ ] Run the deployment prep script: `./deploy-prep.sh`

## 🎯 Deployment Steps

### 1. Backend on Render (5-10 minutes)

1. **Go to Render.com** → New → Web Service
2. **Connect your GitHub repo**
3. **Configure:**

   - Name: `articube-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables:**

   ```
   MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/articube
   MONGODB_DB_NAME=articube
   SECRET_KEY=your-super-secret-key
   GOOGLE_API_KEY=your-google-api-key
   CORS_ORIGINS=["https://your-app.vercel.app"]
   ```

5. **Deploy** and note your backend URL: `https://your-app.onrender.com`

### 2. Frontend on Vercel (3-5 minutes)

1. **Go to Vercel.com** → New Project
2. **Import your GitHub repo**
3. **Configure:**

   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)

4. **Environment Variables:**

   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_APP_NAME=ArtiCube
   VITE_DEV_MODE=false
   ```

5. **Deploy** and note your frontend URL: `https://your-app.vercel.app`

### 3. Update CORS (1 minute)

1. Go back to Render backend
2. Update `CORS_ORIGINS` to include your Vercel URL
3. Redeploy backend

## ✅ Verification

1. Visit `https://your-backend.onrender.com/api/v1/health` → Should return `{"status": "ok"}`
2. Visit your frontend URL → Should load the application
3. Test user registration and search functionality

## 🔧 Files Created for Deployment

- ✅ `backend/render.yaml` - Render configuration
- ✅ `backend/Procfile` - Process file for deployment
- ✅ `backend/runtime.txt` - Python version specification
- ✅ `frontend/vercel.json` - Vercel configuration
- ✅ `frontend/.env.example` - Environment variables template
- ✅ `frontend/.env.production` - Production environment template
- ✅ `DEPLOYMENT.md` - Detailed deployment guide
- ✅ `deploy-prep.sh` - Deployment preparation script

## 🆘 Quick Troubleshooting

**Backend won't start?**

- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Frontend can't connect to backend?**

- Check CORS_ORIGINS includes your frontend URL
- Verify VITE_API_URL points to your backend
- Check browser network tab for errors

**Build failures?**

- Run `./deploy-prep.sh` to test locally
- Check for TypeScript/Python errors
- Verify all dependencies are in requirements.txt/package.json

## 📞 Need Help?

Refer to the detailed `DEPLOYMENT.md` file for comprehensive instructions and troubleshooting.
