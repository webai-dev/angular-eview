FROM node:10

RUN apt-get update && \
  apt-get install -y \
  libgtk2.0-0 \
  libnotify-dev \
  libgconf-2-4 \
  libnss3 \
  libxss1 \
  libasound2 \
  xvfb

WORKDIR /workspace

RUN npm install -g @angular/cli@8.3.20
RUN npm install -g ionic

COPY . . 
RUN npm install
RUN cd apps/hybrid-app
RUN npm install

ENV PATH /workspace/node_modules/.bin:$PATH
