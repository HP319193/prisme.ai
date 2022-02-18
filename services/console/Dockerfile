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
RUN npm run build:packages
RUN npm run build:console

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "--prefix", "services/console", "start"]
