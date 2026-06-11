#!/bin/bash

# Start Laravel backend server
echo "Starting Laravel server on port 8000..."
php artisan serve &

# Start Vite frontend dev server
echo "Starting Vite dev server..."
npm run dev &

# Wait for all background processes to keep the script running
wait
