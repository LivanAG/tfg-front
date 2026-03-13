# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y lock
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código
COPY . .

# Compilar con Vite
RUN npm run build

# Stage 2: Serve con Nginx
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]