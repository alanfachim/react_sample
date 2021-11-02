FROM node:12

ENV PORT 80

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm cache clean --force
RUN npm install

# Copying source files
COPY . /usr/src/app
RUN echo "DB_CONNECTION_STRING=mongodb://balta:e296cd9f@localhost:27017/admin" > /usr/src/app/.ENV

# Building app
RUN npm run build
EXPOSE 80

# Running the app
CMD "npm" "run" "dev"