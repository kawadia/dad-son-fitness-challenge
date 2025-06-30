#!/bin/bash

# Firebase Deployment Script for Dad & Son Fitness Challenge
# Make sure you have Firebase CLI installed: npm install -g firebase-tools

echo "🔥 Deploying Dad & Son Fitness Challenge to Firebase Hosting..."
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

# Check if config.js exists
if [ ! -f "config.js" ]; then
    echo "❌ config.js not found!"
    echo "⚙️  Make sure your Firebase configuration is set up"
    exit 1
fi

echo "✅ Pre-flight checks passed!"
echo ""

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "💪 Your Dad & Son Fitness Challenge is now live!"
    echo ""
    echo "📱 Your app is available at:"
    firebase hosting:channel:open live 2>/dev/null || echo "   Check Firebase Console for your URL"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "🔍 Check the error messages above for details"
    exit 1
fi
