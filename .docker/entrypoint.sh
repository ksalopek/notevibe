#!/bin/sh

# We will skip artisan caching for now to avoid fatal environment errors

# Ensure permissions are correct
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Run migrations (Optional, but usually a good idea in production if it's safe)
# php artisan migrate --force

# Start PHP-FPM in daemon mode
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"
