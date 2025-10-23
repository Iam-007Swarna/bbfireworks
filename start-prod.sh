#!/bin/bash

# Kill any existing Next.js processes
echo "Stopping any existing servers..."
pkill -9 -f "node.*next" 2>/dev/null || true
sleep 2

# Start production server
echo "Starting production server..."
npm run build
npm start
