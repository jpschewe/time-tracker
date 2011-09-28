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


Design ideas
============

* Write in HTML5 and use javascript localstorage object so that it runs offline
* optionally have it connect to a server database for more storage

