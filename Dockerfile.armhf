FROM arm32v7/node:8-stretch

# need qemu to emulate arm architecture
# can be downloaded here, $ docker run -v /usr/bin/qemu-arm-static:/usr/bin/qemu-arm-static --rm -ti arm32v7/debian:stretch-slim
COPY ./qemu-arm-static /usr/bin/qemu-arm-static

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn install

# Bundle app source
COPY . .

RUN yarn run build

ENV HOST 0.0.0.0

EXPOSE 3000
CMD [ "yarn", "start" ]
