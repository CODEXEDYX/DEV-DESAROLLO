FROM node:18.17.1

WORKDIR /home/app

COPY . .

RUN yarn install --production

CMD ["node", "index.js"]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
