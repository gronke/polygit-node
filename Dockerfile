FROM node:4.0.0
EXPOSE 3333
COPY . /src
CMD cd /src; node --harmony index.js
RUN cd /src; npm install --no-color
