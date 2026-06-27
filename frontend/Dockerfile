FROM node:22-alpine AS builder

WORKDIR /app

ARG BACKEND_URL=http://backend:4000
ARG NEXT_PUBLIC_MQTT_WSS_URL=wss://localhost:8084
ARG NEXT_PUBLIC_MQTT_TOPIC="chiro/sensores/#"

ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_MQTT_WSS_URL=$NEXT_PUBLIC_MQTT_WSS_URL
ENV NEXT_PUBLIC_MQTT_TOPIC=$NEXT_PUBLIC_MQTT_TOPIC

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

ARG BACKEND_URL=http://backend:4000
ENV NODE_ENV=production
ENV BACKEND_URL=$BACKEND_URL

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
