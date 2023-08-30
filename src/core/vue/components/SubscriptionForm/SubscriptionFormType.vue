<template>
    <span :style="cssVariables">
        <radio-form-type
            v-if="inputType === 'radio'"
            :onetime-msg="`${onetimeText} - ${onetimePrice}`"
            :subscription-msg="`${subscriptionText} - ${subscriptionPrice}`"
            :subscription-type="subscriptionType"
            :first-option="first_option"
            :value="value"
            v-on="$listeners"
        />
        <span v-if="inputType === 'checkbox'" class="rca-subscription-form__checkbox-type">
            <label
                v-if="['subscription_and_onetime'].includes(subscriptionType)"
                class="rca-subscription-form__label"
            >
                <input
                    class="rca-subscription-form__checkbox rca-subscription-form-checkbox-input"
                    type="checkbox"
                    ref="checkbox"
                    :checked="false"
                    :disabled="subscriptionType.endsWith('_only')"
                    v-on:change="$emit('input', $event.target.checked ? 'subscription' : 'onetime')"
                />
                <span
                    class="rca-subscription-form-checkbox-combined-text"
                    v-html="combinedText"
                ></span>
            </label>
        </span>
        <button-form-type
            v-if="inputType === 'button'"
            :first-option="first_option"
            :onetime-msg="onetimeText"
            :subscription-msg="subscriptionText"
            :subscription-type="subscriptionType"
            :sub-price="subscriptionPrice"
            :onetimePrice="onetimePrice"
            :value="value"
            v-on="$listeners"
        />
    </span>
</template>

<script>
import RadioFormType from "./FormComponents/RadioFormType";
import ButtonFormType from "./FormComponents/ButtonFormType";

export default {
    name: "SubscriptionFormType",
    components: { RadioFormType, ButtonFormType },
    props: {
        /**
         * The type of input to use for subscription type.
         * Must be one of button, checkbox, radio.
         */
        inputType: {
            type: String,
            required: true,
        },
        /**
         * The type of ReCharge subscription.
         * Must be one of onetime_only, subscription_only, subscription_and_onetime.
         */
        subscriptionType: {
            type: String,
            required: true,
        },
        /**
         * Onetime display price of the product.
         */
        onetimePrice: {
            type: String,
            required: true,
        },
        /**
         * Subscription display price of the product.
         */
        subscriptionPrice: {
            type: String,
            required: true,
        },
        /**
         * Displayed label text for onetime purchase.
         */
        onetimeText: {
            type: String,
            required: true,
        },
        /**
         * Displayed label text for subscription purchase.
         */
        subscriptionText: {
            type: String,
            required: true,
        },
        /**
         * Displayed label text for any purchase.
         */
        combinedText: {
            type: String,
            required: true,
        },
        /**
         * The value to bind selections to.
         */
        value: {
            type: String,
            required: true,
        },
    },
    methods: {
        /**
         * Checks the checkbox as soon as the page loads if settings.select_subscription_first is true.
         */
        toggleCheckbox: function () {
            const checkbox = this.$refs.checkbox;
            if (checkbox) {
                checkbox.checked = this.settings.pages.product.select_subscription_first
                    ? true
                    : false;
            }
        },
    },
    computed: {
        /**
         * Define css variables for Phase 2.
         * @returns {object} An object containing all the settings for the styling.
         */
        cssVariables() {
            return {
                "--active_color": this.settings.style.active_color,
                "--font_color": this.settings.style.font_color,
                "--background_color": this.settings.style.background_color,
            };
        },
        /**
         * For radio form_type, which option should appear first.
         * @returns {string} The option which should appear first on the settings. Should be onetime or autodeliver.
         */
        first_option() {
            return this.settings.pages.product.first_option;
        },
    },
    /**
     *
     */
    mounted() {
        this.toggleCheckbox();
    },
};
</script>

<style>
.rca-subscription-form__checkbox {
    margin-right: 0.5em;
}

.rca-subscription-form__label:after {
    content: "";
    display: block;
}
</style>
