FROM node:18.18-apline3.18

WORKDIR /home/app

COPY . .

RUN yarn install --production

CMD ["node", "index.js"]

LABEL description="Mi aplicación de producción"

LABEL maintainer="Tu Nombre <routerflxv@gmail.com>"
