#! /bin/bash
VERSION=1.0.5

# Run the server tests on Jenkins

# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

export LOG_LEVEL=${LOG_LEVEL:="info"}

RUNDIR=${RUNDIR:="$WORKSPACE/dims-dashboard/server"}
TEST=${TEST:="tap"}

cd $RUNDIR && npm run test-$TEST
