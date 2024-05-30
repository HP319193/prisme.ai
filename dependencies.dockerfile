## Install dependencies
FROM node:20 as build

WORKDIR /www
COPY package*.json /www/
COPY *.config.js /www/
COPY dtsgen.json /www/

## Build packages

COPY scripts/ /www/scripts
COPY specifications/ /www/specifications

COPY services/runtime/package* /www/services/runtime/
COPY services/workspaces/package* /www/services/workspaces/
COPY services/api-gateway/package* /www/services/api-gateway/
COPY services/events/package* /www/services/events/

# Packages
COPY packages/ /www/packages
RUN rm -rf packages/design-system packages/sdk packages/blocks

RUN BUILD_PACKAGES=0 npm ci

# Build packages && replace their node_modules symlinks with themselves
RUN npm run build:types && npm run build:packages && rm -rf node_modules/@prisme.ai && mv packages/ node_modules/@prisme.ai

FROM node:20-alpine as node_modules

WORKDIR /www
COPY --from=build /www/package*.json /www/
COPY --from=build /www/dtsgen.json /www/
COPY --from=build /www/node_modules/ /www/node_modules/
COPY --from=build /www/specifications/ /www/specifications
