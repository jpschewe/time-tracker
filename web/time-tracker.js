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

		clear : function() {
			_clear_local_storage();
		}

	};

	_load();

})(window.jQuery || window.$);

$(document).ready(function() {
	$("#settings_add-category").click(function() {
		$("#category_header-text").html('Add');
	});
});
