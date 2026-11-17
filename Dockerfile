# Container image for Cloud Run. Pages are generated at build time from content/, so each branch
# (main = live, ath/translations = preview) gets its own image with that branch's content.
#   docker build --build-arg NEXT_PUBLIC_SITE_MODE=preview -t ath-content-demo .

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_SITE_MODE=live
ENV NEXT_PUBLIC_SITE_MODE=$NEXT_PUBLIC_SITE_MODE
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/content ./content
USER node
EXPOSE 8080
CMD ["node", "server.js"]
