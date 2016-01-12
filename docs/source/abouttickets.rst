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
* Zero or more associated "topi"
