<template>
    <teleport
        v-if="priceElem"
        :target="priceElem"
        uniqueSelector="#rca-subscribe-data"
        mode="after"
        :key="updateSubscriptionInfo"
    >
        <prepaid-subscription
            v-if="this.isPrepaidProduct()"
            id="rca-subscribe-data"
            :subscription="subscriptionByBCProductID"
            :showMainTitle="false"
        ></prepaid-subscription>
        <subscribe-and-save
            v-else-if="this.isSubscriptionProduct()"
            id="rca-subscribe-data"
            :className="this.getCustomClass('cart_modal_sub_text', false)"
            :shippingFrequency="shippingFrequency"
            :subscribeWording="subscribeWording"
            :unit="unit"
            key="subnsave-previewmodal"
        ></subscribe-and-save>
    </teleport>
</template>

<script>
import { BaseMutationObserver } from "@/core/utils";
import PrepaidSubscription from "@/core/vue/components/SubscriptionForm/PrepaidSubscription";
import SubscribeAndSave from "@/bigcommerce/pages/shared/PreviewModal/SubscribeAndSave";
import { PricingMixin, LocalizeMixin, SubscriptionDetailsMixin } from "@/core/vue/mixins";
import BigcommerceCartMixin from "@/bigcommerce/vue/mixins/bc-cart";
import { waitForElementToExist } from "@/core/utils";
import { Teleport } from "@/core/vue/components";

export default {
    name: "PreviewModal",
    components: {
        PrepaidSubscription,
        SubscribeAndSave,
        Teleport,
    },
    props: {
        /**
         * ProductID of current product.
         */
        productID: {
            type: Number,
            required: true,
        },
        lastCartLineID: {
            type: String,
            required: true,
            default: "",
        },
    },
    mixins: [PricingMixin, BigcommerceCartMixin, LocalizeMixin, SubscriptionDetailsMixin],
    /**
     * @returns {object}
     */
    data() {
        let app = this;
        let previewModalContentObserver = new BaseMutationObserver({
            name: "Preview Modal Content Observer",
            observedElementSelector: app.getCustomClass("cart_modal_content"),
            observerOptions: { childList: true },
            /**
             * @param {*} mutation Mutation.
             */
            callback: function (mutation) {
                let targetMutation = mutation.find((m) => m.addedNodes.length > 0);
                if (targetMutation) {
                    waitForElementToExist(
                        app.getCustomClassSelectors("checkout_button"),
                        app.renderCheckoutOptions
                    );
                }
            },
            startHook: app.addCustomClasses,
        });
        return {
            /**
             * Component scope storage of the preview modal content DOM observer.
             */
            previewModalContentObserver: previewModalContentObserver,
            /**
             * State for prepaid message subscription detail.
             */
            prepaidSubMessage: false,
            /**
             * Target element for teleport mounting.
             */
            priceElem: null,
            /**
             * Shipping frequency.
             */
            shippingFrequency: "",
            /**
             * Subscribe text words.
             */
            subscribeWording: "",
            /**
             * Subscription unit.
             */
            unit: "",
            /**
             * Teleport price element's key value by the current date.
             */
            updateSubscriptionInfo: Date.now(),
        };
    },
    computed: {
        /**
         * Return sub data by cart line ID.
         *
         * @returns {object}
         */
        subscriptionByCartLineID() {
            return this.$store.getters.subData.find((sub) => sub.line_item === this.lastCartLineID);
        },
        /**
         * Return sub data by bigcommerce product ID.
         *
         * @returns {object}
         */
        subscriptionByBCProductID() {
            return this.$store_data.getSubscriptionsByBCProductID(this.productID)[0];
        },
    },
    methods: {
        /**
         * Calculate the subtotal of a cart with subscriptions included.
         *
         *  @param {object} cart_data Bigcommerce storefront cart API response.
         *  @returns {number} The subtotal of a cart.
         */
        calculateSubtotalPrice: function (cart_data) {
            let subtotal = this.Currency(0);
            const item_types = ["physicalItems", "digitalItems", "customItems"];
            for (let item_type of item_types) {
                let type_lines = cart_data.lineItems[item_type];
                for (let line of type_lines) {
                    let line_sub_data = this.pricing.getLineSubData(line);
                    let line_price = this.pricing.calculateLinePrice({
                        item_price: line.salePrice,
                        item_quantity: line.quantity,
                        ...line_sub_data,
                    });
                    subtotal = subtotal.add(line_price);
                }
            }
            return subtotal.value;
        },
        /**
         * @returns {string} Formatted subtotal price.
         */
        // eslint-disable-next-line consistent-return
        getSubtotalPrice: async function () {
            let cart_data = (await this.getCartResponse()).data[0];
            if (Object.keys(cart_data).length > 0) {
                this.$store.commit("setCartID", cart_data.id);
                const subtotal_price = this.calculateSubtotalPrice(cart_data);
                return this.Currency(subtotal_price).format();
            }
            this.$logger.fatal(`BC get cart invalid response: ${cart_data}`);
        },
        /**
         * Update subtotal for all elements.
         */
        updateAllSubtotalElements: function () {
            let callback = function () {
                const subtotal_price_elem = this.getCustomClassElements("cart_modal_subtotal");
                if (subtotal_price_elem) {
                    this.$logger.debug("Subscription updated, updating subtotal price.");
                    subtotal_price_elem.forEach((elem) => {
                        this.getSubtotalPrice().then((price) => {
                            elem.textContent = price;
                        });
                    });
                }
            }.bind(this);
            waitForElementToExist(this.getCustomClass("cart_modal_subtotal"), callback);
        },
        /**
         * Add custom classed.
         */
        addCustomClasses: function () {
            this.addCustomClassesToGroup("ALL");
            this.addCustomClassesToGroup("CART_MODAL");
        },
        /**
         * Create the subscription and other checkout elements in the DOM.
         */
        renderCheckoutOptions: function () {
            this.addCustomClasses();
            this.$logger.debug("rendering checkout options");
            this.updateAllSubtotalElements();

            this.priceElem = this.getCustomClassElement("cart_modal_price");
            if (!this.priceElem) {
                return;
            }

            const price_str = this.priceElem.textContent;
            const price = this.pricing.fromString(price_str);
            const discount_price = this.pricing.calculateItemPrice({
                item_price: price,
                ...this.subscriptionByCartLineID,
            });

            this.priceElem.textContent = price_str.replace(price.format(), discount_price.format());
            if (this.subscriptionByCartLineID?.shipping_frequency) {
                this.shippingFrequency = this.subscriptionByCartLineID.shipping_frequency;

                this.subscribeWording =
                    price.value !== discount_price.value
                        ? this.subscribeText("subscribesave")
                        : this.subscribeText("subscribe");

                this.unit = this.displayIntervalText(
                    this.subscriptionByCartLineID.shipping_unit,
                    this.subscriptionByCartLineID.shipping_frequency
                );

                this.updateSubscriptionInfo = Date.now();
            } else {
                this.$logger.debug("No product detail element found in preview modal.");
            }
        },
        /**
         * Check if the current product is a Subscription Product.
         *
         * subscription products match criteria.
         * Subscription has shipping frequency.
         *
         * @returns {boolean} Bool if product is a subscription product.
         */
        isSubscriptionProduct() {
            return this.bigcommerce.storefront.cart.getCartItemByLineItemId(this.lastCartLineID)
                .subscription.isSubscription;
        },
        /**
         * Check if the current product is a prepaid subscrition.
         *
         * Prepaid products match criteria.
         * Subscription has shipping frequency.
         * Subscription charge frequency is greater than shipping frequency.
         *
         * @returns {boolean} Bool if product is a prepaid subscription.
         */
        isPrepaidProduct() {
            return this.bigcommerce.storefront.cart.getCartItemByLineItemId(this.lastCartLineID)
                .subscription.isPrepaid;
        },
    },
    /**
     *
     */
    created() {
        // register DOM observers
        this.previewModalContentObserver.register();
    },
    /**
     *
     */
    mounted() {
        this.bigcommerce.getUpdatedCart().then(() => {
            this.renderCheckoutOptions();
            // start listening for preview modal
            this.previewModalContentObserver.start();
        });
    },
    /**
     *
     */
    beforeDestroy() {
        // stop listening for subscription changes on component destroy
        this.previewModalContentObserver.stop();
    },
};
</script>
