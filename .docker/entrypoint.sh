#!/bin/sh

# We will skip artisan caching for now to avoid fatal environment errors

# Ensure permissions are correct
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Force PHP to show raw errors on the screen so we aren't guessing
echo "display_errors = On" > /usr/local/etc/php/conf.d/docker-php-ext-error.ini
echo "error_reporting = E_ALL" >> /usr/local/etc/php/conf.d/docker-php-ext-error.ini

# Run migrations (Optional, but usually a good idea in production if it's safe)
# php artisan migrate --force

# Start Laravel's built-in server directly
echo "Starting artisan serve..."
php artisan serve --host=0.0.0.0 --port=80
