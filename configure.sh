#! /bin/bash
VERSION=1.0.6

# Used during development
# Set up common functions and variables.
source $DIMS/bin/test_functions.sh

# Defaults for these exist in config files. Only specified
# ones that are needed.
export DASHBOARD_PUBLIC_HOST=${DASHBOARD_PUBLIC_HOST}
export DASHBOARD_PUBLIC_PORT=${DASHBOARD_PUBLIC_PORT}
export DASHBOARD_PUBLIC_PROTOCOL=${DASHBOARD_PUBLIC_PROTOCOL}

DATE=$(iso8601dateshort)
LOGFILE=$BASE-$DATE.log

DEST=${DEST:="/opt/dims/srv"}
OWNER=${OWNER:="dims"}

# So user running npm can configure
sudo chown -R $USER:$USER ${DEST}/dims-dashboard

cd ${DEST}/dims-dashboard/client
npm install
bower install
grunt build

cd ../server
npm install

# Reset to owner
sudo chown -R $OWNER:$OWNER ${DEST}/dims-dashboard
