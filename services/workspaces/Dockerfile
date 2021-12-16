FROM node:12 as build
# RUN apk add --no-cache git python2 make g++

WORKDIR /www
# Install dependencies
COPY package*.json /www/
COPY tsconfig.json /www/
RUN npm set progress=false && npm install -s --no-progress

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

EXPOSE 3030

CMD [ "node", "--abort-on-uncaught-exception", "index.js"]
