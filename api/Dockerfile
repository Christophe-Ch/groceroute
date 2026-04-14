FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY * ./

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start:dev" ]