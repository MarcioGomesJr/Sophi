FROM node:16-bullseye

WORKDIR /sophi

COPY ./src ./src
COPY index.js .
COPY package.json .

RUN npm i --exclude=dev

RUN apt-get update
RUN apt-get install -y ffmpeg

CMD ["node", "index.js"]
