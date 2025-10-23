#!/bin/bash

# Kill any existing Next.js processes
echo "Stopping any existing servers..."
pkill -9 -f "node.*next" 2>/dev/null || true
sleep 2

# Start development server
echo "Starting development server..."
npm run dev
