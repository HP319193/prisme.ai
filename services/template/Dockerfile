ARG DEPENDENCIES_IMAGE=registry.gitlab.com/prisme.ai/prisme.ai/prisme.ai-dependencies
ARG DEPENDENCIES_TAG=latest

FROM $DEPENDENCIES_IMAGE:$DEPENDENCIES_TAG as build

WORKDIR /www

COPY services/template/ /www/services/template
# If we do not move node_modules @prisme.ai/ as ./packages, npm prune --production broke them trying to recreate usual symlinks
RUN npm run build:template && mv node_modules/@prisme.ai packages/ && npm prune --production

EXPOSE 3003
ENV OPENAPI_FILEPATH /www/specifications/swagger.yml
ENV NODE_ENV production

CMD [ "node", "--abort-on-uncaught-exception", "services/template/dist/index.js"]
