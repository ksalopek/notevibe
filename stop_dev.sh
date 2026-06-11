#!/bin/bash

echo "Stopping Laravel dev server..."
pkill -f "php artisan serve"

echo "Stopping Vite dev server..."
pkill -f "vite"

echo "Dev servers stopped."
