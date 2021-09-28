#!/bin/bash

# This shell script sets the api url based on an environment variable and starts nginx in foreground.

VIKUNJA_API_URL="${VIKUNJA_API_URL:-"/api/v1"}"

VIKUNJA_HTTP_PORT="${VIKUNJA_HTTP_PORT:-80}"
VIKUNJA_HTTPS_PORT="${VIKUNJA_HTTP_PORT:-443}"

# Escape the variable to prevent sed from complaining
VIKUNJA_API_URL=$(echo $VIKUNJA_API_URL |sed 's/\//\\\//g')

sed -i "s/http\:\/\/localhost\:3456\/api\/v1/$VIKUNJA_API_URL/g" /usr/share/nginx/html/index.html

sed -i "s/listen 80/listen $VIKUNJA_HTTP_PORT/g" nginx.conf
sed -i "s/listen 443/listen $VIKUNJA_HTTPS_PORT/g" nginx.conf

# Set the uid and gid of the nginx run user
usermod --non-unique --uid ${PUID} nginx
groupmod --non-unique --gid ${PGID} nginx

nginx -g "daemon off;"
