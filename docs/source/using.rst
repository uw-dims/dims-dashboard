.. _usingthedashboard:

Using the Dashboard
===================

This section will introduce basic usage of the DIMS Dashboard.

Currently this section contains a demo runthrough with commentary.

1. Go to ``demo.prisem.washington.edu`` and log in using your ops-trust username
   and password.

2. The main dashboard will display. A static (for now) **System Status** summary
   is on the left.

  .. figure:: demo/dashboard.png
     :width: 100%
     :align: left

  ..


3. **Remediations** are mitigation activities in the system where the logged in
   user has IPs that are compromised and need to be remediated.
   Currently the system contains one of these
   "Mitigation scenario" activities which was bootstrapped programmatically.

   Hover over the graph to display data points. Note the number of mitigated IPs
   at the most recent data point:

   .. figure:: demo/remediations1.png
     :width: 100%
     :align: left

   ..

   Click “View my IPs needing mitigation” link to display a modal window where the user can
   submit IPs that have been mitigated. Right now the UI for this consists of the modal
   displaying all remaining IPs the user needs to address.


   .. figure:: demo/view_my_ips.png
     :width: 100%
     :align: left

   ..

   This mitigation activity has IPs that need to be remediated for the users
   dittrich, lparsons, mboggess, and swarner. So your IPs will look different
   than those in this figure.

   .. figure:: demo/remediations2.png
     :width: 100%
     :align: left

   ..

   Check off some IPs indicating that they have been mitigated and click *Submit*.

   .. figure:: demo/remediations3.png
     :width: 100%
     :align: left

   ..

   The modal window will close and the graph will be updated. Hover over the
   last data point to verify. For this user, the total IPs mitigated is now 39.

   .. figure:: demo/remediations4.png
     :width: 100%
     :align: left

   ..

   Currently, to start a new mitigation activity, a user will do so via the
   Dashboard (UI not available yet), using a form to submit the suspect IPs
   that the user probably received on a Trident email list.  The system then automatically parses the list and bins the IPs according to attributes belonging
   to users, creating a new activity that will appear in the Remediations list for
   those users that are affected. There will also be some sort of notification.
   (In the future this creation would be automated by a service that can process
   emails that come into the system.)

..

4. The **Watching** section lists Activities that the user has subscribed to, either by
   subscribing to a public activity created by someone else or by creating a new
   activity.

   .. figure:: demo/activities.png
     :width: 100%
     :align: left

   ..

   Activities are collections of data, queries, etc. They can be public or
   private.  If a user subscribes to a public activity, the user receives a notification
   when new data is added to the activity. This is a first cut at the UI, and most of the
   UI display/functions (creating, sharing, subscribing) are currently in progress and
   not online
   (server side API and associated modules exist).

   I’m not sure how much more of the UI display of Activities I’ll get done by Tuesday,
   but at least you can see the  list display.

..

5. *Live log streams* - The live long monitoring is now a popup panel so as
   to persist data across page views.
   That means the buffers won't be cleared if you go to a different section on the
   site (new page load).

   .. note::

      I've changed the name in the title bar to *Live log streaming*. This is not
      reflected in the screen shots. I've also changed the navigation bar so there is a menu
      called **Logging**. The first item in the menu is **Live log streaming**.

   ..

   Click **Logging** in the Navigation bar and select **Live log streaming**.
   The Live log streaming window anchored to the bottom of the window will display.


   There are tabs for the log exchanges the server monitors. Each tab has a button to turn on/turn off that particular log monitor. The user can clear the buffer using the “Clear” button. The user can hide the window by clicking the minimize button, and then maximize it by clicking the maximize button.  Clicking the close button (X) turns off all monitors and closes the window. The window can also be closed by clicking “Log Monitor” in the Nav bar. (This is  a toggle - if the window is active, clicking it closes the window. If the window is closed, clicking the button opens the window.)

   The Log Monitors window, like the Chat window, is independent of other page views. So it will remain active even if you go to a different view via a menu or navigation button.

   So, clicking on Devops tab and click button “Turn on Devops":

   Do the same for Health:

   You could start an activity that reports to devops, or wait a couple minutes and you’ll probably get info on Health:


   Click the minimize button:

   and the logs will minimize to the bottom of the window.

   Then click maximize to open it again. The messages will still be there (maybe more).

   You can go to different locations in the app without clearing the log buffers. So go to Users > Find DIMS users for example:

   (I didn’t show the result since there is personal data in the show users function.)

   Minimize the log display to view the results.

   You can clear the log buffers individually by clicking “Clear” in a log tab. To clear all the buffers and close the display, click the “Log Monitor” link in the nav bar or just click the “X” in the monitor window title bar.

..

6. Chat - click the chat icon in the Nav bar to open the chat window. Unless you’re
   chatting with someone else who is logged in, there isn’t much to see (you can send messages to yourself).

..

7. User information - I haven’t had time yet to update the UI to handle the new
   information it can get from the server regarding the user’s trust groups, and the Attributes are still in a different tab than the profile data (not sure if I will have time to put them in the same tab by Tuesday or not - I will try). But you can show that the Dashboard displays User information collected from various sources in one UI.

   Get your user information via dittrich > Profile on the left side of the nav bar.


