FROM node:12 as build

WORKDIR /www
# Install dependencies
COPY package*.json /www/
COPY tsconfig.json /www/
RUN npm ci

# Copy sourcecode & build bundle
COPY . /www
RUN npm run build

# Running environment
FROM node:12-alpine
WORKDIR /www

COPY package.json /www/
COPY --from=build /www/node_modules/ /www/node_modules/
COPY --from=build /www/dist/ /www
COPY --from=build /www/dist/index.js /www
RUN npm prune --production

COPY specifications/ /www/specifications/

EXPOSE 3030


CMD [ "node", "--abort-on-uncaught-exception", "index.js"]
