FROM node:16-bullseye

WORKDIR /sophi

COPY ./src ./src
COPY index.js .
COPY package.json .

RUN npm i --save-exact --exclude=dev

CMD ["node", "index.js"]
