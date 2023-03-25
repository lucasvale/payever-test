FROM node:18 As development

RUN mkdir /usr/src/cache

WORKDIR /usr/src/cache

COPY package.json ./
COPY package-lock.json ./

RUN npm install --only=development

WORKDIR /usr/src/app

COPY . .