FROM node:24

WORKDIR /app

COPY package* .

RUN npm install

CMD ["npm", "run", "dev", "--", "--host"]
