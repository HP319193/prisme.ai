## Install dependencies
FROM node:16 as node_modules

WORKDIR /www
COPY package*.json /www/
COPY *.config.js /www/
COPY dtsgen.json /www/

# Workspaces
COPY services/workspaces/package*.json /www/services/workspaces/
COPY services/workspaces/tsconfig.json /www/services/workspaces/
COPY services/workspaces/*.config.js /www/services/workspaces/

# Packages
COPY specifications/ /www/specifications
COPY packages/ /www/packages

RUN npm ci

## Build workspaces
FROM node:16 as build
WORKDIR /www

# Copy sourcecode & build bundle
COPY --from=node_modules /www/ /www/
COPY services/workspaces/ /www/services/workspaces
RUN npm run build:workspaces

## Running environment
FROM node:16-alpine
WORKDIR /www

COPY services/workspaces/package.json /www/
COPY --from=node_modules /www/node_modules/ /www/node_modules/
COPY --from=build /www/services/workspaces/dist/ /www
COPY --from=build /www/services/workspaces/dist/index.js /www
RUN npm prune --production

COPY specifications/ /www/specifications/

EXPOSE 3030


CMD [ "node", "--abort-on-uncaught-exception", "index.js"]
