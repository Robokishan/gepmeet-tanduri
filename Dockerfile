
# build environment
FROM node:16-bullseye as deps
RUN apt-get update \
    && apt-get install -y net-tools build-essential python3 python3-pip valgrind
WORKDIR /usr/src/app
COPY yarn.lock package.json ./
RUN yarn


FROM node:16-bullseye as builder
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN yarn build

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/build ./build
ENV NODE_ENV production
CMD [ "npm", "start" ]
USER node


# FROM node:14
# WORKDIR /usr/src/app
# COPY package.json yarn.lock ./
# RUN yarn
# COPY . .
# RUN yarn build
# ENV NODE_ENV production
# CMD [ "npm", "start" ]
# USER node