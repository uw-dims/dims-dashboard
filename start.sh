#! /bin/bash

cd /opt/dims/srv/dims-dashboard/server
# Need virtualenv since that's where pika is installed
. /opt/dims/envs/dimsenv/bin/activate
npm run run-dev
