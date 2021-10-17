FROM node:14.18-alpine AS server-build
WORKDIR /app
COPY server/ ./server/
RUN cd server && npm install && npm run build

FROM node:14.18-alpine AS client-build
WORKDIR /app
COPY client/ ./client/
RUN cd client && npm install && npm run build

FROM node:14.18-alpine
WORKDIR /app
COPY --from=client-build /app/client/dist ./
COPY --from=client-build /app/client/index.css ./
COPY --from=client-build /app/client/index.html ./
COPY --from=server-build /app/server/dist ./
ENV PATH /app/node_modules/.bin:$PATH
ADD server/package.json /app
RUN npm install
ADD . /app

RUN ls

EXPOSE 80
CMD [ "npm", "start" ]