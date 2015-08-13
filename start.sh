#! /bin/bash

# When running manually, run with sudo -u dims

# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

# virtual environment needed here since the prisem scripts
# are only installed in virtual environment now. And pika is only
# installed in virtual environment, which is used by scripts.
ACTIVATE=/opt/dims/envs/dimsenv/bin/activate
RUNDIR=/opt/dims/srv/dims-dashboard/server

# Types:
# production: production environment, SSL on
# development: development environment, SSL off, static user db
# testclient: For testing minified client. Production environment, log_level=debug
#    static user db
# integration: For testing with postgresql user db, development environment, SSL on.
# demo: SSL off, postgresql db, development environment

RUNTYPE=${RUNTYPE:="development"}

# Need virtualenv since that's where pika is installed
cd $RUNDIR && . $ACTIVATE
npm run run-$RUNTYPE
