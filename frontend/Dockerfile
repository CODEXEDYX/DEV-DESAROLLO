# Utilice el tiempo de ejecución oficial de Node.js como imagen base
FROM node:20.9.0-alpine3.17 as build
# Establezca el directorio de trabajo en el contenedor
WORKDIR /app
# Copie package.json y package-lock.json al directorio de trabajo
COPY package*.json ./
# Instalar dependencias
RUN yarn install --production
# Copiar el código completo de la aplicación al contenedor
COPY . .
# Construya la aplicación React para producción
RUN yarn build
# Use Nginx como servidor de producción
FROM nginx:1.24.0-alpine3.17
# Copie la aplicación React construida al directorio del servidor web de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Exponer el puerto 80 para el servidor Nginx
EXPOSE 80
# Iniciar Nginx cuando el contenedor ejecute
CMD [ "nginx" , "-g" , "daemon off;" ]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
