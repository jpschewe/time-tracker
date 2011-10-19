

var STORAGE_PREFIX = "time-tracker.";

// TODO load objects from storage
// TODO save objects to storage on ??
var _categories = {};

function Category(name) {
	var category_id;
	// find the next available id
	for (category_id = 0; category_id < Number.MAX_VALUE && _categories[category_id]; category_id = category_id + 1);

	this.name = name;
	this.cat_id = category_id;
	_categories[this.cat_id] = this;
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
