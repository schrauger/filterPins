// ==UserScript==
// @name         Filter Pins
// @namespace    http://tampermonkey.net/
// @version      3.0.2
// @description  Add buttons that let the user toggle the visibility of certain pins on Pinterest.
// @author       noahleigh
// @match        https://*.pinterest.com/*
// ==/UserScript==
(function filterPins() {
    // FUNCTIONS

    /**
     * Returns an object of arrays of nodes, with each array corresponding to a filter
     * rule.
     *
     * @param {NodeList} nodeList - A NodeList returned from document.querySelectorAll()
     * @param {Object} options - An Object where keys correspond to filter rules.
     * @param {boolean} options.filterRules.<filterName>.active - A boolean value indicating whether
     * or not the filter rule is active.
     * @param {string} options.filterRules.<filterName>.pattern - The string to match against to
     * determine if the node belongs to that filter.
     * @returns {Object} An object of arrays of nodes, with each array corresponding to a filter
     * rule.
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
     * @param {Object} filteredNodes - An object returned from filterNodes()
     * @param {Object} options - An Object where keys correspond to filter rules.
     * @param {boolean} options.filterRules.<filterName>.active - A boolean value indicating whether
     * or not the filter rule is active.
     * @param {string} options.filterRules.<filterName>.pattern - The string to match against to
     * determine if the node belongs to that filter.
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
     * Returns an array of <button> elements for toggling filter rules in options.
     *
     * @param {Object} options - An Object where keys correspond to filter rules.
     * @param {boolean} options.filterRules.<filterName>.active - A boolean value indicating whether
     * or not the filter rule is active.
     * @param {string} options.filterRules.<filterName>.pattern - The string to match against to
     * determine if the node belongs to that filter.
     * @returns {array} An array of <button> elements to be inserted into the DOM
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
     *  - the filterOptions object
     *  - the buttons for toggling the filter active states
     *  - the MutationObserver for applying filter rules as the page loads new pins
     */
    const init = function init() {
        // This object defines the filters and their current state (initally false)
        const filterOptions = {
            filterRules: {
                hidePromoted: {
                    active: false,
                    pattern: 'Promoted by',
                },
                hidePicked: {
                    active: false,
                    pattern: 'Picked for you',
                },
                hideIdeas: {
                    active: false,
                    pattern: 'Ideas for you',
                },
            },
            toggleFilter(filter) {
                this.filterRules[filter].active = !this.filterRules[filter].active;
            },
        };

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
}());
