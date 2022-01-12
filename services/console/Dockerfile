ARG DEPENDENCIES_IMAGE=registry.gitlab.com/prisme.ai/prisme.ai/prisme.ai-dependencies
ARG DEPENDENCIES_TAG=latest

FROM $DEPENDENCIES_IMAGE:$DEPENDENCIES_TAG as build
WORKDIR /www

RUN apk add --no-cache libc6-compat

COPY services/console/ /www/services/console
# If we do not move node_modules @prisme.ai/ as ./packages, npm prune --production broke them trying to recreate usual symlinks
RUN npm run build:console && mv node_modules/@prisme.ai packages/ && npm prune --production

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1


CMD ["npm", "--prefix", "services/console", "start"]
