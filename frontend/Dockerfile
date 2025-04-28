FROM node:22-slim
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn build
CMD ["yarn", "run", "dev"]