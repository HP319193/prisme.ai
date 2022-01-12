## Install dependencies
FROM node:16 as build

WORKDIR /www
COPY package*.json /www/
COPY *.config.js /www/
COPY dtsgen.json /www/

COPY services/console/package.json /www/services/console/package.json

COPY services/runtime/package.json /www/services/runtime/package.json
COPY services/runtime/package-lock.json /www/services/runtime/package-lock.json

COPY services/workspaces/package.json /www/services/workspaces/package.json
COPY services/workspaces/package-lock.json /www/services/workspaces/package-lock.json

COPY services/api-gateway/package.json /www/services/api-gateway/package.json
COPY services/api-gateway/package-lock.json /www/services/api-gateway/package-lock.json


# Packages
COPY packages/broker/package.json /www/packages/broker/package.json
COPY packages/broker/package-lock.json /www/packages/broker/package-lock.json

COPY packages/validation/package.json /www/packages/validation/package.json

RUN BUILD_PACKAGES=0 npm ci

## Build packages

COPY specifications/ /www/specifications
COPY packages/ /www/packages

# Build packages && replace their node_modules symlinks with themselves
RUN npm run build:types && npm run build:packages && rm -rf node_modules/@prisme.ai && mv packages/ node_modules/@prisme.ai

FROM node:16-alpine as node_modules

WORKDIR /www
COPY --from=build /www/package*.json /www/
COPY --from=build /www/*.config.js /www/
COPY --from=build /www/dtsgen.json /www/
COPY --from=build /www/node_modules/ /www/node_modules/
COPY --from=build /www/specifications/ /www/specifications
