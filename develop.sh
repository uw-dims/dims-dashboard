#! /bin/bash

# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

DEST=${DEST:="/opt/dims/srv"}
SOURCE=${SOURCE:="$HOME"}

sudo rsync -ah --exclude '.git' --exclude 'node_modules' --exclude 'public' --exclude 'logs' --exclude '.DS*' --exclude '*.css' --exclude 'bower_components' ${SOURCE}/dims-dashboard/ ${DEST}/dims-dashboard/
sudo chown -R dims:dims ${DEST}/dims-dashboard
