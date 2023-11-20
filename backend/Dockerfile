FROM node:20.9.0-alpine3.17

WORKDIR /home/app

COPY . .

RUN yarn install --production

CMD ["node", "index.js"]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
