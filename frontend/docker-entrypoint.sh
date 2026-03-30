#!/bin/sh
set -e

# Normalise BASE_PATH:
#   /sqlbloques/  → /sqlbloques   (strip trailing slash)
#   /             → ""            (root means no prefix)
BASE_PATH="${BASE_PATH:-}"
BASE_PATH="${BASE_PATH%/}"
[ "$BASE_PATH" = "/" ] && BASE_PATH=""
export BASE_PATH

echo "Starting nginx with BASE_PATH='${BASE_PATH}'"

# Substitute only ${BASE_PATH} in the template, leaving all other nginx
# variables (e.g. $uri, $host, $remote_addr) untouched.
envsubst '${BASE_PATH}' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
