<template>
    <form
        id="recharge-subscription"
        class="rca-subscription-form"
        v-if="subscriptionType !== 'onetime_only'"
    >
        <subscription-form-type
            v-model="selectedType"
            :input-type="inputType"
            :subscription-type="subscriptionType"
            :onetime-price="onetimeDisplayPrice"
            :subscription-price="subscriptionDisplayPrice"
            :onetime-text="onetimeDisplayText"
            :subscription-text="subscriptionDisplayText"
            :combined-text="combinedDisplayText"
        />
        <subscription-form-frequency
            v-model="selectedFrequency"
            :show="showFrequencyInput()"
            :label-text="frequencyDisplayLabel"
            :frequencies="subscriptionFrequencies"
        />
        <prepaid-subscription
            :subscription="subscriptionOptions"
            :showMainTitle="true"
            v-if="isPrepaidSubscriptionOptions(subscriptionOptions)"
        />
        <subscription-form-r-c-info v-if="showRCInfo" :show-popup="showPopup" />
    </form>
</template>

<script>
import { PricingMixin, SubscriptionDetailsMixin } from "@/core/vue/mixins";
import SubscriptionFormType from "./SubscriptionFormType";
import { EventBus } from "@/core/utils";

import PrepaidSubscription from "./PrepaidSubscription";
import SubscriptionFormFrequency from "./SubscriptionFormFrequency";
import SubscriptionFormRCInfo from "./SubscriptionFormRCInfo";

export default {
    name: "SubscriptionForm",
    components: {
        SubscriptionFormFrequency,
        SubscriptionFormType,
        SubscriptionFormRCInfo,
        PrepaidSubscription,
    },
    mixins: [PricingMixin, SubscriptionDetailsMixin],
    props: {
        /**
         * The type of input to use for subscription type.
         * Must be one of button, checkbox, radio.
         */
        inputType: {
            type: String,
            default: "button",
            validator: (prop) => ["button", "checkbox", "radio"].includes(prop),
        },
        /**
         * The type of ReCharge subscription.
         * Must be one of onetime_only, subscription_only, subscription_and_onetime.
         */
        subscriptionType: {
            type: String,
            required: true,
            default: "onetime_only",
            validator: (prop) =>
                ["onetime_only", "subscription_only", "subscription_and_onetime"].includes(prop),
        },
        /**
         * Product ID the subscription is for.
         */
        productID: {
            type: Number,
            required: true,
        },
        /**
         * Onetime price of the product.
         */
        onetimePrice: {
            type: Number,
            required: true,
        },
        /**
         * Subscription price of the product.
         */
        subscriptionPrice: {
            type: Number,
            required: true,
        },
        /**
         * Text describing discount (ex. 25%).
         */
        discountText: {
            type: String,
            default: "",
        },
        /**
         * Frequency unit of the subscription.
         */
        subscriptionFrequencyUnit: {
            type: String,
            default: "",
        },
        /**
         * An array of subscription frequencies (ex. [{value: "30", text: "Every 30 days"}]).
         */
        subscriptionFrequencies: {
            type: Array,
            default: () => [],
            /**.
             *
             * @param {object} prop Prop to validate.
             * @returns {object} Result if available.
             */
            validator: function (prop) {
                const result = prop.every((option) => option.value && option.text);
                if (!result) {
                    this.logger.error("Bad subscription options provided.");
                }
                return result;
            },
        },
        /**
         * The text to show on the page in the frequency label.
         */
        frequencyLabelText: {
            type: String,
            default: "",
        },
        /**
         * Whether to display RC info under the subscription form.
         */
        showRCInfo: {
            type: Boolean,
            default: true,
        },
        /**
         * A frequency value to set the form to when first loaded.
         */
        initialFrequency: {
            type: String,
            default: "",
        },
        /**
         * Boolean for whether the popup should be shown or not.
         */
        showPopup: {
            type: Boolean,
            default: true,
        },
        /**
         * Product subscription options in ReCharge format.
         */
        subscriptionOptions: {
            type: Object,
            required: true,
            default: () => ({}),
        },
    },
    /**
     * Initialize variables.
     *@returns {object} Object containing the SelectedType and the Selected Frequency.
     */
    data() {
        return {
            /**
             * Whether a subscription or onetime is selected.
             */
            selectedType: "",
            /**
             * The subscription frequency currently chosen.
             */
            selectedFrequency: "",
        };
    },
    computed: {
        /**
         * Display formatted price for onetime purchase.
         * @returns {string} The formatted price for one-time.
         */
        onetimeDisplayPrice: function () {
            return this.pricing.toPriceString(this.onetimePrice);
        },
        /**
         * Display formatted price for subscription purchase.
         * @returns {string} The formatted price for subscriptions.
         */
        subscriptionDisplayPrice: function () {
            return this.pricing.toPriceString(this.subscriptionPrice);
        },
        /**
         * Display formatted text for onetime purchase.
         * @returns {string} The onetime message.
         */
        onetimeDisplayText: function () {
            return this.$t("products.onetime_message");
        },
        /**
         * Display formatted text for subscription purchase.
         * @returns {string} The formatted text for subscription.
         */
        subscriptionDisplayText: function () {
            if (this.subscriptionPrice < this.onetimePrice) {
                return `${this.$t("products.subscribe_message")} ${this.discountText}`;
            }
            return this.$t("products.subscribe_without_discount_message");
        },
        /**
         * Display formatted text for any purchase.
         * @returns {string} The formatted text for any purchase.
         */
        combinedDisplayText: function () {
            if (this.discountText === "") {
                return `<b>${this.subscriptionDisplayText}</b>`;
            }
            return `<b>${this.subscriptionDisplayText}</b> ${this.$t(
                "products.sub_and_save_ext_label"
            )}`;
        },
        /**
         *@returns {string} The frequency label text.
         */
        frequencyDisplayLabel: function () {
            return this.frequencyLabelText === ""
                ? this.$t("products.widget_deliver_every")
                : this.frequencyLabelText;
        },
        /**
         * Checks which option should be selected first.
         * @returns {boolean} Returns true for subscription and false for one time.
         */
        select_subscription_first() {
            return this.settings.pages.product.select_subscription_first;
        },
    },
    methods: {
        /**
         * When subscription type or frequency is changed emit an event from the root frontend instance with new values.
         */
        saveSelectionStatus: function () {
            EventBus.$emit("sub-update-values", {
                type: this.selectedType,
                frequency: this.selectedFrequency,
            });
        },
        /**
         * Determines whether the frequency input element should be displayed.
         *
         * @returns {boolean} Whether to display the input element.
         */
        showFrequencyInput: function () {
            return (
                !this.isPrepaidSubscriptionOptions(this.subscriptionOptions) &&
                ["subscription_only", "subscription_and_onetime"].includes(this.subscriptionType) &&
                this.selectedType === "subscription"
            );
        },
    },
    watch: {
        /**
         *
         */
        selectedFrequency: function () {
            this.saveSelectionStatus();
        },
        /**
         *
         */
        selectedType: function () {
            this.saveSelectionStatus();
        },
    },
    /**
     *
     */
    created() {
        /**
         * This method checks the type of subscription the current product has, if it's subscription only
         * the selected type will always be subscription, but if the product is a subscribe and save one
         * we will be able to toggle between the selected options.
         * This doesn't trigger for products without a subscription.
         */
        if (this.subscriptionType === "subscription_only") {
            this.selectedType = "subscription";
        } else {
            this.selectedType = this.select_subscription_first ? "subscription" : "onetime";
        }

        // If frequencies are present set a default selected option.
        if (this.subscriptionFrequencies.length) {
            if (this.initialFrequency) {
                this.selectedFrequency = this.initialFrequency;
            } else {
                this.selectedFrequency = this.subscriptionFrequencies[0].value;
            }
        }
    },
};
</script>

<style>
.rca-subscription-form {
    flex-basis: 100%;
    order: 4;
    margin-top: 5px;
    margin-bottom: 5px;
}

@media only screen and (max-width: 550px) {
    .rca-subscription-form {
        align-items: center;
        display: flex;
        flex-direction: column;
    }
}
</style>
