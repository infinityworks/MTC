FROM node:8.11.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY ./assets /usr/src/app
COPY ./gulpfile.js /usr/src/app
COPY ./config.js /usr/src/app
RUN yarn install --ignore-engines --frozen-lockfile

COPY . .
RUN ./node_modules/.bin/gulp build
RUN yarn global add pm2

EXPOSE 3001
CMD ["./docker-start.sh" ]
