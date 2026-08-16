# Stage 1: Build the Vite frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_AI_API_URL
ARG VITE_BUSINESS_API_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL
ENV VITE_BUSINESS_API_URL=$VITE_BUSINESS_API_URL

RUN npm run build


# Stage 2: Serve the production build
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]