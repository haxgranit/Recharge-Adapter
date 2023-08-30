<template>
    <div v-if="isEnabled && ready" id="main-div">
        <bigcommerce-checkout v-if="isCheckoutEnabled"></bigcommerce-checkout>
        <preview-dropdown></preview-dropdown>
        <cart v-if="isCartPage"></cart>
        <template v-if="hasMultipleProducts && isCategoryPageEnabled">
            <cart-link
                v-for="(element, i) in cartElements"
                :key="i"
                :cartElement="element"
            ></cart-link>
        </template>
        <product-view
            v-if="isProductPage || isProductObserverStarted"
            :isQuickView="isQuickView"
        ></product-view>
        <account-page v-if="isAccountPage"></account-page>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import {
    Product as ProductView,
    Cart,
    CartLink,
    AccountPage,
    BigcommerceCheckout,
    PreviewDropdown,
} from "@/bigcommerce/pages";
import { appSupportedPageTypes } from "@/bigcommerce/vue/plugins";
import { CustomerMixin, MutationsCheckerMixin } from "@/core/vue/mixins";

export default {
    name: "App",
    components: {
        AccountPage,
        Cart,
        CartLink,
        BigcommerceCheckout,
        PreviewDropdown,
        ProductView,
    },
    mixins: [MutationsCheckerMixin, CustomerMixin],
    /**
     * Initializing the variables for the application.
     * @returns {object} All the data initialized.
     */
    data() {
        return {
            /**
             * An object of page types.
             */
            supportedPageTypes: appSupportedPageTypes,
            quickViewObserver: null, // TODO: RCA-1950: This can be refactored out if using jQuery Observe
            /**
             * Recharge JSON settings file.
             */
            rcaSettingsData: null,
            /**
             * SetInterval of JSON file requests.
             */
            jsonRequestInterval: null,
            /**
             * Time between requests in ms.
             */
            jsonRequestIntervalTime: 30000,
            /**
             * Quick view visibility on category page.
             */
            isQuickView: false,
            /**
             * Observable variable that changes if it's the product mutation for observing.
             */
            isProductObserverStarted: false,
            ready: false,
        };
    },
    computed: {
        ...mapGetters(["currentSubData"]),
        /**
         * @returns {boolean} - If RC checkout redirection is enabled.
         */
        isCheckoutEnabled() {
            return !!this.settings.pages.checkout.enabled;
        },
        /**
         * @returns {boolean} - If recharge parameter is set with test or true.
         */
        isTestModeEnabled() {
            return /[?&]recharge=(test|true)/i.test(window.location.search);
        },
        /**
         * @returns  {boolean} - Settings or test mode enabled.
         */
        isEnabled() {
            return this.settings.enabled || this.isTestModeEnabled;
        },
        /**
         * @returns {boolean} Indicator is current page is a Cart page.
         */
        isCartPage() {
            return (
                this.bigcommerce.currentPageType === "cart" ||
                window.location.pathname === "/cart.php" ||
                !!document.querySelector(this.getCustomClass("cart_view"))
            );
        },
        /**
         * @returns  {boolean}  Whether the URL is the account page.
         */
        isAccountPage() {
            return this.bigcommerce.currentPageType === this.supportedPageTypes.account;
        },
        /**
         * @returns {boolean} Whether the DOM has a stencil product view.
         */
        isProductPage() {
            return (
                this.bigcommerce.currentPageType === "product" ||
                !!document.querySelector(this.getCustomClass("product_view"))
            );
        },
        /**
         * @returns {boolean} Whether cart links are enabled to add subscription.
         */
        isCategoryPageEnabled() {
            return this.settings?.pages?.collection?.enabled ?? true;
        },
        /**
         * Get HTML collection of quick add buttons on home and category pages.
         *
         * @returns {Array} HTML collection.
         */
        cartElements() {
            return this.getCustomClassElements("cart_quick_link");
        },
        /**
         * If productGrid element exists, mount the CartLink components.
         *
         * @returns {boolean} True if product_grid does exist.
         */
        hasMultipleProducts() {
            return (
                // Check if the current page is a registered multiple product page
                this.bigcommerce.currentPageType === this.supportedPageTypes.multiple_products ||
                // If the $store_objects.products arrays contains anything, the page has multiple products
                !!this.$store_objects.products?.length ||
                // If a product grid element is present, the page should have multiple products
                !!this.getElements(this.getCustomClass("product_grid"))?.length
            );
        },
    },
    watch: {
        /**
         * @param {boolean}val Latest value of isEnabled.
         */
        isEnabled(val) {
            if (val) {
                if (!this.$store_data) {
                    this.disableApp();
                    this.$logger.error("RCA_DATA Not Found. Application is disabled");
                } else {
                    /**
                     * The test mode will override the Disabled state, otherwise it'll wait 60 seconds until
                     * the application can be started again.
                     */
                    if (!this.isTestModeEnabled && this.settingsLoader.isAppDisabled) {
                        this.$logger.error(
                            "Application is disabled. Wait a few seconds before reloading again."
                        );
                    } else {
                        this.$logger.debug("Application started");
                    }
                }
            } else {
                this.$logger.error("App is disabled by RCA_SETTINGS");
                this.disableApp();
                this.$logger.debug("Current Settings Value", this.settings);
            }
        },
        /**
         * @param val Latest value of settingsLoader
         */
        async settingsLoader(val) {
            if (!val.version) {
                this.$logger.debug("New settings version needed for initial load.");
                await val.refresh();
            }
        },
    },
    methods: {
        /**
         * Map the store actions for setting and checking the global disabled state.
         */
        ...mapActions({
            disableApp: "setAppDisabled",
            isAppDisabled: "isAppDisabled",
            getSubscriptions: "getSubscriptions",
            clearExpiredCustomers: "customer/clearExpiredCustomers",
        }),
        /**
         * Observe quickview for when to add subscription elements.
         */
        startQuickviewObserve: function () {
            // TODO: RCA-1950: We have a jQuery Observe plugin we should leverage here. Something like
            // ``` (Not working code)
            // this.$("body").observe("added", (record) => {
            //     if (this.checkMutationRecord(record, "quick_view")) {
            //         this.addCustomClassesToGroup("PRODUCT");
            //         this.isQuickView = true;
            //         this.isProductObserverStarted = true;
            //         this.quickviewObserver.disconnect();
            //     } else {
            //         this.isProductObserverStarted = false;
            //     }
            // });
            // ```
            // Then we can just call this.$("body").disconnect() on destroy to disable all body observers we created
            this.$logger.debug("starting subscriptionObserve");
            this.quickviewObserver = new MutationObserver((mutations) => {
                if (this.checkMutations(mutations, "quick_view")) {
                    this.addCustomClassesToGroup("PRODUCT");
                    this.isQuickView = true;
                    this.isProductObserverStarted = true;
                    this.quickviewObserver.disconnect();
                } else {
                    this.isProductObserverStarted = false;
                }
            });

            this.quickviewObserver.observe(document.querySelector("body"), {
                attributes: true,
                childList: true,
                subtree: true,
            });
        },
        /**
         *
         */
        addCustomClasses: function () {
            this.addCustomClassesToGroup("ALL");
            this.addCustomClassesToGroup("PRODUCT");
            this.addCustomClassesToGroup("CART");
            this.addCustomClassesToGroup("CATEGORY");
        },
        /**
         * Remove additional checkout buttons with no classes added.
         * @returns  {object} - Start, stop and hideAdditionalCheckoutButtonsIfRechargeCart functions
         *                      for DOM Mutation Observer.
         */
        additionalCheckoutButtonsObserver: function () {
            const $body = this.$("body");
            const hideAdditionalCheckoutButtonsIfRechargeCart = () => {
                if (this.bigcommerce.storefront.cart.isRechargeCart) {
                    this.$('[class*="additionalCheckoutButton"]').hide();
                }
            };
            return {
                start: () =>
                    $body.observe("childlist subtree", hideAdditionalCheckoutButtonsIfRechargeCart),
                stop: () =>
                    $body.disconnect(
                        "childlist subtree",
                        hideAdditionalCheckoutButtonsIfRechargeCart
                    ),
                hideAdditionalCheckoutButtonsIfRechargeCart,
            };
        },
        /**
         * Quick Search Observer.
         */
        startQuickSearchObserver: function () {
            // TODO: RCA-1950: We have a jQuery Observe plugin we should leverage here. Something like
            // $(this.getCustomClass("quick_search").observe("added", (record) => { ... })
            this.$logger.debug("Quick Search Observer Started");
            const quickSearchResults = this.getCustomClassElement("quick_search");
            this.quickSearchObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        this.addCustomClassesToGroup("CATEGORY");
                        this.startQuickviewObserve();
                        this.quickSearchObserver.disconnect();
                    }
                });
            });

            if (quickSearchResults) {
                this.quickSearchObserver.observe(quickSearchResults, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                });
            }
        },
    },
    /**
     * 1. Get all the cart information on page Load
     * 2. Clear all expired customer data.
     * 3. Refresh all settings.
     */
    created() {
        this.clearExpiredCustomers({ key: this.lsKey });
        this.settingsLoader.refresh();
    },
    /**
     *
     */
    mounted() {
        this.ready = true;
        this.$logger.debug(`Current Page Type: ${this.bigcommerce.currentPageType}`);
        this.$logger.log("Vue app mounted");
        this.addCustomClasses();
        this.additionalCheckoutButtonsObserver().start();
        this.startQuickSearchObserver();

        //trying to grab cart data as soon as we can.
        if (this.$store_objects.cart_id) {
            this.bigcommerce.getUpdatedCart();
        }

        // if quickview buttons exist, on product listing page
        const quickView = this.getCustomClassElements("quick_view");
        if (quickView.length > 0) {
            const self = this;
            for (const button of quickView) {
                button.addEventListener("click", function () {
                    self.$logger.debug("starting QuickViewObserver");
                    self.startQuickviewObserve();
                });
            }
        }

        this.preloadCustomerPortalUrl();

        //match bigcommerce cart lineItems wtih vuex cart.
    },
    /**
     *
     */
    destroyed() {
        this.additionalCheckoutButtonsObserver().stop();
    },
};
</script>
<style>
.rca-hide-element {
    display: None !important;
}
</style>
