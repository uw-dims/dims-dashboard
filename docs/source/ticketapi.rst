.. _ticketapi:

Ticket API
==========

The dashboard server provides a REST API for working with *tickets*.

.. note::

    One API design decision was how *open* to make the API - that is, would
    the API automatically restrict data sent back for certain requests. For
    example, we have the concept of *public* and *private* tickets. When
    a GET request is made, do we want the API to return all tickets or a subset
    such as all public and all private belonging to the current user?

    The API is currently restrictive - a GET request to
    /api/tickets would return all public activity tickets and all private tickets
    owned by the calling user.

    The API is intended to require authentication. The plan is that the
    client would have obtained the token for the calling user and included
    it with the API call. The server will then look up the attributes for
    the user referenced by the token. These would be:

    * username - user name (in Ops-trust) of the calling user
    * trustgroup - trust group the user is logged into
    * admin - is the user an admin in the trust group

    This has not been implemented yet as we need to determine how to
    integrate this with Trident and their login tokens, as well as have
    a Trident instance running.

    In the interim, the server currently authenticates users with the
    Dashboard via their Ops-trust (Trident) usernames and passwords and
    establishes a persistent login session for the user. This can be used
    to protect the API endpoints when accessing via the Dashboard client, but
    would prevent other clients from accessing. So the API is not
    protected by the current authentication mechanism in order to
    allow other clients access until
    we get the token authentication implemented.

    Until token authentication is implemented however, requests from
    clients other than the Dashboard will not be able to retrieve
    user private tickets.

..


HTTP Verbs
----------

.. code-block:: none

    GET     /api/ticket      list
    POST    /api/ticket      create
    GET     /api/ticket/:id  show
    PUT     /api/ticket/:id  update
    DELETE  /api/ticket/:id  delete

..

Responses
---------

The API returns JSON. JSON responses follow the unofficial JSEND spec. See
http://labs.omniti.com/labs/jsend/wiki for more information.

Successful requests will return JSON with
a status of ``success`` and a ``data`` property with the
JSON result.

.. code-block:: none

    {
       "data": <json>
       "status": "success"
    }

..

The ``data`` property will generally be in the following form for one ticket:

.. code-block:: none

    "data": {
      "ticket": {
        <json describing ticket>
      }
    }

..

or for multiple tickets:

.. code-block:: none

    "data": {
      "tickets": [ <array of json where each one describes a ticket>]
    }

..

Since mitigations are a *special* form of ticket, we use
the terms ``mitigation`` and ``mitigations`` as keys to their response:

.. code-block:: none

    "data": {
      "mitigation": {
        <json describing mitigation ticket>
      }
    }

..

Requests that do not send back data (such as delete) will return with
``data`` set to ``null``:

.. code-block:: none

    {
      "status": "success",
      "data": null
    }

..

Unsuccessful requests will return JSON with an error ``message``
and a status of ``error``:

.. code-block:: none

    {
        "message": "You do not have permission to access this ticket",
        "status": "error"
    }

..

Requests that failed due to invalid data or parameters submitted may
generate a ``fail`` response:

.. code-block:: none

    {
      "status": "fail",
      "data": <wrapper for reason request failed>
    }

..

For example:

.. code-block:: none

    {
      "status": "fail",
      "data": {
        "name": "A name for the new ticket is required"
      }
    }

..

.. note::

    Currently most errors are reported as ``error`` rather than ``fail``. We are working
    on refactoring so that errors that should be reported as ``fail`` are done so.

..



An HTTP status code is included in the response headers. For example, the
following request returns with 400:

.. code-block:: none

    $ curl -k -I http://192.168.56.103/api/ticket
    HTTP/1.1 400 Bad Request
    Server: nginx/1.8.0
    Date: Wed, 13 Jan 2016 16:44:48 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 96
    Connection: keep-alive
    X-Powered-By: Express
    ETag: W/"60-kIP4LSNmFtWUQFvEw0Zo/g"
    set-cookie: connect.sid=s%3Ah6h88KJrXfxT4Ycabe1dk5aTFY26SRx8.o7d2T9y03YrbbR8ssnmF0tFEpfV9VNI6F7l9oJQEgAg; Path=/; HttpOnly

..




Retrieve a list of tickets
--------------------------

.. TODO(mboggess):
.. todo::

    Does this section need more information?

..

Returns list of tickets

No parameters
~~~~~~~~~~~~~

When no parameters are provided, the system defaults to the following parameters:

.. code-block:: none

    type: 'activity',

..

This will return all public activities plus any private activities belonging
to the calling user. Invoked via GET http://dashboard_url/api/ticket/, returns
HTTP status code and string reply.

Using curl:

.. code-block:: none

    curl -k https://dashboard_url/api/ticket/

..

Sample response:

.. code-block:: none

    { "data": [
       "ticket:1",
       "ticket:2",
       "ticket:3" ]
    }

..

With query parameters
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: none

    private: boolean
    type: string
    ownedBy: string
    open: boolean

..

``type`` can be ``mitigation`` or ``activity``. For mitigation tickets, no
other parameters are needed, and any extra provided are ignored.

.. code-block:: none

    $ curl -k http://192.168.56.103/api/ticket?type=mitigation | python -m json.tool
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100  1177  100  1177    0     0  34609      0 --:--:-- --:--:-- --:--:-- 35666
    {
        "data": [
            {
                "data": [
                    [
                        1450004398760,
                        0
                    ],
                    [
                        1450068277926,
                        6
                    ],
                    [
                        1450085780836,
                        13
                    ],
                    [
                        1452404888722,
                        329
                    ],
                    [
                        1452478109289,
                        343
                    ]
                ],
                "ips": {
                    "data": [],
                    "user": null
                },
                "key": "dims:ticket:mitigation:1",
                "metadata": {
                    "createdTime": 1452682798841,
                    "creator": "lparsons",
                    "description": "IPs needing mitigation. As you mitigate IPs, submit them here.",
                    "initialNum": 1408,
                    "mitigatedNum": 343,
                    "modifiedTime": 1452682798841,
                    "name": "Action Needed: 12/12/2015 Compromised IPs",
                    "num": 1,
                    "open": true,
                    "private": false,
                    "type": "mitigation",
                    "unknownNum": 864
                }
            }
        ],
        "status": "success"
    }


Creating an activity
--------------------

.. code-block:: none

    /**
     Returns a ticket: ticket key, ticket metadata, list of associated topic keys
     @return HTTP Status code and string reply.

     @example
     Example response:
            {"data": {
              "ticket":
                {"num":"1",
                "creator":"testuser",
                "type":"data",
                "createdTime":"1418060768120",
                "open":"true"},
              "key":"ticket:1",
              "topics":["ticket:1:data:cif:results:result1.txt",
                        "ticket:1:data:cif:results:result2.txt"]
              }
            }
     @example How to invoke
       GET https://dashboard_url/api/ticket/ticket:1

       Using curl:
         curl -k https://dashboard_url/api/ticket/ticket:1

     @param {string} id Ticket key in format ticket:<num>
    /

    /**
     Creates a new ticket
     @method create
     @return HTTP Status code and string reply.
            {"data": {
              "ticket":
                {"num":"2",
                "creator":"testuser",
                "type":"data",
                "createdTime":"1418060768120",
                "open":"true"},
              "key":"ticket:2"
              }
            }
     @example

       POST https://dashboard_url/api/ticket/
         body:
         {
           "type": "data",
           "creator": "testuser"
         }

        Using curl:
          curl --data "type=data&creator=testuser" -k https://dashboard_url/api/ticket

     @param {string} type Type of ticket being created
     @param {string} creator Username of user creating ticket (optional if user logged in,
                    ignored if user logged in)
    /

    /**
     Adds a topic (metadata) to a ticket and saves the data (content)
     @method addTopic
     @return HTTP Status code and string reply.
     @example
     Sample json response:

       {"data":{
          "topic":{
            "parent":{
               "num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"
             },
             "type":"analysis",
             "name":"namesearch:result2",
             "dataType":"hash"
             },
            "content":{"firstname":"bob","lastname":"johnson"},
            "key":"ticket:12:analysis:namesearch:result2"
           }
        }

     @example
     Example URI
         POST https://dashboard_url/api/ticket/ticket:27/topic
         body:
         {
           "name": "cif:results:1418060768120",
           "dataType": "string",
           "content": <string content>
         }
     Note that content in this example could be JSON that is stringified. Content could also be content of a
     file, base64'd, as in
         POST https://dashboard_URL/api/ticket/ticket:28/topic
         body:
         {
           "name": "mal4s:result:resul1.png",
           "dataType": "string",
           "content": <base64 content of a .png file>
         }

     Using curl with hash content (content is uri encoded):
          curl --data "name=namesearch:results&dataType=hash&content=%7B%22firstname%22:%22bob%22,%22lastname%22:%22johnson%22%7D" -k https://dashboard_url/api/ticket/ticket:12/topic

     A successful response from the curl command might look like the following (line feeds added for clarity - reponse is just a string):
          {"data":{
           "topic":{
             "parent":{"num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"},
             "type":"analysis","name":"namesearch:result2","dataType":"hash"},
             "content":{"firstname":"bob","lastname":"johnson"},"key":"ticket:12:analysis:namesearch:result2"}}

     @param {string} id Ticket key in format ticket:<num>
     @param {string} name Name of the topic - this represents the last part of the topic key after
                          ticket:<num>:<ticket_type>:
     @param {string} dataType Redis data structure to store the contents in - can be string or hash
     @param {string} content  Content to be stored

     Note that content is optional if type is string. If no content is specified, then an empty string
     is stored at the topic key. You would use this if you want to use the contents of a file as the
     data to be stored. First create the topic with a type of string and no content. Then you use the
     returned topic key and do an update (PUT) of the topic with the uploaded file.

     You cannot overwrite an existing topic with the same key. An error is returned if the topic already
     exists
    /

    /**
     Retrieves a ticket topic's metadata and content. Invoked via GET

     <pre>Sample response:

        { "data":{
          "topic":{
             "parent":{
               "num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"
              },
             "type":"analysis",
             "name":"namesearch:result2",
             "dataType":"hash"
            },
            "content":{"firstname":"bob","lastname":"johnson"},
            "key":"ticket:12:analysis:namesearch:result2"
           }
         }</pre>

     @method showTopic

     @example

         GET https://dashboard_url/api/ticket/topic/ticket:27:analysis:namesearch:result2

        Using curl:

          curl -k https://dashboard_url/api/ticket/topic/ticket:27:analysis:namesearch:result2

     @param {string} id Ticket topic key in format ticket:<num>:<type>:<topic_name>
     @return HTTP Status code and string reply.
    /

    /**
     Updates a ticket topic. You can only update content.
     @method updateTopic
     @return HTTP Status code and string reply.
       {"data":{
          "topic":{
            "parent":{
               "num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"
             },
             "type":"analysis",
             "name":"namesearch:result2",
             "dataType":"hash"
             },
            "content":{"firstname":"john","lastname":"johnson"},
            "key":"ticket:12:analysis:namesearch:result2"
           }
        }
     @example

         PUT https://dashboard_url/api/ticket/ticket:27/topic
         body:
         {
           "content": <string content>
         }
       Note that content in this example could be JSON that is stringified. Content could also be content of a
       file, base64'd, as in
         PUT https://dashboard_URL/api/ticket/ticket:28/topic
         body:
         {
           "content": <base64 content of a .png file>
         }

        Using curl with hash content (content is uri encoded):
          curl --data "content=%7B%22firstname%22:%22john%22,%22lastname%22:%22johnson%22%7D" -k https://dashboard_url/api/ticket/ticket:12/topic

        A successful response from the curl command might look like the following (line feeds added for clarity - reponse is just a string):
          {"data":{
           "topic":{
             "parent":{"num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"},
             "type":"analysis","name":"namesearch:result2","dataType":"hash"},
             "content":{"firstname":"john","lastname":"johnson"},"key":"ticket:12:analysis:namesearch:result2"}}

     @param {string} id Topic key in format ticket:<num>:<type>:<topic_name>
     @param {string} content  Content to be stored

    /

..
