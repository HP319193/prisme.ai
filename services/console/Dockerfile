FROM node:16 as build
WORKDIR /www


COPY . /www/
RUN rm -rf /www/services/console/.next
# If we do not move node_modules @prisme.ai/ as ./packages, npm prune --production broke them trying to recreate usual symlinks
RUN npm ci && npm run build:console && mv node_modules/@prisme.ai packages/ && npm prune --production

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "--prefix", "services/console", "start"]
