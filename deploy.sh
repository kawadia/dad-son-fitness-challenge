#!/bin/bash

# Firebase Deployment Script for Dad & Son Fitness Challenge (React TypeScript)
# Make sure you have Firebase CLI installed: npm install -g firebase-tools

echo "🔥 Deploying React TypeScript Dad & Son Fitness Challenge to Firebase Hosting..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "📦 Install it with: npm install -g firebase-tools"
    echo "🔗 Or visit: https://firebase.google.com/docs/cli"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found!"
    echo "📁 Make sure you're in the project directory"
    exit 1
fi

# Check if React app directory exists
if [ ! -d "fitness-tracker-react" ]; then
    echo "❌ fitness-tracker-react directory not found!"
    echo "📁 Make sure the React app is in the fitness-tracker-react folder"
    exit 1
fi

# Check if package.json exists in React app
if [ ! -f "fitness-tracker-react/package.json" ]; then
    echo "❌ React app package.json not found!"
    echo "📁 Make sure you're in the correct project directory"
    exit 1
fi

echo "✅ Pre-flight checks passed!"
echo ""

# Build the React app
echo "⚛️  Building React TypeScript app..."
cd fitness-tracker-react

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed!"
        exit 1
    fi
fi

# Build the app
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    echo "🔍 Check the error messages above for details"
    exit 1
fi

# Go back to root directory for Firebase deploy
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "💪 Your React TypeScript Dad & Son Fitness Challenge is now live!"
    echo ""
    echo "📱 Your app is available at:"
    firebase hosting:channel:open live 2>/dev/null || echo "   Check Firebase Console for your URL"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "🔍 Check the error messages above for details"
    exit 1
fi
