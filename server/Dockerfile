FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl unzip zip libpng-dev libonig-dev nano libxml2-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Create entrypoint script for more robust startup
RUN chmod +x /var/www/entrypoint.sh

# Expose ports
EXPOSE 9000

ENTRYPOINT ["/var/www/entrypoint.sh"]
