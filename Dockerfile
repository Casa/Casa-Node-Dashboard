# specify the node base image with your desired version node:<version>
FROM node:8-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN CYPRESS_INSTALL_BINARY=0 yarn install

# Bundle app source
COPY . .

RUN yarn run build

ENV HOST 0.0.0.0

EXPOSE 3000
CMD [ "yarn", "start" ]
