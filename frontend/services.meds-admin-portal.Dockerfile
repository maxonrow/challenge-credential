FROM nginx:1.15.8-alpine as builder
WORKDIR /usr/share/nginx/html/
ADD ./dist /usr/share/nginx/html/

FROM nginx:1.15.8-alpine
WORKDIR /
COPY --from=builder /usr/share/nginx/html /usr/share/nginx/html

# Copy the respective nginx configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
RUN chown nginx:nginx /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
