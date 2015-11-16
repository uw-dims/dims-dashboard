FROM debian:stable

ENV DEBIAN_FRONTEND noninteractive
ENV VERSION 0.1
ENV LAST_UPDATED 2015-09-02
ENV LANGUAGE en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
ENV LC_CTYPE en_US.UTF-8

ENV PATH /opt/dims/bin:$PATH
ENV IPGREPNETWORKS /opt/dims/src/ipgrep/ipgrep_networks_prisem.yml

# Maybe could split the above into another image and base this upon it
ENV NODE_VERSION 0.12.7
ENV NPM_VERSION 2.11.3

ADD locale.gen /etc/locale.gen

# Locales
# Dependencies for ipgrep (perl) and prisem scripts (python)
# git is dependency of bower

# Node install based upon joyent/docker-node/0.12/wheezy/Dockerfile
# verify gpg and sha256: http://nodejs.org/dist/v0.10.30/SHASUMS256.txt.asc
# gpg: aka "Timothy J Fontaine (Work) <tj.fontaine@joyent.com>"
# gpg: aka "Julien Gilli <jgilli@fastmail.fm>"


RUN (apt-get clean \
        && apt-key update \
  && apt-get -q -y update --fix-missing \
        && apt-get -q -y update \
  && apt-get install -q -y apt-utils \
  && apt-get install -q -y locales \
  && locale-gen \
  && locale-gen en_US.UTF-8 \
  && dpkg-reconfigure locales \
  && apt-get install -q -y curl \
        python \
        python-dev \
        python-pip \
        python-amqplib \
        libncurses-dev \
        libnet-netmask-perl \
        libjson-perl \
        libperl4-corelibs-perl \
        libyaml-libyaml-perl \
        git \
  && apt-get clean && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/* \
  && gpg --keyserver pool.sks-keyservers.net --recv-keys 7937DFD2AB06298B2293C3187D33FF9D0246406D 114F43EE0176B71C7BC219DD50A3051F888C628D \
  && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
  && npm install -g npm@"$NPM_VERSION" \
  && npm install -g grunt-cli bower \
  && npm cache clear \
  && mkdir -p /opt/dims/data /opt/dims/srv /opt/dims/src /opt/dims/bin \
  && mkdir -p /opt/dims/srv/dims-dashboard \
  && mkdir -p /opt/dims/data/dashboard/ipFiles /opt/dims/data/dashboard/mapFiles /opt/dims/data/dashboard/dataFiles \
  && mkdir -p /opt/dims/data/dashboard/upload /opt/dims/data/dashboard/logs )

# Note /opt/dims/bin required for ipgrep install

ADD https://depts.washington.edu/dimsdoc/artifacts/dims-sample-data-develop.tgz /tmp/
ADD https://depts.washington.edu/dimsdoc/artifacts/ipgrep-develop.tgz /tmp/
ADD https://depts.washington.edu/dimsdoc/artifacts/prisem-develop.tgz /tmp/

RUN ( tar xzf /tmp/dims-sample-data-develop.tgz -C /opt/dims/data \
    && tar xzf /tmp/ipgrep-develop.tgz -C /opt/dims/src \
    && tar xzf /tmp/prisem-develop.tgz -C /opt/dims/src \
    && rm /tmp/dims-sample-data-develop.tgz /tmp/ipgrep-develop.tgz /tmp/prisem-develop.tgz \
    && chown -R root:root /opt/dims \
    && cd /opt/dims/src/prisem/ \
    && pip install -r requirements.txt \
    && cd src && make install \
    && cd /opt/dims/src/ipgrep && make install && chmod +x /opt/dims/bin/ipgrep )

ADD server/package.json /opt/dims/srv/dims-dashboard/server/package.json
ADD client/package.json /opt/dims/srv/dims-dashboard/client/package.json
ADD client/bower.json /opt/dims/srv/dims-dashboard/client/bower.json

# Install dependencies
RUN chown -R root:root /opt/dims/srv/dims-dashboard \
    && cd /opt/dims/srv/dims-dashboard/server  \
    && npm install  \
    && cd ../client  \
    && npm install  \
    && bower install --allow-root \
    && npm cache clear \
    && bower cache clean --allow-root

Add server /opt/dims/srv/dims-dashboard/server
Add client /opt/dims/srv/dims-dashboard/client
Add package.json /opt/dims/srv/dims-dashboard/package.json
Add dashboard.docker.run /opt/dims/srv/dims-dashboard/dashboard.docker.run

RUN chown -R root:root /opt/dims/srv/dims-dashboard \
    && chmod +x /opt/dims/srv/dims-dashboard/dashboard.docker.run

WORKDIR /opt/dims/srv/dims-dashboard

# Override these at run time as needed
# DASHBOARD_PUBLIC_HOST will definitely need to be provided
ENV DASHBOARD_PUBLIC_HOST localhost
ENV DASHBOARD_PUBLIC_PORT 80
ENV DASHBOARD_PUBLIC_PROTOCOL http
ENV DASHBOARD_RUNTYPE demo
ENV RABBITMQ_HOST rabbitmq.prisem.washington.edu
ENV DASHBOARD_RUNTYPE demo
# Access via weave dns
ENV REDIS_HOST localhost
ENV REDIS_PORT 6379
ENV REDIS_DATABASE 0
# Access via weave dns
ENV USER_DB_HOST localhost
ENV USER_DB_USER dims
ENV USER_DATABASE ops-trust

# Volumes
VOLUME ['/opt/dims/data/dashboard', '/opt/dims/data/dims-sample-data/']
# Ports
EXPOSE 3000
EXPOSE 3300

CMD [ "bash", "/opt/dims/srv/dims-dashboard/dashboard.docker.run" ]
