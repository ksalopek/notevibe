#!/bin/sh

# Cache configurations
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache

# Run migrations (Optional, but usually a good idea in production if it's safe)
# php artisan migrate --force

# Start PHP-FPM in daemon mode
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"
