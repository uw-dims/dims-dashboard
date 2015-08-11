#! /bin/bash

sudo rsync -ah --exclude '.git' --exclude 'node_modules' --exclude 'public' --exclude 'logs' --exclude '.DS*' --exclude '*.css' --exclude 'bower_components' /home/lcolby/dims-dashboard/ /opt/dims/srv/dims-dashboard/
sudo chown -R dims:dims /opt/dims/srv/dims-dashboard
