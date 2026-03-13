# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo package.json
COPY package.json ./

# Instalar dependencias
RUN npm install

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

CMD ["nginx", "-g", "daemon off;"]