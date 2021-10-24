FROM node:14.18-alpine AS server-build
WORKDIR /app
COPY server/ ./server/
RUN cd server && npm install && npm run build
# RUN cd ./server/dist 
# RUN ls

FROM node:14.18-alpine AS client-build
WORKDIR /app
COPY client/ ./client/
RUN cd client && npm install && npm run build

FROM node:14.18-alpine
WORKDIR /app
COPY --from=client-build /app/client/dist ./
COPY --from=server-build /app/server/dist ./
ENV PATH /app/node_modules/.bin:$PATH
ADD server/package.json /app
RUN npm install
ADD . /app

# RUN apk update && apk add bash

# RUN ls
CMD [ "npm", "start" ]