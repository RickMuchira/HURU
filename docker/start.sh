#!/bin/sh
set -e

cd /var/www/html

# Render provides $PORT dynamically. Fall back locally.
: "${PORT:=8080}"

# Build nginx config from template (needs envsubst).
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Cache config, routes, views
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Link storage
php artisan storage:link || true

# Start supervisor (nginx + php-fpm)
exec supervisord -c /etc/supervisord.conf
