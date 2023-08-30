export default {
    methods: {
        /**
         * Get elements found with CSS selector.
         * @param {string} elementCssQuery Class query of element where the class will be added.
         * @param {number} parentLevel The number of parent levels to go up.
         * @returns {Array.jQuery} Element with a new custom class.
         */
        getElements(elementCssQuery, parentLevel = 0) {
            let elements = this.$.find(elementCssQuery);
            for (let i = 0; i < parentLevel; i++) {
                for (let j = 0; j < elements.length; j++) {
                    elements[j] = this.$(elements[j]).parent();
                }
            }
            return elements;
        },
        /**
         * Get value of DOM element.
         * @param {string} record Record.
         * @param {* | null} defaultValue Default value.
         * @returns {*} Of DOM element.
         */
        getCustomClassValue(record, defaultValue = null) {
            const element = this.getCustomClassElement(record);
            return element?.value || defaultValue;
        },
        /**
         * Add custom class to given elements found with CSS selector.
         * @param {string} elementClass Class of element to be added.
         * @param {string} elementCssQuery Class query of element where the class will be added.
         * @param {number} parentLevel The number of parent levels to go up.
         * @param {string} selectionMode Single or multi elements selection.
         * @returns {boolean} Indicates if class was added.
         */
        addCustomClassToElement(
            elementClass,
            elementCssQuery,
            parentLevel = 0,
            selectionMode = "multi"
        ) {
            const isSingle = selectionMode === "single";
            let elements = this.getElements(elementCssQuery, parentLevel);
            let isAdded = false;

            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                if (!el) {
                    continue;
                }

                this.$(el).addClass(elementClass);

                isAdded = true;
                if (isSingle) {
                    break;
                }
            }

            return isAdded;
        },
        /**
         * Get custom class from given element.
         * @param {object} group Class of an element we are retrieving.
         * @param {object} replacements Key-value pair to modify for dynamic selectors.
         * @returns {HTMLElement} Element with a class we are retrieving.
         */
        addCustomClassesToGroup(group, replacements = {}) {
            const groupName = group.toLowerCase();
            Object.entries(this.$custom_classes.groups[groupName]).forEach(([recordId, record]) => {
                if (record === null) {
                    return;
                }

                const pl = record.parentLevel || 0;
                const selectionMode = record["mode"] || "multi";
                const isSingle = selectionMode === "single";
                const isMulti = selectionMode === "multi";

                // This searches the dom and can be very slow, moved
                // this outside of the for-loop to optimize performance
                const customElements = this.getCustomClassElements(recordId);

                // check existence of single custom element to avoid double injections
                if (isSingle && customElements.length > 0) {
                    return;
                }

                // This loop has two modes, do once and do all
                // in the do once case we use 'some' to abort once
                // we found a selector, in the other case we load every
                // class that we can find.
                this.$custom_classes.themes.some((currentTheme) => {
                    const selectorsList = record.selectors[currentTheme] || [];
                    for (let selector of selectorsList) {
                        for (const [key, value] of Object.entries(replacements)) {
                            selector = selector.replace(`\${${key}}`, value);
                        }
                        const isAdded = this.addCustomClassToElement(
                            record.custom_class,
                            selector,
                            pl,
                            selectionMode
                        );
                        if (!isMulti && isAdded) {
                            return true;
                        }
                    }
                    return false;
                });
            });
            return null;
        },
        /**
         * Remove elements that have been tagged with a generic rca removal class. Used by clients to remove
         * elements globally that should not co-exist with adapter.
         */
        genericRemove: function () {
            this.addCustomClassesToGroup("REMOVE");
            this.$(this.getCustomClass("generic_remove")).remove();
        },
        /**
         * @param {string} record_id Record Id.
         * @param {boolean} withDot Of boolean value.
         * @returns {string}
         */
        getCustomClass: function (record_id, withDot = true) {
            let record = this.$custom_classes.classes[record_id];
            let class_text = record?.custom_class || "";
            return withDot === true ? `.${class_text}` : class_text;
        },
        /**
         * Get the selectors for a given customer class id.
         * @param {string} record_id The name of the class record.
         * @param {object} replacements Key-value pair to modify for dynamic selectors.
         * @returns {Array<string>} List of selectors.
         */
        getCustomClassSelectors: function (record_id, replacements = {}) {
            const themesList = this.$custom_classes.themes;
            const record = this.$custom_classes.classes[record_id];
            return themesList.reduce((selectors, theme) => {
                const themeSelectors = record.selectors[theme];
                if (themeSelectors) {
                    selectors.push(...themeSelectors);
                }
                return selectors.map((s) => {
                    for (const [key, value] of Object.entries(replacements)) {
                        s = s.replace(`\${${key}}`, value);
                    }
                    return s;
                });
            }, []);
        },
        /**
         * Get HTML element from custom class selector.
         * @param {string} record Record.
         * @param {*} root Of the querySelector, default to document.
         * @returns {Array} Of elements if exists.
         */
        getCustomClassElement(record, root = document) {
            const selector = root.querySelector(this.getCustomClass(record));
            if (selector) {
                return selector;
            }
            return null;
        },
        /**
         * Get HTML collection from the matching query selector.
         * @param {*} record Record.
         * @param {*} root Of the querySelector, default to document.
         * @returns {Array} HTML collection.
         */
        getCustomClassElements(record, root = document) {
            const customClass = this.getCustomClass(record);
            if (root.querySelector(customClass)) {
                return root.querySelectorAll(customClass);
            }
            return [];
        },
        /**
         * Helper to support multiple attributes of a custom class element.
         * @param {*} record_id Record Id.
         * @param {*} root Root.
         * @returns {*} Attribute of the element.
         */
        getCustomAttribute: function (record_id, root = document) {
            try {
                const themesList = this.$custom_classes.themes;
                const record = this.$custom_classes.classes[record_id];
                const attributes = themesList.reduce((selectors, theme) => {
                    const themeSelectors = record.attributes[theme];
                    if (themeSelectors) {
                        selectors.push(...themeSelectors);
                    }
                    return selectors;
                }, []);

                const element = this.getCustomClassElement(record_id, root);
                for (const attribute of attributes) {
                    const elementAttribute = element.getAttribute(attribute);
                    if (elementAttribute) {
                        return elementAttribute;
                    }
                }

                this.$logger.error(`Failed to get custom attribute for custom class: ${record_id}`);
            } catch (e) {
                this.$logger.error(`Failed to get custom attribute for custom class: ${e}`);
            }
            return "";
        },
        /**
         * @param {string} record_id Record Id.
         * @returns {Array}
         */
        getCustomClassMutations(record_id) {
            const themesList = this.$custom_classes.themes;
            const record = this.$custom_classes.classes[record_id];
            return themesList.reduce((selectors, theme) => {
                const themeMutations = record.mutations[theme];
                if (themeMutations) {
                    selectors.push(...themeMutations);
                }
                return selectors;
            }, []);
        },
        /**
         * @param {string} record_id Record Id.
         * @returns {Array}
         */
        getCustomClassObservers(record_id) {
            const themesList = this.$custom_classes.themes;
            const record = this.$custom_classes.classes[record_id];
            return themesList.reduce((selectors, theme) => {
                const themeObservers = record.observers[theme];
                if (themeObservers) {
                    selectors.push(...themeObservers);
                }
                return selectors;
            }, []);
        },
    },
};
