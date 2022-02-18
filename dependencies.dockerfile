## Install dependencies
FROM node:16 as build

WORKDIR /www
COPY package*.json /www/
COPY *.config.js /www/
COPY dtsgen.json /www/
COPY patches/ /www/patches

## Build packages

COPY scripts/ /www/scripts
COPY specifications/ /www/specifications
COPY packages/ /www/packages

RUN npm ci

# Build packages && replace their node_modules symlinks with themselves
RUN npm run build:packages && rm -rf node_modules/@prisme.ai && mv packages/ node_modules/@prisme.ai

FROM node:16-alpine as node_modules

WORKDIR /www
COPY --from=build /www/package*.json /www/
COPY --from=build /www/*.config.js /www/
COPY --from=build /www/dtsgen.json /www/
COPY --from=build /www/node_modules/ /www/node_modules/
COPY --from=build /www/specifications/ /www/specifications
