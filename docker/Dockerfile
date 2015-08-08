# Version: 0.1
From hub.prisem.washington.edu:5000/dims:0.3
MAINTAINER Linda Parsons "linda.parsons@nextcentury.com"

ENV VERSION 0.1
ENV LAST_UPDATED 2015-08-07

ENV NODE_VERSION 0.12.7
ENV NPM_VERSION 2.11.3

# Node install based upon joyent/docker-node/0.12/wheezy/Dockerfile

# verify gpg and sha256: http://nodejs.org/dist/v0.10.30/SHASUMS256.txt.asc
# gpg: aka "Timothy J Fontaine (Work) <tj.fontaine@joyent.com>"
# gpg: aka "Julien Gilli <jgilli@fastmail.fm>"
RUN gpg --keyserver pool.sks-keyservers.net --recv-keys 7937DFD2AB06298B2293C3187D33FF9D0246406D 114F43EE0176B71C7BC219DD50A3051F888C628D

RUN curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
  && npm install -g npm@"$NPM_VERSION" \
  && npm install -g grunt-cli bower \
  && npm cache clear
  

# Download package from depts to /opt/dims/srv:

USER dims
WORKDIR /opt/dims/srv/dashboard

# Install dependencies
RUN cd server && \
    npm install && \
    cd ../client && \
    npm install && \
    bower install

# Will use script for start so can set ENV vars at runtime via docker

CMD [ "bash" ]
