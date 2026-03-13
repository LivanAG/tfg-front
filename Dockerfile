# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Recibir variable de entorno para la URL del API
ARG VITE_API_URL=http://localhost:8080

# Copiar solo package.json
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Compilar con Vite (pasando la variable de entorno)
RUN VITE_API_URL=$VITE_API_URL npm run build

# Stage 2: Serve con Nginx
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]