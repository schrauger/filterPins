// ==UserScript==
// @name   Remove Pinterest Sponsored Pins In Feed
// @author Noah Leigh
// @match  https://www.pinterest.com/*
// ==/UserScript==

// Create the button
var toggle = document.createElement("button");
toggle.innerHTML = "Toggle Filtering";
toggle.id = "toggle";

// Put button in header
var leftHeaderContent = document.querySelector('.leftHeaderContent');
leftHeaderContent.appendChild(toggle);

// Boolean for state of filtering
var block = false;

// Toggle filtering when the button is clicked
toggle.addEventListener('click', function(){
	if (block == false){
		block = true;
	} else {
		block = false;
	}
	toggleSponsoredItems();
});

// Either shows or hides all currently loaded Sponsored Pins
function toggleSponsoredItems(){
	var elements = document.querySelectorAll(".item");
	var sponsoredItems = [].filter.call(elements, function(element){
		return RegExp("Promoted by").test(element.textContent);
	});
	sponsoredItems.forEach(function(currentValue, index, array){
		if (block == true){
			currentValue.style.display = "none";
		} else {
			currentValue.style.display = "block";
		}
	});
}

// Run the function again when the window is scrolled to catch new pins as they are loaded into the DOM (could be refined).
window.addEventListener('scroll', toggleSponsoredItems);