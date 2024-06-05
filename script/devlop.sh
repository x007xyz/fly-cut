pnpm run build-only && \
scp -i ~/.ssh/id -r dist/* root@47.97.156.176:/usr/share/nginx/html/editor/

