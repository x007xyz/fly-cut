FROM nginx:latest

# 将本地的 nginx.conf 配置文件复制到容器中的 /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 将本地的 Vue 3 项目构建文件复制到容器中的 /usr/share/nginx/html 目录下
COPY dist /usr/share/nginx/html/editor

COPY dianshi /usr/share/nginx/html/dianshi
