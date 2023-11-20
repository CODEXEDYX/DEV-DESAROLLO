FROM node:20.9.0-alpine3.17

WORKDIR /app

COPY package*.json /app/

RUN yarn install --production

EXPOSE 4000

CMD ["node", "index.js"]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
