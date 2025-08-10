#!/bin/bash

set -e

echo "🚀 Starting Laravel Deployment Tasks..."

# Give permissions (for Linux environments)
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "Composer Version:"
composer --version

# Install Composer dependencies
echo "Installing Composer dependencies..."
composer install --no-interaction --no-dev --optimize-autoloader

# Run database migrations
php artisan migrate --seed --force

# Run artisan commands
php artisan optimize:clear

echo "✅ Laravel deployment complete. Starting PHP-FPM..."
exec php-fpm -D -F -R
