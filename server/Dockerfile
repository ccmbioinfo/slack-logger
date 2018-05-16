# version 8 LTS of Node.js
FROM node:carbon
# open web port
EXPOSE 80

WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD [ "yarn", "start" ]
