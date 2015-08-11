#! /bin/bash


export PUBLICHOST=${PUBLICHOST}
export PUBLICPORT=${PUBLICPORT}
export PUBLICPROTOCOL=${PUBLICPROTOCOL}

cd client
npm install
bower install
grunt build

cd ../server
npm install
