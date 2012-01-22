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

Classes
=======

* Category - Billable, Unbillable, IR&D
  * category-id - int
  * name - string
  
* Job
  * job-id - int
  * name - string
  * job number - string
  * notes - string
  * Category - category-id
  * subjobs - list<job-id>

* Time Interval
  * Date - mm/dd/yyyy
  * start - hh:mm
  * stop - hh:mm
  * job - job-id
  * WAH - boolean

Globals
-------

* g_jobs - job-id -> Job
* g_categories - category-id -> Category
  * editable list of valid categories
  * Cannot delete a category that has jobs associated with it

TODO
====
* Display time entry on a summary page
* Be able to edit jobs
* Use a non-scrolling header
* Update cache.manifest to contain references to all javascript libraries
* Use cache.manifest to cache on mobile devices
* How to tell browser when to flush cache?
* Add support for subjobs
* How to get select box to behave. After adding values via javascript there isno selected value.
* Add default buttons to single input forms
