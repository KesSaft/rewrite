FROM node:17.0.1
WORKDIR /api
COPY . .
EXPOSE 5000
RUN npm install
CMD chmod a+rwx /api
CMD node server.js