#!/bin/bash

set -e

echo "🚀 Starting Laravel Deployment Tasks..."

# Give permissions (for Linux environments)
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache


# Run artisan commands
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
php artisan migrate --force

echo "✅ Laravel deployment complete. Starting PHP-FPM..."
exec php-fpm -D -F -R
