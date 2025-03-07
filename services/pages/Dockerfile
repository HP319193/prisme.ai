FROM node:20 as build
WORKDIR /www

COPY ./package.json ./package-lock.json ./rollup.config.js ./dtsgen.json /www/
COPY ./scripts/buildInstructions.ts /www/scripts/
COPY ./packages /www/packages
COPY ./services/pages/package*  /www/services/pages/

# Pages dependencies
COPY ./services/console/  /www/services/console/
RUN rm -rf /www/services/console/package*

RUN npm ci

COPY ./services/pages/ /www/services/pages
RUN rm -rf /www/services/pages/.next && \
    rm -rf /www/services/pages/.eslintrc.json && \
    mv /www/services/pages/_babelrc /www/services/pages/.babelrc

COPY ./specifications /www/specifications
RUN npm run build:packages && \
    npm run build:pages && \
    npm prune --production

FROM node:20-alpine as runtime

WORKDIR /www
COPY --from=build /www/packages /www/packages
COPY --from=build /www/services/pages/  /www/services/pages/
COPY --from=build /www/package.json /www/package-lock.json /www/rollup.config.js /www/dtsgen.json /www/
COPY --from=build /www/specifications/  /www/specifications/
COPY --from=build /www/node_modules/  /www/node_modules/

# Pages dependencies
COPY --from=build /www/services/console/  /www/services/console/

EXPOSE 3100
ENV PORT 3100
ENV NODE_ENV production
ENV NPM_CONFIG_OFFLINE true
ENV NPM_CONFIG_LOGS_MAX 0

# This is required to allow our start.js script update next 404.html files with env vars on startup
RUN chown -R node:node /www/services/pages/.next/server/pages/ && \
    find /www/services/pages/.next/server/pages/ -name "404.html" -exec chmod g+w {} \; && \
    chown node:node /www/services/pages/docker/start.js && \
    chmod g+s /www/services/pages/docker/start.js

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1


CMD ["/www/services/pages/docker/start.sh"]
