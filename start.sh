#! /bin/bash

# When running manually, run with sudo -u dims

# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

ACTIVATE=/opt/dims/envs/dimsenv/bin/activate
RUNDIR=/opt/dims/srv/dims-dashboard/server

# Types:
# production: production environment, SSL on
# development: development environment, SSL off, static user db
# testclient: For testing minified client. Production environment, log_level=debug
#    static user db
# integration: For testing with postgresql user db, development environment, SSL on.

RUNTYPE=${RUNTYPE:="development"}

# Need virtualenv since that's where pika is installed
cd $RUNDIR && . $ACTIVATE
npm run run-$RUNTYPE
