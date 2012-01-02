/*
Copyright (c) 2011, Jon Schewe
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// disable ajax loading in jquery mobile. Maybe enable this again later
// once I understand it better
(function($) {
	if (!$) {
		throw new Error("jQuery needs to be loaded before time-tracker!");
	}
	if (!$.jStorage) {
		throw new Error("jStorage needs to be loaded before time-tracker!");
	}

	var STORAGE_PREFIX = "time-tracker.";

	// //////////////////////// PRIVATE METHODS ////////////////////////

	var _categories = {};
	var _jobs = {};
	var _jobs_use_mru = false; // if true, then list jobs by most recently used
	// FIXME need to track MRU list for jobs
	var _active_job_id = null; // active job id

	/**
	 * Save the current state to local storage.
	 */
	function _save() {
		$.jStorage.set(STORAGE_PREFIX + "_categories", _categories);
		$.jStorage.set(STORAGE_PREFIX + "_jobs", _jobs);
		$.jStorage.set(STORAGE_PREFIX + "_jobs_use_mru", _jobs_use_mru);
		$.jStorage.set(STORAGE_PREFIX + "_active_job_id", _active_job_id);
	}

	/**
	 * Load the current state from local storage.
	 */
	function _load() {
		var value = $.jStorage.get(STORAGE_PREFIX + "_categories");
		if (null != value) {
			_categories = value;
		}
		value = $.jStorage.get(STORAGE_PREFIX + "_jobs");
		if (null != value) {
			_jobs = value;
		}
		value = $.jStorage.get(STORAGE_PREFIX + "_jobs_use_mru");
		if (null != value) {
			_jobs_use_mru = value;
		}
		value = $.jStorage.get(STORAGE_PREFIX + "_active_job_id");
		if (null != value) {
			_active_job_id = value;
		}
	}

	/**
	 * Clear anything from local storage with a prefix of STORAGE_PREFIX.
	 */
	function _clear_local_storage() {
		$.each($.jStorage.index(), function(index, value) {
			if (value.substring(0, STORAGE_PREFIX.length) == STORAGE_PREFIX) {
				$.jStorage.deleteKey(value);
			}
		});
	}

	/**
	 * @return true if a category with the specified name exists
	 */
	function _check_duplicate_category(name) {
		var duplicate = false;
		$.each(_categories, function(i, val) {
			if (val.name == name) {
				duplicate = true;
			}
		});
		return duplicate;
	}

	/**
	 * @return true if a job with the specified name exists
	 */
	function _check_duplicate_job(name) {
		var duplicate = false;
		$.each(_jobs, function(i, val) {
			if (val.name == name) {
				duplicate = true;
			}
		});
		return duplicate;
	}

	/**
	 * Constructor for a category. Finds the first free ID and assigns it to
	 * this new category.
	 */
	function Category(name) {
		var category_id;
		// find the next available id
		for (category_id = 0; category_id < Number.MAX_VALUE
				&& _categories[category_id]; category_id = category_id + 1)
			;

		if (category_id == Number.MAX_VALUE
				|| category_id + 1 == Number.MAX_VALUE) {
			throw "No free category IDs";
		}

		this.name = name;
		this.cat_id = category_id;
		/*
		 * FIXME - check how to add methods to "class"
		 * Category.prototype.set_name = function(new_name) {
		 * if(check_duplicate_category(new_name)) { alert("There already exists
		 * a category with the name '" + new_name + "'"); } else { this.name =
		 * new_name; } };
		 */
		_categories[this.cat_id] = this;
		_save();
	}

	/**
	 * Constructor for a job.. Finds the first free ID and assigns it to this
	 * new job.
	 */
	function Job(name, job_number, category_id, notes) {
		var job_id;
		// find the next available id
		for (job_id = 0; job_id < Number.MAX_VALUE && _jobs[job_id]; job_id = job_id + 1)
			;

		if (job_id == Number.MAX_VALUE || job_id + 1 == Number.MAX_VALUE) {
			throw "No free job IDs";
		}

		this.job_id = job_id;
		this.name = name;
		this.job_number = job_number;
		this.cat_id = category_id;
		this.notes = notes;
		_jobs[this.job_id] = this;
		_save();
	}

	// //////////////////////// PUBLIC INTERFACE /////////////////////////

	$.timeTracker = {
		/* Version number */
		version : "0.1",

		/**
		 * Create a new category.
		 * 
		 * @param category_name
		 *            the name of the category
		 * @returns the new category or Null if there is a duplicate
		 */
		addCategory : function(category_name) {
			if (_check_duplicate_category(category_name)) {
				alert("There already exists a category with the name '"
						+ category_name + "'");
				return null;
			} else {
				var new_category = new Category(category_name);
				return new_category;
			}
		},

		/**
		 * Set the name of a category
		 * 
		 * @param category
		 *            the category
		 * @param category_name
		 *            the new name
		 * @returns if the set was successful
		 */
		setCategoryName : function(category, category_name) {
			if (_check_duplicate_category(category_name)) {
				alert("There already exists a category with the name '"
						+ category_name + "'");
				return false;
			} else {
				category.name = category_name;
				_save();
				return true;
			}
		},

		/**
		 * Get the categories known to the system.
		 * 
		 * @returns {Array} sorted by name
		 */
		getCategories : function() {
			var categories = [];
			$.each(_categories, function(i, val) {
				categories.push(val);
			});
			categories.sort(function(a, b) {
				if (a.name == b.name) {
					return 0;
				} else if (a.name < b.name) {
					return -1;
				} else {
					return 1;
				}
			});
			return categories;
		},

		/**
		 * Get a category by id
		 * 
		 * @param toFind
		 *            the id to find
		 * @returns the category or null
		 */
		getCategoryById : function(toFind) {
			var category = null;
			$.each(_categories, function(i, val) {
				if (val.cat_id == toFind) {
					category = val;
				}
			});
			return category;
		},

		/**
		 * Delete a category. Alert on an error
		 * 
		 * @param category_id
		 *            the id of the category to delete
		 * @returns {Boolean} if the delete succeeded
		 */
		deleteCategory : function(category_id) {
			var can_delete = true;
			$
					.each(
							$.timeTracker.getJobs(),
							function(index, job) {
								if (job.cat_id == category_id) {
									can_delete = false;
									alert("Job "
											+ job.name
											+ " still references this category, cannot delete");
								}
							});
			if (can_delete) {
				delete _categories[category_id];
				return true;
			} else {
				return false;
			}

		},

		/**
		 * Create a new job.
		 * 
		 * @param job_name
		 *            the name of the job
		 * @param job_number
		 *            the job number for the job (may be empty)
		 * @param notes
		 *            any notes for this job
		 * @param category_id
		 *            the id of the category for this job
		 * @returns the new category or Null if there is a duplicate
		 */
		addJob : function(job_name, job_number, category_id, notes) {
			if (_check_duplicate_job(job_name)) {
				alert("There already exists a job with the name '" + job_name
						+ "'");
				return null;
			} else {
				var new_job = new Job(job_name, job_number, category_id, notes);
				return new_job;
			}
		},

		/**
		 * Get the list of jobs to display on the main screen. This makes sure
		 * they are sorted correctly and automatically skips the active job.
		 * 
		 * @returns {Array} sorted by name
		 */
		getJobsList : function() {
			var jobs = [];
			$.each(_jobs, function(i, val) {
				if (val.job_id != _active_job_id) {
					jobs.push(val);
				}
			});
			// FIXME need to handle MRU list
			if (_jobs_use_mru) {
				alert("Jobs MRU list not yet implemented");
			}
			jobs.sort(function(a, b) {
				if (a.name == b.name) {
					return 0;
				} else if (a.name < b.name) {
					return -1;
				} else {
					return 1;
				}
			});
			return jobs;
		},

		/**
		 * Get all known jobs
		 * 
		 * @returns {Array}
		 */
		getJobs : function() {
			var jobs = [];
			$.each(_jobs, function(i, val) {
				jobs.push(val);
			});
			return jobs;
		},

		/**
		 * Get a job by id
		 * 
		 * @param toFind
		 *            the id to find
		 * @returns the job or null
		 */
		getJobById : function(toFind) {
			var job = null;
			$.each(_jobs, function(i, val) {
				if (val.job_id == toFind) {
					job = val;
				}
			});
			return job;
		},

		/**
		 * Set the active job id.
		 */
		setActiveJob : function(job_id) {
			var job = $.timeTracker.getJobById(job_id);
			if (null == job) {
				alert("Job with id " + job_id + " cannot be found");
			}
			// FIXME need to start and stop clock here
			$("#main_active-job").text(job.name);
			_active_job_id = job.job_id;
			_save();
			$.timeTracker.refreshJobList();
		},

		/**
		 * Get the active job.
		 * 
		 * @return the job object or null if no active job
		 */
		getActiveJob : function() {
			if (null == _active_job_id) {
				return null;
			} else {
				return $.timeTracker.getJobById(_active_job_id);
			}
		},

		/**
		 * Update the job list on the main display.
		 */
		refreshJobList : function() {
			// TODO this needs to optionally use the
			// MRU job list
			$("#main_joblist").empty();
			$.each($.timeTracker.getJobsList(), function(index, job) {
				var element = $("<li><a id='" + job.job_id + "'>" + job.name
						+ "</a></li>");
				$(element).click(function() {
					$.timeTracker.setActiveJob(job.job_id);
				});
				$("#main_joblist").append(element);
			});
			$("#main_joblist").listview("refresh");

			var active_job = $.timeTracker.getActiveJob();
			if (null != active_job) {
				$("#main_active-job").text(active_job.name);
			}
		},

		clear : function() {
			_clear_local_storage();
		}

	};

	_load();
})(window.jQuery || window.$);

$(document)
		.ready(
				function() {
					// Anything in here is only executed when the app starts,
					// not on
					// each page
					// load

					// setup button handlers
					$("#add-category_add").click(
							function() {
								var category_name = $("#add-category_name")
										.val();
								if (category_name) {
									var category = $.timeTracker
											.addCategory(category_name);
									return category != null;
								} else {
									alert("No name");
									return false;
								}
							});

					$("#edit-category_commit")
							.click(
									function() {
										var category_name = $(
												"#edit-category_name").val();
										if (!category_name) {
											alert("No name");
											return false;
										}
										var category_id = $(
												"#settings_category").val();
										var category = $.timeTracker
												.getCategoryById(category_id);
										if (null == category) {
											alert("Internal error, no category with id: "
													+ category_id);
											return false;
										}
										return $.timeTracker.setCategoryName(
												category, category_name);
									});
					$("#edit-category_delete").click(function() {
						var category_id = $("#settings_category").val();
						return $.timeTracker.deleteCategory(category_id);
					});

					$("#add-job_add").click(
							function() {
								var job_name = $("#add-job_name").val();
								if (!job_name) {
									alert("No name");
									return false;
								}

								var job_number = $("#add-job_number").val();

								var category_id = $("#add-job_category").val();
								if (!category_id) {
									alert("You must select a category");
									return false;
								}

								var notes = $("#add-job_notes").val();

								var job = $.timeTracker.addJob(job_name,
										job_number, category_id, notes);
								return job != null;

							});
					$('#add-job').live(
							'pageshow',
							function(event) {
								var options = '<option></option>';
								$.each($.timeTracker.getCategories(), function(
										index, category) {
									options += '<option value="'
											+ category.cat_id + '">'
											+ category.name + '</option>';
								});
								// FIXME select box isn't behaving
								$("#add-job_category").html(options);
							});

					$('#settings').live(
							'pageshow',
							function(event) {
								var options = '<option></option>';
								$.each($.timeTracker.getCategories(), function(
										index, category) {
									options += '<option value="'
											+ category.cat_id + '">'
											+ category.name + '</option>';
								});
								// FIXME select box isn't behaving
								$("#settings_category").html(options);
							});

					$("#settings_edit-category")
							.click(
									function() {
										var catid = $("#settings_category")
												.val();
										if (!catid) {
											alert("No category selected!");
											return false;
										} else {
											var category = $.timeTracker
													.getCategoryById(catid);
											if (null == category) {
												alert("Internal error, not category with id: "
														+ catid);
												return false;
											}
											$("#edit-category_name").val(
													category.name);
											return true;
										}
									});
					$("#settings_clear-data")
							.click(
									function() {
										var answer = confirm("Are you sure you want to clear all data?");
										if (answer) {
											$.timeTracker.clear();
											$("#settings_category").html("");
										}
									});

					$('#main').live('pageshow', function(event) {
						$.timeTracker.refreshJobList();
					});

				}); // end ready function
