#!/bin/bash

# movemaster-js setup script
# This script installs dependencies, builds the frontend, and starts the application

set -e  # Exit on any error

echo "🤖 Setting up movemaster-js..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install

# Build and deploy frontend
echo "🏗️  Building and deploying frontend..."
cd ../frontend
npm run deploy

# Start the backend server
echo "🚀 Starting the backend server..."
cd ../backend
echo "✅ Setup complete! The application should now be running."
echo "🌐 Open your browser and navigate to http://localhost:3000"
npm run start
