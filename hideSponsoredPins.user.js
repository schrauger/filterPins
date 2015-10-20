// ==UserScript==
// @name   Remove Pinterest Promoted/Picked For You Pins In Feed
// @author Noah Leigh
// @match  https://*.pinterest.com/*
// ==/UserScript==

// Create the buttons
var btnPromoted = document.createElement("button");
btnPromoted.innerHTML = "Hide Promoted Pins";
btnPromoted.id = "btnPromoted";

var btnPickedForYou = document.createElement("button");
btnPickedForYou.innerHTML = "Hide Picked for you Pins";
btnPickedForYou.id = "btnPickedForYou";

// Put buttons in header
var leftHeaderContent = document.querySelector('.leftHeaderContent');
leftHeaderContent.appendChild(btnPromoted);
leftHeaderContent.appendChild(btnPickedForYou);

// Boolean for states of filtering
var hidePromoted = false;
var hidePickedForYou = false;

// Toggle filtering when the buttons are clicked
btnPromoted.addEventListener('click', function(){
	if (hidePromoted == false){
		hidePromoted = true;
		btnPromoted.innerHTML = "Show Promoted Pins";
	} else {
		hidePromoted = false;
		btnPromoted.innerHTML = "Hide Promoted Pins";
	}
	toggleVisibility(filterItems("Promoted by"));
});

btnPickedForYou.addEventListener('click', function(){
	if (hidePickedForYou == false){
		hidePickedForYou = true;
		btnPickedForYou.innerHTML = "Show Picked for you Pins";
	} else {
		hidePickedForYou = false;
		btnPickedForYou.innerHTML = "Hide Picked for you Pins";
	}
	toggleVisibility(filterItems("Picked for you"));
});

// Hides the provided DOM element
function hideItem(item){
	item.style.display = "none";
}

// Displays the provided DOM element
function showItem(item){
	item.style.display = "block";
}

// Returns an array of elements that matched the provided filter string
function filterItems(filterString){
	var items = document.querySelectorAll(".item");
	return [].filter.call(items, function(item){
		return RegExp(filterString).test(item.textContent);
	});
}

// Intelligently toggles the display ("block" vs "none") of each element of the provided array of elements.
function toggleVisibility(filteredItems){
	filteredItems.forEach(function (item, index, array) {
		if (window.getComputedStyle(item,null).display == "block") {
			hideItem(item);
		} else {
			showItem(item);
		};
	});
}

// Catch new pins as they are loaded into the DOM when the user scrolls through their feed.
window.addEventListener('scroll', function(){
	if (hidePromoted) {
		filterItems("Promoted by").forEach(function (item, index, array) {
			hideItem(item);
		});
	};
	if (hidePickedForYou) {
		filterItems("Picked for you").forEach(function (item, index, array) {
			hideItem(item);
		});
	};
});