FROM node:20.9.0-alpine3.17

WORKDIR /app

COPY package*.json ./

RUN apk update && apk upgrade \
    && apk add --no-cache openssl=3.0.12-r0 \
    && apk add --no-cache libressl=3.0.12-r0 \
    && yarn install --production

EXPOSE 4000

CMD ["node", "index.js"]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
