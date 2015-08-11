#! /bin/bash

# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

ACTIVATE=/opt/dims/envs/dimsenv/bin/activate
RUNDIR=${RUNDIR:="/opt/dims/srv/dims-dashboard/server"}
RABBIT_SERVER=${RABBIT_SERVER:="172.17.0.2"}
TEST=${TEST:="tap"}

cd $RUNDIR

export RABBIT_SERVER=$RABBIT_SERVER

npm run test-$TEST
