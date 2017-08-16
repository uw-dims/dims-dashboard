# Distributed Incident Management System (DIMS) Dashboard

This repo contains the server and client code for the DIMS Dashboard web application.

* GitHub repo: https://github.com/uw-dims/dims-dashboard/
* Documentation: https://dims-dashboard.readthedocs.io/
* License: Berkeley Three Clause License

## Contact

Dave Dittrich dittrich@u.washington.edu

## Getting started

The Dashboard is installed on a machine (virtual or otherwise) using Ansible. These instructions assume you have access to the DIMS Ansible playbooks and development tools.

## Environment prerequisites

The Dashboard expects a number of services to be available in order to work correctly. 

 * Redis server
 * Trident (note that Trident user database acts as user backend to the Dashboard)
 * Rabbitmq server
 * Nginx (proxies requests to the Dashboard)

DIMS Ansible playbook exist to deploy these services.

## Google OAuth 2 authentication

For users to log in via Google, you need to set up the API in the Google developer console. You will get a Client ID and API key using the console. You will need to specify the origin sending the request and callback URLs. For the dashboard, these are:

Origin: ``<dashboard-public-url>``
Callback URLs: 
 * ``<dashboard-public-url>/auth/google/callback``
 * ``<dashboard-public-url>/connect/google/callback``

where <dashboard-public-url> is the full URL your users use to connect to the Dashboard in their browsers.

You enter the ID and key in the dashboard_secrets.conf file located at ``/etc/dashboard/dashboard_secrets``.conf.

## Configuration

The sample_configurations directory contain examples of the three configuration files used during Dashboard build during startup. Do not change these files in this repo, and do not check your files into the repo.

The sample configuration files are commented with instructions. The configurations when deployed are located at ``/etc/dashboard/`` on the Dashboard server, as well as any site logo you wish to use.

**dashboard.conf** - This file is populated by the Ansible playbook which deploys the Dashboard (dims-dashboard-deploy.yml). 

**dashboard_secrets.conf** - This file contains the Google Client ID and API key, as well as any other passwords or "secrets" required by the system.

**dashboard_client_config.json** - This JSON file contains configurations specific to your installation. This includes the external sites buttons every user sees on the home page, the site logo name (if you wish to change the default), text on the Login page, the name of your organization, and the default theme (light or dark) you wish your users to see the first time they go to the site.

You should let Ansible create the dashboard.conf file. You will need to create the other two files. You can either use DIMS developer tools to copy them to /etc/dashboard on the target machine, or you can let the Ansible playbook know where they are located on your workstation so it can deploy them.

If you specify ``dashboard_config_path`` as an ``extra_var`` when running ``ansible-playbook``, everything in the path you specify will be copied to the target at ``/etc/dashboard``. You can use this to deploy the secrets file, the client config file, as well as any site logo you want to include.

## Logo

You can provide a site logo to display on the navigation bar at the top of the browser window. The logo file should be in .png format and should be located on the target machine at ``/etc/dashboard/`` when the Dashboard starts.

## Favicon

You can also provide a favicon. It should be named ``favicon.ico`` and should be located in ``/etc/dashboard`` on the target machine.

## Environment variables

A number of environment variables are used to control the configuration of the Dashboard server and client. These are usually provided in the dashboard.conf and dashboard_secrets.conf files mentioned earlier. The Dashboard upstart file will source these files so the Dashboard environment is configured correctly when it executes.

The sample file sample_configurations/dashboard.conf.example shows the required ENV vars and their descriptions, with sample values. When deploying the Dashboard via Ansible, the values for these variables are provided by a configuration database or host/group vars files (or other sources).



