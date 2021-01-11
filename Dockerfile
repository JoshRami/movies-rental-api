FROM node:15

WORKDIR /user/src/app

COPY . .

RUN npm install
EXPOSE 3000

CMD ["node", "dist/main",] 