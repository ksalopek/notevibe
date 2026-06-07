# -----------------------------------------------------
# Stage 1: Build Frontend Assets
# -----------------------------------------------------
FROM node:20-alpine AS node_builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application and build
COPY . .
RUN npm run build

# -----------------------------------------------------
# Stage 2: Build PHP Backend & Serve with Nginx
# -----------------------------------------------------
FROM php:8.4-fpm-alpine

# Install system dependencies and Nginx
RUN apk add --no-cache \
    nginx \
    zip \
    unzip \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . .

# Copy built frontend assets from the node_builder stage
COPY --from=node_builder /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set appropriate permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Configure Nginx
COPY .docker/nginx.conf /etc/nginx/http.d/default.conf

# Add entrypoint script
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
