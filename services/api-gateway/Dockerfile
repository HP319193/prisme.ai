FROM node:16-alpine as build

WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY ./src /app/src
RUN npm ci
RUN npm run build

FROM node:16-alpine
WORKDIR /app

COPY package.json /app/
COPY --from=build /app/node_modules/ /app/node_modules/
COPY --from=build /app/dist/ /app
COPY --from=build /app/dist/index.js /app

COPY specifications/ /specifications/

RUN npm prune --production

CMD [ "node", "--abort-on-uncaught-exception", "index.js" ]
