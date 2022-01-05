## Install dependencies
FROM node:16 as node_modules

WORKDIR /www
COPY package*.json /www/
COPY *.config.js /www/
COPY dtsgen.json /www/

# Runtime
COPY services/runtime/package*.json /www/services/runtime/
COPY services/runtime/tsconfig.json /www/services/runtime/
COPY services/runtime/*.config.js /www/services/runtime/

# Packages
COPY specifications/ /www/specifications
COPY packages/ /www/packages

RUN npm ci

## Build runtime
FROM node:16 as build
WORKDIR /www

# Copy sourcecode & build bundle
COPY --from=node_modules /www/ /www/
COPY services/runtime/ /www/services/runtime
RUN npm run build:runtime

## Running environment
FROM node:16-alpine
WORKDIR /www

COPY services/runtime/package.json /www/
COPY --from=node_modules /www/node_modules/ /www/node_modules/
COPY --from=build /www/services/runtime/dist/ /www
COPY --from=build /www/services/runtime/dist/index.js /www
RUN npm prune --production

COPY specifications/ /www/specifications/

EXPOSE 3030


CMD [ "node", "--abort-on-uncaught-exception", "index.js"]
