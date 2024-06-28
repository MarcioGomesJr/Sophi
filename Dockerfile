FROM node:20.13.1-alpine3.19

WORKDIR /sophi

COPY ./src ./src
COPY index.js .
COPY package.json .

RUN npm i --save-exact --exclude=dev

CMD ["node", "index.js"]
