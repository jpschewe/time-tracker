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

	/**
	 * Save the current state to local storage.
	 */
	function _save() {
		$.jStorage.set(STORAGE_PREFIX + "_categories", _categories);
	}

	/**
	 * Load the current state from local storage.
	 */
	function _load() {
		var value = $.jStorage.get(STORAGE_PREFIX + "_categories");
		if (value) {
			_categories = value;
		}
	}

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

	// //////////////////////// PUBLIC INTERFACE /////////////////////////

	$.timeTracker = {
		/* Version number */
		version : "0.1",

		/**
		 * Create a new category.
		 * 
		 * @param category_name
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

		getCategories : function() {
			var categories = [];
			jQuery.each(_categories, function(i, val) {
				categories.push(val);
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
			jQuery.each(_categories, function(i, val) {
				if (val.cat_id == toFind) {
					category = val;
				}
			});
			return category;
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

					$("#edit-category_commit").click(function() {
						//FIXME implement
						// need to get category id from #settings_categories and then change name
						alert("Haven't implemented commit on category yet");
					});
					$("#edit-category_delete").click(function() {
						//FIXME implement
						alert("Haven't implemented deleteon category yet");
					});
					
					$("#settings_edit-category")
							.click(
									function() {
										var catid = $("#settings_categories")
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

					// initialize data for the settings page as it's loaded
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
								//FIXME select box isn't behaving
								$("#settings_categories").html(options);
							});

				});
