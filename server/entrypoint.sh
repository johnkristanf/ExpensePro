#!/bin/bash

set -e

echo "🚀 Starting Laravel Deployment Tasks..."

# Give permissions (for Linux environments)
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache


# Run database migrations
php artisan migrate --force

# Run artisan commands
php artisan optimize:clear

echo "✅ Laravel deployment complete. Starting PHP-FPM..."
exec php-fpm -D -F -R
