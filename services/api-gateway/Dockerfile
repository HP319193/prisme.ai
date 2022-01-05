## Install dependencies
FROM node:16 as node_modules

WORKDIR /www
COPY package*.json /www/
COPY *.config.js /www/
COPY dtsgen.json /www/

# Gateway
COPY services/api-gateway/package*.json /www/services/api-gateway/
COPY services/api-gateway/tsconfig.json /www/services/api-gateway/

# Packages
COPY specifications/ /www/specifications
COPY packages/ /www/packages

RUN npm ci

## Build api-gateway
FROM node:16 as build
WORKDIR /www

# Copy sourcecode & build bundle
COPY --from=node_modules /www/ /www/
COPY services/api-gateway/ /www/services/api-gateway
RUN npm run build:gateway

## Running environment
FROM node:16-alpine
WORKDIR /www

COPY services/api-gateway/package.json /www/
COPY --from=node_modules /www/node_modules/ /www/node_modules/
COPY --from=build /www/services/api-gateway/dist/ /www
COPY --from=build /www/services/api-gateway/dist/index.js /www
RUN npm prune --production

COPY specifications/ /www/specifications/

ENV OPENAPI_FILEPATH /www/specifications/swagger.yml

EXPOSE 3030


CMD [ "node", "--abort-on-uncaught-exception", "index.js"]
