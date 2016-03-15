#! /bin/bash

# Berkeley Three Clause License
# =============================

# Copyright (c) 2014, 2015, 2016 University of Washington. All rights reserved.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:

# 1. Redistributions of source code must retain the above copyright notice, this
# list of conditions and the following disclaimer.

# 2. Redistributions in binary form must reproduce the above copyright notice,
# this list of conditions and the following disclaimer in the documentation
# and/or other materials provided with the distribution.

# 3. Neither the name of the copyright holder nor the names of its contributors
#may be used to endorse or promote products derived from this software without
# specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#
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
