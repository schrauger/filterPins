// ==UserScript==
// @name         Filter Pins
// @namespace    http://tampermonkey.net/
// @version      2.1.0
// @description  Add buttons that let the user toggle the visibility of certain pins on Pinterest.
// @author       noahleigh
// @match        https://*.pinterest.com/*
// ==/UserScript==

// Define list of filters
var filters = {
	'find-friends': {
		'name': 'Invite friends',
		'elements': function(){
			return filterItems(
				document.querySelectorAll('.item'),
				'Invite friends'
			);
		},
		'state': false
	},
	'picked': {
		'name': 'Picked for you',
		'elements': function(){
			return filterItems(
				document.querySelectorAll('.item'),
				'Picked for you'
			);
		},
		'state': false
	},
	'promoted': {
		'name': 'Promoted by',
		'elements': function(){
			return filterItems(
				document.querySelectorAll('.item'),
				'Promoted by'
			);
		},
		'state': false
	}
};

// FUNCTION DEFINTIONS
// Create the buttons and register listeners
function init(){
	// Expand header to make room for the buttons
	document.querySelector('.Header.Module.full').style.height = '84px';
	document.querySelector('.appContent').style.paddingTop = '84px';

	// Get the element that will contain the new buttons
	var leftHeaderContent = document.querySelector('.leftHeaderContent');

	// Create a button for each filter.
	for (var filter in filters) {
		var button = document.createElement("button");
		button.innerHTML = (filters[filter].state ? "Show " : "Hide ")+filters[filter].name;
		button.id = 'btn-'+filter;
		button.className = 'Button btn';
		button.style.margin = '5px';
		button.filter = filter;
		button.addEventListener('click', toggleVisibilityOnClick, false);
		leftHeaderContent.appendChild(button);
	}

	// Watch for new pins being loaded and apply filtering to them
	var gridItems = document.querySelector('.GridItems');
	var observer = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
			if (mutation.addedNodes.length > 0){
				setVisibilityOnNodes(mutation.addedNodes);
			}
		});
	});
	observer.observe(gridItems, {childList: true});
}

// Returns an array of elements that matched the provided filter string
function filterItems(nodeList, string){
	return [].filter.call(nodeList, function(node){
		return RegExp(string).test(node.textContent);
	});
}

function toggleVisibilityOnClick(event){
	if (filters[event.target.filter].state === false){
		filters[event.target.filter].state = true;
		this.innerHTML = "Show "+filters[event.target.filter].name;
	} else {
		filters[event.target.filter].state = false;
		this.innerHTML = "Hide "+filters[event.target.filter].name;
	}
	var filteredItems = filters[event.target.filter].elements();
	toggleVisibility(filteredItems, event.target.filter);
}

function setVisibilityOnNodes(nodeList){
	for (var filter in filters) {
		if (filters[filter].state) {
			var filteredItems = filterItems(nodeList, filters[filter].name);
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
function toggleVisibility(filteredItems, filter){
	for (var i = 0; i < filteredItems.length; ++i) {
		if (filters[filter].state) {
			hideItem(filteredItems[i]);
		} else {
			showItem(filteredItems[i]);
		}
	}
}

// Test if an element is set to visisble or not.
function isVisible(element){
	return window.getComputedStyle(element,null).visibility != "hidden";
}

// EXECUTE
init();
