# ArtiCube Deployment Guide

This guide will help you deploy the ArtiCube application with the backend on Render and frontend on Vercel.

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Render account (https://render.com)
3. Vercel account (https://vercel.com)
4. MongoDB Atlas account (https://www.mongodb.com/atlas)

## Backend Deployment on Render

### 1. Set up MongoDB Atlas

1. Create a MongoDB Atlas account and cluster
2. Create a database user with read/write permissions
3. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs)
4. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 2. Deploy Backend on Render

1. **Connect Repository:**

   - Go to https://render.com and sign in
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder (or set root directory to `/backend`)

2. **Configure Build Settings:**

   - **Name:** `articube-backend`
   - **Environment:** `Python 3`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend` (if your backend is in a subdirectory)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables:**
   Go to Environment tab and add these variables:

   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/articube
   MONGODB_DB_NAME=articube
   SECRET_KEY=your-super-secret-key-generate-a-strong-one
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GOOGLE_API_KEY=your-google-api-key
   OPENAI_API_KEY=your-openai-api-key-if-needed
   GOOGLE_GENAI_USE_VERTEXAI=false
   API_V1_STR=/api/v1
   CORS_ORIGINS=["https://your-frontend-app.vercel.app", "http://localhost:3000", "http://localhost:5173"]
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build to complete
   - Your backend will be available at: `https://your-service-name.onrender.com`

### 3. Test Backend Deployment

Visit `https://your-service-name.onrender.com/api/v1/health` to verify it's working.

## Frontend Deployment on Vercel

### 1. Deploy Frontend on Vercel

1. **Connect Repository:**

   - Go to https://vercel.com and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings:**

   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (if your frontend is in a subdirectory)
   - **Build Command:** `npm run build` (Vercel auto-detects this)
   - **Output Directory:** `dist` (Vercel auto-detects this)

3. **Set Environment Variables:**
   In the Environment Variables section, add:

   ```
   VITE_API_URL=https://your-backend-service.onrender.com
   VITE_APP_NAME=ArtiCube
   VITE_DEV_MODE=false
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your frontend will be available at: `https://your-app-name.vercel.app`

### 2. Update CORS Settings

After deploying the frontend:

1. Go back to your Render backend dashboard
2. Update the `CORS_ORIGINS` environment variable to include your Vercel URL:
   ```
   CORS_ORIGINS=["https://your-app-name.vercel.app", "http://localhost:3000", "http://localhost:5173"]
   ```
3. Redeploy the backend service

## Post-Deployment Steps

### 1. Test the Full Application

1. Visit your Vercel frontend URL
2. Try registering a new account
3. Test the search functionality
4. Verify all features work as expected

### 2. Set up Custom Domains (Optional)

#### For Backend (Render):

1. Go to your service settings
2. Add a custom domain
3. Configure DNS records as instructed

#### For Frontend (Vercel):

1. Go to your project settings
2. Add a custom domain
3. Configure DNS records as instructed

### 3. Monitor and Scale

#### Render:

- Check logs in the Render dashboard
- Monitor resource usage
- Upgrade plan if needed for better performance

#### Vercel:

- Monitor function execution times
- Check build logs for any issues
- Upgrade plan if you need more bandwidth/builds

## Troubleshooting

### Common Backend Issues:

1. **MongoDB Connection Issues:**

   - Verify your connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

2. **Environment Variables:**

   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names
   - Make sure CORS_ORIGINS includes your frontend URL

3. **Build Failures:**
   - Check requirements.txt for any incompatible packages
   - Verify Python version compatibility

### Common Frontend Issues:

1. **API Connection Issues:**

   - Verify VITE_API_URL points to your backend
   - Check browser network tab for CORS errors
   - Ensure backend CORS_ORIGINS includes your frontend URL

2. **Build Failures:**

   - Check for TypeScript errors
   - Verify all dependencies are correctly installed
   - Check for any environment-specific code

3. **Routing Issues:**
   - Ensure vercel.json is properly configured for SPA routing

## Security Considerations

1. **Use Strong Secrets:**

   - Generate a strong SECRET_KEY for JWT signing
   - Use secure API keys

2. **CORS Configuration:**

   - Only include necessary origins in CORS_ORIGINS
   - Don't use wildcards (\*) in production

3. **Environment Variables:**
   - Never commit .env files to version control
   - Use different secrets for development and production

## Performance Optimization

1. **Backend:**

   - Enable gzip compression
   - Use MongoDB connection pooling
   - Implement caching where appropriate

2. **Frontend:**
   - Enable Vercel's Edge Network
   - Optimize bundle size
   - Use code splitting for large components

## Support

If you encounter issues:

1. Check the deployment logs on both platforms
2. Verify all environment variables are correct
3. Test API endpoints manually using tools like Postman
4. Check browser console for frontend errors
