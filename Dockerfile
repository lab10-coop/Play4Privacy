FROM node:6.11-alpine

ARG WORK_DIR=/usr/src/app

# Create app directory and frontend directory
RUN mkdir -p ${WORK_DIR}
WORKDIR ${WORK_DIR}

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY . ${WORK_DIR}
RUN npm install && npm cache clean
RUN cd frontend && npm i && npm run build && rm -r node_modules

EXPOSE 3001
CMD [ "npm", "run", "server" ]
