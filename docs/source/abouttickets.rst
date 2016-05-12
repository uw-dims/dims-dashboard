.. _abouttickets:

Tickets
=======

There are currently two types of tickets:

* Activity
* Mitigation

Activities are ad hoc ways for users to save information. An
activity can have any  number of topics associated with it, and users
can create topics and add them to an activity.

Mitigation tickets are more structured in that a user can create one
by making the appropriate api call and supplying a list of IPs, but the
system automatically creates all associated topics, which have specific
purposes in a mitigation activity.

General ticket structure
------------------------

A *ticket* is described

* A Redis key/value pair where the value is a 1-level hash
* Zero or more associated "topics"


Topics
------

A topic is always associated with a parent ticket. The parent key can be derived from
the topic key. 

When a topic is added to a ticket, its key is added to the set of topic keys owned by
the ticket (parent).

Topics are stored in redis as follows:

    .. list-table:: Topic storage
       :header-rows: 1

       * - Data
         - Key
         - Value
       * - Metadata
         - Topic metadata key
         - (hash) JSON metadata

    ..

.. TODO(mboggess):
.. todo::

    .. note::

        We currently restrict the metadata saved for a topic. We do not allow user-defined metadata.
        Should we change this behavior?
 
    ..
..

Metadata provided by calling method:

.. code-block:: none

    {
      datatype: (required) 'set' or 'string'
      name: (required) name of topic
      description: (optional) description of topic (default - '')
    }

..

.. code-block:: none

    {
      createdTime: Unix epoch time when topic is created
      modifiedTime: Unix epoch time when topic modified
      num: Topic counter: (via topicCounterKey) - used to ensure uniqueness
    }

..

