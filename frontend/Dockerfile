FROM node:10.13.0-alpine as builder
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.15.8-alpine
WORKDIR /
COPY --from=builder /frontend/dist /usr/share/nginx/html

# Copy the respective nginx configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
RUN chown nginx:nginx /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
