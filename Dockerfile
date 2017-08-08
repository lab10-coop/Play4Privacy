FROM node:6.11-alpine

ARG WORK_DIR=/usr/src/app

RUN mkdir -p ${WORK_DIR}
WORKDIR ${WORK_DIR}

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY frontend/package.json ${WORK_DIR}
RUN npm install && npm cache clean

COPY frontend ${WORK_DIR}

EXPOSE 3000
CMD [ "npm", "start" ]