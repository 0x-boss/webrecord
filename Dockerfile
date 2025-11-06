FROM node:24.11.0

RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

WORKDIR /webrecord

COPY package*.json ./

RUN npm install

RUN npx playwright install --with-deps

COPY . .

CMD ["node", "src/scroll.js"]
