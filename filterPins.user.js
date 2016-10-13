// ==UserScript==
// @name         Filter Pins
// @namespace    https://gist.github.com/noahleigh/
// @version      3.1.0
// @author       Noah Leigh
// @description  Add buttons that let the user toggle the visibility of certain pins on Pinterest.
// @homepage     https://gist.github.com/noahleigh/0c71909a860d15ea56fd
// @match        https://*.pinterest.com/*
// ==/UserScript==

// CLASSES

/** Class representing options for filters */
class FilterOptions {
    /**
     * Create a new FilterOptions object.
     */
    constructor() {
        this.filterRules = {};
    }
    /**
     * Add a filter to the options.
     * @param {string} filterName - The name of the filter to add.
     * @param {string} pattern - Some text that uniquely identifies the items to be filtered. It
     * should appear in the item's `.textContent` property.
     * @param {boolean} [state=false] - The initial state of the filter.
     */
    addFilter(filterName, pattern, state = false) {
        this.filterRules[filterName] = { pattern, state };
    }
    /**
     * Toggle the active state of the provided filter.
     * @param {string} filterName - The name of the filter to toggle.
     */
    toggleFilter(filterName) {
        this.filterRules[filterName].active = !this.filterRules[filterName].active;
    }
}

// FUNCTIONS

/**
 * An object with a property for each filter with arrays of Nodes as the values.
 * @example
 * {
 *     filterA: [...],
 *     filterB: [...],
 *     ...
 * }
 * @typedef {Object} FilteredNodes
 * @property {Array} [filterName] - Array of nodes that belong to that filter.
 */

/**
 * Get the nodes that match each filter.
 *
 * @param {NodeList} nodeList - A NodeList returned from document.querySelectorAll()
 * @param {FilterOptions} options - The options for the filters.
 * @returns {FilteredNodes} An object with properties for each filter
 */
const filterNodes = function filterNodes(nodeList, options) {
    const filteredNodes = {};
    Object.keys(options.filterRules).forEach((key) => {
        // Turn the NodeList into a proper Array so we can .filter() it.
        filteredNodes[key] = Array.prototype.slice.call(nodeList).filter(node => (
            // Return true if the pattern text exists in the element.
            RegExp(options.filterRules[key].pattern).test(node.textContent)
        ));
    });
    return filteredNodes;
};

/**
 * Sets the display CSS rule for the elements in filteredNodes according to the active status
 * of the filter in the options object.
 *
 * @param {FilteredNodes} filteredNodes - An object returned from filterNodes()
 * @param {FilterOptions} options - The options for the filters.
 */
const setDisplayValue = function setDisplayValue(filteredNodes, options) {
    Object.keys(options.filterRules).forEach((key) => {
        // Determine the 'display' value from the filter active state
        const displayValue = options.filterRules[key].active ? 'none' : 'block';
        // Set the 'display' value for each element
        filteredNodes[key].forEach(element => (element.style.display = displayValue)); // eslint-disable-line no-param-reassign, max-len
    });
};

/**
 * Returns an array of `<button>` elements for toggling filter rules in options.
 *
 * @param {FilterOptions} options - The options for the filters.
 * @returns {array} An array of `<button>` elements to be inserted into the DOM
 */
const createFilterButtons = function createFilterButtons(options) {
    // Return an array with .map()
    return Object.keys(options.filterRules).map((filter) => {
        // Make a convenience constant
        const filterRule = options.filterRules[filter];

        // Create the <button> element
        const button = document.createElement('button');

        // Add styling for Pinterest
        button.className = 'Button btn';
        button.style.margin = '0px 5px';

        // Set the textContent based on the filter active state
        button.textContent = `${filterRule.active ? 'Show ' : 'Hide '} ${filterRule.pattern} Pins`;

        // Add event listener for toggling filters
        button.addEventListener('click', () => {
            // Toggle the state of the attached filter
            // options[filter].active = !options[filter].active;
            options.toggleFilter(filter);

            // Set the diplay value of the .item's in the .GridItems container based on the new
            // active state
            setDisplayValue(filterNodes(document.querySelectorAll('.GridItems .item'), options), options);

            // Update the button text
            button.textContent = `${filterRule.active ? 'Show ' : 'Hide '} ${filterRule.pattern} Pins`;
        });

        return button;
    });
};

/**
 * Create:
 *  - the FilterOptions object
 *  - the buttons for toggling the filter active states
 *  - the MutationObserver for applying filter rules as the page loads new pins
 */
const init = function init() {
    // Create the FilterOptions object
    const filterOptions = new FilterOptions();
    filterOptions.addFilter('hidePromoted', 'Promoted by');
    filterOptions.addFilter('hidePicked', 'Picked for you');
    filterOptions.addFilter('hideIdeas', 'Ideas for you');

    // Create the buttons and add them to the left of the search bar.
    const buttonContainer = document.querySelector('.leftHeaderContent');
    createFilterButtons(filterOptions).forEach(button => (
        buttonContainer.appendChild(button)
    ));

    // Setup an observer for new nodes being added as the page scrolls
    const observer = new MutationObserver((mutationRecordArray) => {
        mutationRecordArray.forEach((mutationRecord) => {
            if (mutationRecord.addedNodes.length) {
                setDisplayValue(
                    filterNodes(mutationRecord.addedNodes, filterOptions),
                    filterOptions
                );
            }
        });
    });

    // Start the observer
    observer.observe(
        document.querySelector('.GridItems'),
        {
            childList: true,
            attributes: true,
            attributeFilter: ['style'],
        }
    );
};

// Start the UserScript
init();
