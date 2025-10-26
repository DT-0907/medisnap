#!/bin/bash

# MedSnap Local Development Startup Script

echo "🚀 Starting MedSnap Local Development Environment..."
echo ""

# Check if .env file exists
if [ ! -f "medisnap/backend/.env" ]; then
    echo "⚠️  Warning: .env file not found in medisnap/backend/"
    echo "   Creating from .env.example..."
    cp medisnap/backend/.env.example medisnap/backend/.env
    echo "   Please edit medisnap/backend/.env with your API keys"
    echo ""
fi

# Check for node_modules
if [ ! -d "medisnap/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd medisnap/backend
    npm install
    cd ../..
    echo ""
fi

# Start backend server
echo "🖥️  Starting backend server on http://localhost:3000..."
echo "   Press Ctrl+C to stop"
echo ""

cd medisnap/backend

# Export NODE_ENV for development
export NODE_ENV=development

# Start the server
npm run dev

# Note: After Ctrl+C, the script will continue here
echo ""
echo "👋 Backend server stopped"
echo "   To restart: ./start-local.sh"