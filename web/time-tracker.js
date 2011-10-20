var STORAGE_PREFIX = "time-tracker.";

// TODO load objects from storage on page load for all pages
var _categories = {};

/**
 * Save the current state to local storage.
 */
function save_to_storage() {
	$.jStorage.set(STORAGE_PREFIX + "_categories", _categories);
}

/**
 * Load the current state from local storage.
 */
function load_from_storage() {
	var value = $.jStorage.get(STORAGE_PREFIX + "_categories");
	if (value) {
		_categories = value;
	}
}

/**
 * Constructor for a category. Finds the first free ID and assigns it to this
 * new category.
 */
function Category(name) {
	var category_id;
	// find the next available id
	for (category_id = 0; category_id < Number.MAX_VALUE
			&& _categories[category_id]; category_id = category_id + 1)
		;

	if (category_id == Number.MAX_VALUE || category_id + 1 == Number.MAX_VALUE) {
		throw "No free category IDs";
	}

	this.name = name;
	this.cat_id = category_id;
	/* FIXME - check how to add methods to "class"
	Category.prototype.set_name = function(new_name) {
		if(check_duplicate_category(new_name)) {
			alert("There already exists a category with the name '" + new_name + "'");
		} else {
			this.name = new_name;
		}
	};
	*/
	_categories[this.cat_id] = this;
	save_to_storage();
}

/**
 * @return true if a category with the specified name exists 
 */
function check_duplicate_category(name) {
	var duplicate = false;
	jQuery.each(_categories, function(i, val) {
		if (val.name == name) {
			duplicate = true;
		}
	});
	return duplicate;
}

function record_visit() {
	$.jStorage.set(STORAGE_PREFIX + "visit", true);
}

function check_visit() {
	var value = $.jStorage.get(STORAGE_PREFIX + "visit");
	if (value) {
		document.write("<p>You've been here before.</p>");
	}
}

function clear_local_storage() {
	$.each($.jStorage.index(), function(index, value) {
		if (value.substring(0, STORAGE_PREFIX.length) == STORAGE_PREFIX) {
			$.jStorage.deleteKey(value);
		}
	});
}

function insert_value() {
	var key = document.getElementById('key').value;
	var val = document.getElementById('val').value;
	if (!key) {
		alert("KEY NEEDS TO BE SET!");
		document.getElementById('key').focus();
		return;
	}
	$.jStorage.set(key, val);
	document.getElementById('key').value = "";
	document.getElementById('val').value = "";
	reDraw();
}

function get_value() {
	var value = $.jStorage.get(document.getElementById("key2").value);
	alert(value);
	document.getElementById('key2').value = "";
}

function reDraw() {
	var row, del, index;
	var rows = document.getElementsByTagName("tr");
	for ( var i = rows.length - 1; i >= 0; i--) {
		if (rows[i].className == "rida") {
			rows[i].parentNode.removeChild(rows[i]);
		}
	}

	index = $.jStorage.index();
	for ( var i = 0; i < index.length; i++) {
		row = document.createElement("tr");
		row.className = "rida";
		var t = document.createElement("td");
		t.innerHTML = index[i];
		row.appendChild(t);
		t = document.createElement("td");
		t.innerHTML = $.jStorage.get(index[i]);
		row.appendChild(t);
		del = document.createElement("a");
		del.href = "javascript:void(0)";
		del.innerHTML = "DEL";
		(function(i) {
			del.onclick = function() {
				$.jStorage.deleteKey(i);
				reDraw();
			};
		})(index[i]);
		t = document.createElement("td");
		t.appendChild(del);
		row.appendChild(t);
		document.getElementById("tulemused").appendChild(row);

	}
}
