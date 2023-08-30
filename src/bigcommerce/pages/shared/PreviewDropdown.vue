<template></template>
<script>
import {
    PricingMixin,
    CurrencyMixin,
    MutationsCheckerMixin,
    SubscriptionDetailsMixin,
} from "@/core/vue/mixins";
import { mapActions, mapGetters } from "vuex";
import BigcommerceCartMixin from "@/bigcommerce/vue/mixins/bc-cart";

export default {
    // eslint-disable-next-line jsdoc/require-jsdoc
    name: "PreviewDropdown",
    /**
     * @returns {object}
     */
    data() {
        return {
            /**
             * Component scope storage of the cart dropdown DOM observer.
             */
            cartDropdownObserver: false,
            checkoutButton: false,
        };
    },
    mixins: [
        PricingMixin,
        CurrencyMixin,
        MutationsCheckerMixin,
        BigcommerceCartMixin,
        SubscriptionDetailsMixin,
    ],
    computed: { ...mapGetters(["currentSubData"]) },
    methods: {
        /**
         * Map the stor actions.
         */
        ...mapActions(["removeSubItem"]),
        /**
         * Create observer to watch for updates to the navigation cart dropdown.
         */
        registerCartDropdownObserver: function () {
            this.cartDropdownObserver = new MutationObserver(this.handleCartDropdownObserver);
            this.$logger.debug("Nav cart dropdown observer registered.");
        },
        /**
         * Start watching the navigation cart dropdown for changes.
         * @returns {undefined} No return value.
         */
        // eslint-disable-next-line consistent-return
        startCartDropdownObserver: function () {
            this.addCustomClasses();
            const result = this.getCustomClassElement("cart_dropdown");
            if (result) {
                this.cartDropdownObserver.observe(result, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                });
                return this.$logger.debug("Nav cart dropdown observer started.");
            }
            this.$logger.error("Nav cart dropdown element not found.");
        },
        /**
         * Navigation cart dropdown observer callback to run when DOM changes are observed.
         * Updates modal pricing if subscription applies and replaces checkout button.
         *
         *  @param {Array.<MutationRecord>} mutations A list of modifications to the nav cart element.
         */
        handleCartDropdownObserver: function (mutations) {
            if (this.checkMutations(mutations, "cart_dropdown")) {
                this.refreshCheckoutData();
                this.addCustomClasses();
                this.checkItems();
                this.genericRemove();
                this.updateDropdown();
            }
        },
        /**.
         * Check for current items in the dropdown to clean the sub data
         *
         * @param {*} navCartElem - HTML collection of elements from the dropdown
         */
        checkItems: function (navCartElem = this.getCustomClassElement("cart_dropdown")) {
            if (this.getCustomClassElement("cart_dropdown_qty_controls")) {
                const cartElementsList = navCartElem.querySelectorAll(
                    this.getCustomClass("cart_dropdown_content")
                );
                const dropdownLineItems = [...cartElementsList].map((item) =>
                    item.getAttribute("data-id")
                );
                const itemsToRemove = this.currentSubData.filter(
                    (item) => !dropdownLineItems.includes(item.line_item)
                );

                if (dropdownLineItems && itemsToRemove) {
                    itemsToRemove.forEach((item) => {
                        this.removeSubItem({
                            cart_id: this.currentCartID(),
                            line_id: item.line_item,
                        });
                    });
                }
            }
        },
        /**
         * @param {HTMLElement} navCartElem Cart Dropdown Elements.
         */
        updateDropdown: async function (navCartElem = this.getCustomClassElement("cart_dropdown")) {
            this.$logger.debug("Refreshing cart dropdown");
            const subtotalElement = navCartElem.querySelector(
                this.getCustomClass("cart_dropdown_totals")
            );
            const cartElementsList = navCartElem.querySelectorAll(
                this.getCustomClass("cart_dropdown_content")
            );
            await this.overwriteCartDropdown(cartElementsList);
            await this.cartPromise;
            /**
             * Checks if there's a subtotal element and can change or hide it
             * depending on how the theme shows results.
             */
            if (subtotalElement) {
                let rechargeCheckout =
                    await this.bigcommerce.storefront.cart.createRechargeCheckout();
                subtotalElement.innerText = rechargeCheckout.subtotal_price.divide(100).format();
                this.hideForSubscription(this.bigcommerce.storefront.cart.isRechargeCart);
            }
        },
        /**
         * Returns the full or discounted price from an element.
         *
         * @param {HTMLElement} priceElement The price of an item inside the cart dropdown.
         * @returns {string|undefined} Returns formatted price.
         */
        getPriceString: function (priceElement) {
            if (priceElement !== null) {
                if (priceElement.firstElementChild !== null) {
                    if (priceElement.firstElementChild.classList.contains("price--discounted")) {
                        return this.pricing
                            .fromString(priceElement.innerText, { allPrices: true })
                            .pop()
                            .format();
                    }
                }
                return this.pricing.fromString(priceElement.innerText).format();
            }
            this.$logger.error("Failed to get price string from element");
            return "";
        },
        /**
         * Overwrite prices for cart dropdown.
         * @param {Array} cartElements HTML collection of the products that we would match in our current subdate to overwrite the information.
         */
        overwriteCartDropdown: async function (cartElements) {
            // eslint-disable-next-line jsdoc/require-jsdoc
            function setMap(map, key, subKey, value) {
                if (!map[key]) {
                    map[key] = {};
                }
                map[key][subKey] = value;
                return map;
            }

            const { data: cart_data = [] } = await this.getCartResponse();
            if (!cart_data?.length) {
                return;
            }

            const customClass = this.getCustomClass("cart_dropdown_price");
            const zipList = {};

            this.currentSubData.forEach((item) => {
                if (item.discount_type) {
                    setMap(zipList, item.line_item, "subData", item);
                }
            });

            const {
                lineItems: { physicalItems: lineItems },
            } = cart_data.find((e) => e);

            for (let i = 0; i < cartElements.length; i++) {
                const cartElement = cartElements[i];
                const cartData = lineItems[i]; // is this the same order?
                const dataId = cartData.id;

                try {
                    const { subData } = zipList[dataId];
                    const priceElement = cartElement.querySelector(customClass);

                    const origPrice = this.getPriceString(priceElement);
                    const priceString = this.pricing.toPriceString(cartData.salePrice);

                    const originalPriceValue = this.Currency(priceString);

                    const price = this.pricing.calculateItemPrice({
                        item_price: originalPriceValue,
                        ...subData,
                    }).value;
                    const priceFormat = this.pricing.toPriceString(price);

                    priceElement.innerHTML = priceElement.innerHTML.replace(origPrice, priceFormat);
                } catch (e) {
                    this.$logger.error(e);
                }
            }
        },
        /**
         * Get total price on cart dropdown.
         *
         * @param {Array} cartElementsList HTML collection of the products that we would match in our current subdate to overwrite the information.
         * @returns {string} Returns formatted price string.
         */
        getDropdownTotal: function (cartElementsList) {
            let cartDropdownTotal = 0;
            for (const cartElement of cartElementsList) {
                const priceElement = this.getCustomClassElement("cart_dropdown_price", cartElement);
                if (priceElement) {
                    const priceString = this.getPriceString(priceElement);
                    const originalPrice = this.pricing.fromString(priceString).value;
                    //removing the commas on big numbers to avoid mistakes
                    cartDropdownTotal += originalPrice;
                }
            }
            return this.pricing.toPriceString(cartDropdownTotal);
        },
        /**
         * Add custom classes to DOM elements.
         */
        addCustomClasses: function () {
            this.addCustomClassesToGroup("CART_DROPDOWN");
            this.addCustomClassesToGroup("ALL");
        },

        /**
         * Refreshes the BigCommerce Cart and Checkout data.
         * If a refresh is already running, a new refresh will not run.
         */
        refreshCheckoutData() {
            const app = this;
            if (!this.cartPromise) {
                this.cartPromise = this.bigcommerce.storefront.cart
                    .getCheckoutData()
                    .then(() => (app.cartPromise = null));
            }
        },
    },
    /**
     *
     */
    created() {
        //register DOM observers
        this.registerCartDropdownObserver();
        this.refreshCheckoutData();
    },
    /**
     *
     */
    mounted() {
        this.addCustomClasses();
        if (this.getCustomClassElement("cart_dropdown_content")) {
            const navCartElem = this.getCustomClassElement("cart_dropdown");
            this.updateDropdown(navCartElem);
        }
        //start listening for preview modal if nav menu exists
        if (this.getCustomClassElement("nav_user")) {
            this.startCartDropdownObserver();
        }
    },
};
</script>
