#! /bin/bash

# Run the server tests during the development cycle

# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

export LOG_LEVEL=${LOG_LEVEL:="info"}

ACTIVATE=/opt/dims/envs/dimsenv/bin/activate
RUNDIR=${RUNDIR:="/opt/dims/srv/dims-dashboard/server"}
# RABBIT_SERVER=${RABBIT_SERVER:="172.17.0.2"}
RABBIT_SERVER=$(sudo docker inspect --format '{{ .NetworkSettings.IPAddress }}' rabbit)
TEST=${TEST:="tap"}

cd $RUNDIR

export RABBIT_SERVER=$RABBIT_SERVER

npm run test-$TEST
