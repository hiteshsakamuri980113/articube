#!/bin/bash

# ArtiCube Deployment Helper Script
# This script helps prepare your project for deployment

echo "🚀 ArtiCube Deployment Helper"
echo "=============================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory (where backend/ and frontend/ folders exist)"
    exit 1
fi

echo "✅ Project structure validated"

# Backend preparation
echo ""
echo "📦 Preparing Backend for Render..."
cd backend

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found in backend directory"
    exit 1
fi

echo "✅ requirements.txt found"

# Check if main.py exists
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found in backend directory"
    exit 1
fi

echo "✅ main.py found"

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "⚠️  Warning: .env.example not found. You should create one for documentation."
fi

cd ..

# Frontend preparation
echo ""
echo "🎨 Preparing Frontend for Vercel..."
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

echo "✅ package.json found"

# Check if build script exists
if ! grep -q '"build"' package.json; then
    echo "❌ Error: Build script not found in package.json"
    exit 1
fi

echo "✅ Build script found in package.json"

# Install dependencies and test build
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

echo "🔨 Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful"

cd ..

echo ""
echo "🎉 Deployment Preparation Complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub if not already done"
echo "2. Set up MongoDB Atlas database"
echo "3. Deploy backend on Render (follow DEPLOYMENT.md)"
echo "4. Deploy frontend on Vercel (follow DEPLOYMENT.md)"
echo "5. Update environment variables with production URLs"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions"
