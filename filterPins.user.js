// ==UserScript==
// @name         Filter Pins
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Add buttons that let the user toggle the visibility of certain pins on Pinterest.
// @author       noahleigh
// @match        https://*.pinterest.com/
// ==/UserScript==

// Define list of filters
var filters = {
	'find-friends': {
		'name': 'Invite Friends',
		'selector': function(){return document.querySelectorAll('.UserNews');},
		'state': false
	},
	'picked': {
		'name': 'Picked for You',
		'selector': function(){return filterItems('Picked for you');},
		'state': false
	},
	'promoted': {
		'name': 'Promoted By...',
		'selector': function(){return filterItems('Promoted by');},
		'state': false
	}
};

// Create the buttons and register listeners
var leftHeaderContent = document.querySelector('.leftHeaderContent');
document.querySelector('.Header.Module.full').style.height = '65px';
for (var filter in filters) {
	var button = document.createElement("button");
	button.innerHTML = "Hide "+filters[filter].name;
	button.id = 'btn-'+filter;
	button.filter = filter;
	button.addEventListener('click', makeClickHandler, false);
	leftHeaderContent.appendChild(button);
}
window.addEventListener('scroll', makeScrollHandler, false);

// Returns an array of elements that matched the provided filter string
function filterItems(filterString){
	var items = document.querySelectorAll(".item");
	return [].filter.call(items, function(item){
		return RegExp(filterString).test(item.textContent);
	});
}

function makeClickHandler(event){
	if (filters[event.target.filter].state === false){
		filters[event.target.filter].state = true;
		this.innerHTML = "Show "+filters[event.target.filter].name;
	} else {
		filters[event.target.filter].state = false;
		this.innerHTML = "Hide "+filters[event.target.filter].name;
	}
	var filteredItems = filters[event.target.filter].selector();
	toggleVisibility(filteredItems);
}

function makeScrollHandler(event){
	for (var filter in filters) {
		if (filters[filter].state) {
			var filteredItems = filters[filter].selector();
			for (var i = 0; i < filteredItems.length; ++i) {
				if (isVisible(filteredItems[i])) {
					hideItem(filteredItems[i]);
				}
			}
		}
	}
}
// Hides the provided DOM element
function hideItem(item){
	item.style.visibility = "hidden";
}

// Displays the provided DOM element
function showItem(item){
	item.style.visibility = "visible";
}

// Intelligently toggles the display ("block" vs "none") of each element of the provided array of elements.
function toggleVisibility(filteredItems){
	for (var i = 0; i < filteredItems.length; ++i) {
		if (isVisible(filteredItems[i])) {
			hideItem(filteredItems[i]);
		} else {
			showItem(filteredItems[i]);
		}
	}
}

// Test if an element is set to be visible.
function isVisible(element){
	return window.getComputedStyle(element,null).visibility != "hidden";
}
