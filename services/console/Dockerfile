FROM node:16 as build
WORKDIR /www

COPY ./package.json ./package-lock.json ./rollup.config.js ./dtsgen.json /www/
COPY ./scripts/buildInstructions.ts /www/scripts/
COPY ./packages /www/packages
COPY ./services/console/package*  /www/services/console/

RUN npm ci

COPY ./services/console/ /www/services/console
RUN rm -rf /www/services/console/.next && \
    rm -rf /www/services/console/.eslintrc.json && \
    mv /www/services/console/_babelrc /www/services/console/.babelrc

COPY ./specifications /www/specifications
RUN npm run build:packages && \
    npm run build:console && \
    npm prune --production

FROM node:16-alpine as runtime

WORKDIR /www
COPY --from=build /www/packages /www/packages
COPY --from=build /www/services/console/  /www/services/console/
COPY --from=build /www/package.json /www/package-lock.json /www/rollup.config.js /www/dtsgen.json /www/
COPY --from=build /www/specifications/  /www/specifications/
COPY --from=build /www/node_modules/  /www/node_modules/

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production
ENV NPM_CONFIG_OFFLINE true
ENV NPM_CONFIG_LOGS_MAX 0

# This is required to allow our start.js script update next 404.html files with env vars on startup
RUN chown -R node:node /www/services/console/.next/server/pages/ && \
    find /www/services/console/.next/server/pages/ -name "404.html" -exec chmod g+w {} \;

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "--prefix", "services/console", "start"]
