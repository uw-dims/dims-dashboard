.. _ticketapi:

Ticket API
==========

The dashboard server provides a REST api for working with *tickets*. Tickets
are used to store


HTTP Verbs
----------

GET     /api/ticket      list
POST    /api/ticket      create
GET     /api/ticket/:id  show
PUT     /api/ticket/:id  update
DELETE  /api/ticket/:id  delete


Retrieve a list of tickets
--------------------------

Returns list of tickets

No parameters
~~~~~~~~~~~~~

This will return all public activities plus any private activities belonging
to the calling user.

Invoked via GET http://dashboard_url/api/ticket/
Returns HTTP status code and string reply

Using curl:
  curl -k https://dashboard_url/api/ticket/

Sample respons:

 { "data": [
     "ticket:1",
     "ticket:2",
     "ticket:3" ]
 }


Creating an activity
--------------------


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
