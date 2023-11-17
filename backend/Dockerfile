FROM node:18.18-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN yarn install --production

EXPOSE 4000

CMD ["node", "index.js"]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
