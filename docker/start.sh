#!/bin/sh
set -e

cd /var/www/html

# Cache config, routes, views
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Link storage
php artisan storage:link || true

# Start supervisor (nginx + php-fpm + queue worker)
exec supervisord -c /etc/supervisord.conf
