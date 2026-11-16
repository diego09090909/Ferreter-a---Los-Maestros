# Etapa 1: build de producción con Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# En Docker todo pasa por Nginx, así que ms-usuarios también se llama con ruta relativa
ARG VITE_API_USUARIOS=/api/v1
ENV VITE_API_USUARIOS=$VITE_API_USUARIOS
RUN npm run build

# Etapa 2: Nginx sirve el front y reparte /api a cada microservicio
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
