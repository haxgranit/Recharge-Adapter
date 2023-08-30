<template>
    <span>
        <subscription
            v-if="isValidPrice && productID"
            :productID="productID"
            :productPrice="productPrice"
            :showPopup="showPopup"
            ref="subscription"
        ></subscription>
        <preview-modal
            v-if="shouldPreviewModalMount"
            :productID="productID"
            :lastCartLineID="lastCartLineID"
        ></preview-modal>
    </span>
</template>

<script>
import Subscription from "./Subscription";
import PreviewModal from "@/bigcommerce/pages/shared/PreviewModal";
import BigcommerceCartMixin from "@/bigcommerce/vue/mixins/bc-cart";
import SubscriptionDetailsMixin from "@/core/vue/mixins/subscription-details";
import PricingMixin from "@/core/vue/mixins/pricing";
import LocalizeMixin from "@/core/vue/mixins/localize";

export default {
    name: "Product",
    mixins: [BigcommerceCartMixin, PricingMixin, LocalizeMixin, SubscriptionDetailsMixin],
    components: {
        PreviewModal,
        Subscription,
    },
    props: {
        /**
         * The price of the quickView Product.
         */
        isQuickView: {
            default: false,
        },
    },
    /**
     * @returns {object}
     */
    data() {
        return {
            /**
             * Attributes of the product coming from BC.
             */
            product_attributes: window.BCData.product_attributes,
            /**
             * Product ID of the current product.
             */
            productID: 0,
            /**
             * The price of the current product.
             */
            productPrice: null,
            /**
             * BC cart line id of the most recent add to cart.
             */
            lastCartLineID: "",
            /**
             * Holds references to the functions used in hooks.
             */
            hookFunctions: {},
            /**
             * Holds references to parse or not the page.
             */
            parsePage: this.isQuickView,
            /**
             * Used to determine when to mount the preview modal
             */
            shouldPreviewModalMount: false,
        };
    },
    computed: {
        /**
         * True if the product price is a numerical value.
         *
         * @returns  {boolean}
         */
        isValidPrice() {
            const isValid = this.productPrice !== null && this.productPrice !== undefined;
            this.$logger.debug(`Product Price: ${this.productPrice} = ${isValid}`);
            return isValid;
        },
        /**
         * Boolean for whether the popup should be shown or not.
         *
         * @returns {boolean}
         */
        showPopup() {
            return this.$store.getters.settings.pages.product.tooltip_enabled;
        },
    },
    methods: {
        /**.
         * Looks for the price value from the object of product attributes or parse the product view if is quick view and first time
         *
         * @param {object} priceObject Price object.
         * @param {boolean} parsePage Is first time running.
         * @returns {number} - Price Value.
         */
        getProductPrice: function (
            priceObject = this.$store_objects.product?.price,
            parsePage = this.parsePage
        ) {
            if (parsePage) {
                const priceElement = this.findProductPriceElem();
                return this.pricing.fromString(priceElement.textContent).value;
            }

            // Iterating th price object coming from the hook to get the proper value
            for (const key of Object.keys(priceObject)) {
                if (["with_tax", "without_tax"].includes(key)) {
                    return priceObject[key].value;
                }
            }
            return null;
        },
        /**
         * Find the products price in the DOM.
         *
         * @returns {*} Price element.
         */
        findProductPriceElem: function () {
            const selectors = this.getCustomClassSelectors("product_price");
            for (const selector of selectors) {
                let price_elem = document.querySelector(selector);
                if (price_elem) {
                    return price_elem;
                }
            }
            this.$logger.error("Product price element not found.");
            return null;
        },
        /**
         * Create product information for frontend component.
         */
        createProductInformation: function () {
            let productId =
                this.$store_objects?.product?.id ||
                parseInt(this.getCustomClassValue("product_id"));
            if (productId > 0) {
                this.productID = productId;
            }
            this.productPrice = this.getProductPrice();
        },
        /**
         * Wrapper function for managing registration of hooks.
         *
         * @param {string} hookName - Name of hook to register.
         * @param {*} handler - Hooks handler.
         */
        registerHooks: function (hookName, handler) {
            this.hookFunctions[hookName] = handler.bind(this);
            this.hooks.on(hookName, this.hookFunctions[hookName]);
        },
        /**
         * Wrapper function for managing unregistration of hooks.
         *
         * @param {string} hookName - Name of hook to register.
         */
        unregisterHooks: function (hookName) {
            if (this.hookFunctions[hookName]) {
                this.hooks.off(hookName, this.hookFunctions[hookName]);
            }
        },
        /**
         * Wrapper for passing event responses to update cart item information.
         *
         * @param {object} event Cart-item-add-remote.
         */
        saveSubscriptionHandler: function (event) {
            try {
                this.shouldPreviewModalMount = true;
                const cart_item_id = event.response.data.cart_item.id;
                const properties = event.response.data.cart_item.line_item_properties;
                const cart_id =
                    this.$store_objects.cart_id || this.bigcommerce.storefront.cart.cartId;
                this.$refs.subscription.saveSubscription(cart_id, cart_item_id, properties);
                this.lastCartLineID = cart_item_id;
            } catch (e) {
                this.$logger.error(e);
            }
        },
        /**.
         * Update price when any options is selected.
         * Supports modifiers and variant options
         *
         * @param {object} data - Response data from event
         * @returns {number} - Product Price
         */
        productChangeHandler: function (data) {
            const {
                response: {
                    data: { price },
                },
            } = data;
            this.parsePage = false;
            return (this.productPrice = this.getProductPrice(price));
        },
    },
    /**
     *
     */
    async mounted() {
        this.$logger.debug("Product | Product view mounted.");
        this.$logger.debug("Product | Data ", this.$data);
        this.addCustomClassesToGroup("PRODUCT");
        this.createProductInformation();

        try {
            await this.setHooks();
            this.registerHooks("cart-item-add-remote", this.saveSubscriptionHandler);
            this.registerHooks("product-options-change-remote", this.productChangeHandler);
        } catch (e) {
            this.$logger.error("Unable to register listener hooks ");
        }
    },
    /**
     *
     */
    beforeDestroy() {
        this.unregisterHooks("cart-item-add-remote");
        this.unregisterHooks("product-options-change-remote");
    },
};
</script>

<style></style>
