<template>
    <teleport target=".rca-subscription" mode="before">
        <subscription-form v-bind="subscriptionFormProps"></subscription-form>
    </teleport>
</template>

<script>
import { EventBus } from "@/core/utils";
import { isEmpty } from 'lodash';
import { mapActions } from "vuex";
import PricingMixin from "@/core/vue/mixins/pricing";
import SubscriptionForm from "@/core/vue/components/SubscriptionForm/index";
import { Teleport } from "@/core/vue/components";

export default {
    name: "Subscription.vue",
    components: {
        // eslint-disable-next-line vue/no-unused-components
        Teleport,
        SubscriptionForm,
    },
    mixins: [PricingMixin],
    props: {
        /**
         * Product ID the subscription is for.
         */
        productID: {
            type: Number,
            required: true,
        },
        /**
         * Product price the subscription is for.
         */
        productPrice: {
            type: Number,
            required: true,
        },
        /**
         * Boolean for whether the popup should be shown or not.
         */
        showPopup: {
            type: Boolean,
            default: true,
        },
    },
    /**
     * @returns {object}
     */
    data() {
        return {
            /**
             * Product subscription options in ReCharge format.
             */
            subscriptionOptions: [],
            /**
             * Whether a subscription or onetime is selected.
             */
            selectedType: "",
            /**
             * The subscription frequency currently choosen.
             */
            selectedFrequency: false,
            /**
             * Properties to pass to the subscription form.
             */
            subscriptionFormProps: {},
            /**
             * Frequency Unit Translations.
             */
            frequencyUnitTranslations: this.$t("products.shipping_interval_unit_type"),
        };
    },
    computed: {
        /**
         * Shipping_interval_unit_type translation value.
         * @returns {JSON}
         */
        frequencyUnitsTranslations: function () {
            return JSON.parse(this.frequencyUnitTranslations);
        },
    },
    methods: {
        ...mapActions({ addSubItem: "addSubItem" }),
        /**
         * Build the properties to pass to the form.
         * @returns {object}
         */
        buildFormProps: function () {
            // ReCharge only supports a single subscription options group per product.
            const subscription_data = this.subscriptionOptions[0];

            // Determine subscription pricing fields to pass to form.
            let sub_price = this.pricing.calculateItemPrice({
                item_price: this.productPrice,
                ...subscription_data,
            }).value;

            const discount_amount = subscription_data?.discount_amount
                ? subscription_data.discount_amount
                : 0;
            const disc_formats = {
                percentage: `${discount_amount}%`,
                fixed_amount: this.pricing.toPriceString(discount_amount),
            };
            let disc_text =
                discount_amount > 0 ? disc_formats[subscription_data?.discount_type] : "";

            // Build subscription frequency values to pass to the form.
            const frequencies = subscription_data?.order_interval_frequency_options;
            // Key for get the localization frequency
            const frequencyUnitKey =
                subscription_data?.order_interval_unit === "day"
                    ? "days"
                    : subscription_data?.order_interval_unit;
            const frequencyUnit = this.frequencyUnitsTranslations[frequencyUnitKey];
            let sub_freq_ops = [];
            if (Array.isArray(frequencies) && frequencies.length) {
                let unit;
                frequencies.forEach((freq) => {
                    let unitKey = subscription_data?.order_interval_unit;
                    if (parseInt(freq) > 1) {
                        unitKey = `${unitKey}s`;
                    }
                    unit = this.frequencyUnitsTranslations[unitKey];
                    sub_freq_ops.push({ value: freq, text: `${freq} ${unit}` });
                });
            }
            // Build the properties to pass to the form.
            return {
                subscriptionType: subscription_data?.storefront_purchase_options,
                onetimePrice: this.productPrice,
                subscriptionPrice: sub_price,
                discountText: disc_text,
                subscriptionFrequencyUnit: frequencyUnit,
                subscriptionFrequencies: sub_freq_ops,
                showPopup: this.showPopup,
                productID: this.productID,
                subscriptionOptions: subscription_data,
                inputType: this.$store.getters.settings.pages.product.form_type,
            };
        },
        /**
         * Saves the subscription data to store with BC cart identifiers attached.
         *
         * @param {string} cart_id BC storefront cart id.
         * @param {string} line_id BC storefront line id.
         * @param {object} properties line-item properties.
         */
        saveSubscription: function (cart_id, line_id, properties = {}) {
            let sub_item = {
                cartid: cart_id,
                line_item: line_id,
                discount_type: false,
            };
            if (this.selectedType === "subscription") {
                sub_item = {
                    cartid: cart_id || "",
                    line_item: line_id,
                    shipping_unit: this.subscriptionOptions[0]?.order_interval_unit,
                    shipping_frequency: this.selectedFrequency,
                    charge_frequency: this.subscriptionOptions[0]?.charge_interval_frequency,
                    discount_type: this.subscriptionOptions[0]?.discount_type,
                    discount_amount: this.subscriptionOptions[0]?.discount_amount,
                    storefront_purchase_options:
                        this.subscriptionOptions[0]?.storefront_purchase_options,
                    productID: this.productID,
                };
            }
            if (!isEmpty(properties)) {
                sub_item.properties = properties;
            }
            this.addSubItem(sub_item)
                .then(() => {
                    this.$logger.debug(`Saved subscription information for cart line: ${line_id}`);
                    this.bigcommerce.getUpdatedCart();
                })
                .catch((msg) => {
                    this.$logger.error(
                        `Error saving subscription information for cart line: ${line_id}, ${msg}`
                    );
                });
        },
        /**
         * Registers listener for value update events from the subscription form.
         */
        registerOptionListener: function () {
            EventBus.$on("sub-update-values", this.handleSubUpdateValues);
        },
        /**
         * Registers listener for notification to save subscription information.
         */
        registerSaveListener: function () {
            EventBus.$on("save-subscription", this.handleSaveListener);
            EventBus.$on("save-subscription", this.handleUpdateCartId);
        },
        /**
         * Passes the cart and line-item ids along with line-item properties to save a subscription.
         *
         * @param {object} payload cart, line id and properties (ex. {cart_id=1,line_id=4, properties={ bundle_id = 1 }}).
         */
        handleSaveListener: function (payload) {
            this.saveSubscription(payload.cart_id, payload.line_id, payload.properties);
        },
        /**.
         * Updates cart id
         *
         * @param {object} payload A cart and line id (ex. {cart_id=1,line_id=4}).
         */
        handleUpdateCartId: function (payload) {
            this.$store_data.cart_id = payload.cart_id;
        },
        /**.
         * Updates selected value and frequency
         *
         * @param {object} payload A cart and line id (ex. {cart_id=1,line_id=4}).
         */
        handleSubUpdateValues: function (payload) {
            this.selectedType = payload.type;
            this.selectedFrequency = payload.frequency;
        },
    },
    watch: {
        /**
         *
         */
        productPrice: function () {
            this.subscriptionFormProps = this.buildFormProps();
        },
    },
    /**
     *
     */
    created() {
        // Setup data
        this.subscriptionOptions = this.$store_data.getSubscriptionsByBCProductID(this.productID);
        this.subscriptionFormProps = this.buildFormProps();
    },
    /**
     *
     */
    mounted() {
        this.addCustomClassesToGroup("ALL");

        // Listen for save events from the product page.
        this.registerSaveListener();
        this.registerOptionListener();
        this.$logger.debug("Success");
    },
    /**
     *
     */
    beforeDestroy() {
        EventBus.$off("sub-update-values", this.handleSubUpdateValues);
        EventBus.$off("save-subscription", this.handleSaveListener);
        EventBus.$off("save-subscription", this.handleUpdateCartId);
    },
};
</script>

<style></style>
