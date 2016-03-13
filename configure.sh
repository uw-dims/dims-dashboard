#! /bin/bash
VERSION=1.0.8

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

# Location of server files. If you are running this on a local directory
# override this variable
DEST=${DEST:="/opt/dims/srv"}
# Default owner of server directories. Override if running on a local directory
# with a different owner.
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
