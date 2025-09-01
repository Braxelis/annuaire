# --- Etape 1 : vendor
FROM composer:2 AS vendor
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --prefer-dist --no-progress --no-interaction
COPY backend/ ./
RUN composer dump-autoload -o

# --- Etape 2 : runtime Apache + PHP
FROM php:8.2-apache

# Extensions nécessaires (ajoute en cas de besoin : intl, gd, zip, mbstring…)
RUN apt-get update && apt-get install -y libonig-dev libicu-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring intl \
    && a2enmod rewrite headers

# VirtualHost
COPY docker/backend/vhost.conf /etc/apache2/sites-available/000-default.conf

# Code + vendor
WORKDIR /var/www/html
COPY --from=vendor /app/ ./

# Permissions
RUN chown -R www-data:www-data /var/www/html

# Healthcheck simple (adapte la route si tu as /health)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost/index.php || exit 1
