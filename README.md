Time tracker
===========

The time tracker application is to track amount of time spent on a
project/job.


Requirements
============

* Run on IOS
* Prefer to run on Android too
* one active job at a time
* each job has a category (billable, IR&D, ...)
* Each job has spot for job number (or just memos)
* Each time period has descriptor (WAH vs. not)
* Set descriptor globally, triggers stop and start of job to create new record
* Associate job number(s) with project
* Be able to view time for any day
* Keep track of most recently used numbers and optionally sort by this
* Edit previous time periods
* Delete all time before Date X

Future
------
* allow descriptors to be edited?


Design ideas
============

* Write in HTML5 and use javascript localstorage object so that it runs offline
* optionally have it connect to a server database for more storage
* Use JSON objects as strings in the local store


Tasks
=====

! Test local storage on mobile device
  * Created http://mtu.net/~jpschewe/temp/local.html and it works
  * Created example application and was able to note when someone has
    returned to the page and it works on IOS
* Create initial view
* Define JSON classe(s)


Classes
=======

* Job
  * name
  * job number
  * notes
  * category - string
  * subjobs - Job

* Time Interval
  * Date - mm/dd/yyyy
  * start - hh:mm
  * stop - hh:mm
  * job number
  * WAH - boolean

Globals
-------

* all jobs - map of job number -> Job
* all categories - editable list of valid categories
  * Cannot delete a category that has jobs associated with it
