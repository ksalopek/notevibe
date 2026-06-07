#!/bin/sh

# Cache configurations
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache

# Fix permissions that might have been changed to root by the artisan commands above
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Run migrations (Optional, but usually a good idea in production if it's safe)
# php artisan migrate --force

# Start PHP-FPM in daemon mode
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"
