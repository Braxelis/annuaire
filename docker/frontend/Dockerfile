FROM nginx:1.27-alpine
# Fichiers statiques
COPY frontend/public /usr/share/nginx/html
# Conf Nginx (sert le front et proxy /api vers backend)
COPY docker/frontend/default.conf /etc/nginx/conf.d/default.conf
