<template>
    <span class="rca-subscription-form__radio-type">
        <label
            v-if="showSubscription"
            class="rca-subscription-form__label"
            :class="{
                'rca-subscription-form__radio--selected': value === optionProps.first.inputValue,
            }"
        >
            <input
                type="radio"
                class="rca-subscription-form__radio"
                :class="optionProps.first.inputClass"
                :value="optionProps.first.inputValue"
                v-model="value"
                :disabled="subscriptionType.endsWith('_only')"
                v-on:input="$emit('input', $event.target.value)"
            />
            <span>{{ optionProps.first.spanText }}</span>
        </label>
        <label
            v-if="showSubscription"
            class="rca-subscription-form__label"
            :class="{
                'rca-subscription-form__radio--selected': value === optionProps.second.inputValue,
            }"
        >
            <input
                type="radio"
                class="rca-subscription-form__radio"
                :class="optionProps.second.inputClass"
                :value="optionProps.second.inputValue"
                v-model="value"
                :disabled="subscriptionType.endsWith('_only')"
                v-on:input="$emit('input', $event.target.value)"
            />
            <span class="">{{ optionProps.second.spanText }}</span>
        </label>
    </span>
</template>

<script>
export default {
    name: "RadioFormType",
    props: {
        /**
         * The type of the first option shown.
         * Must be autodeliver or onetime.
         */
        firstOption: {
            type: String,
            default: "autodeliver",
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
         * The text to display for the subscription option.
         */
        subscriptionMsg: {
            type: String,
            required: true,
        },
        /**
         * The text to display for the onetime option.
         */
        onetimeMsg: {
            type: String,
            required: true,
        },
        /**
         * The value to bind selections to
         * and the one that selects the default option on page load.
         */
        value: {
            type: String,
            required: true,
        },
    },
    computed: {
        /**
         * @returns {boolean} Indicator if this product should show Subscription/Onetime selectors.
         */
        showSubscription() {
            return ["subscription_and_onetime"].includes(this.subscriptionType);
        },
        /**
         * @typedef {object} optionProps
         * @property {object} first - Properties for the first label element.
         * @property {string} first.inputClass - Additional class to include on the input element.
         * @property {string} first.inputValue - The value of the input element.
         * @property {string} first.spanText - The text value displayed by the span element.
         * @property {object} second - Properties for the second label element.
         * @property {string} second.inputClass - Additional class to include on the input element.
         * @property {string} second.inputValue - The value of the input element.
         * @property {string} second.spanText - The text value displayed by the span element.
         *
         * @returns {optionProps}
         */
        optionProps() {
            const subFirst = this.firstOption.toLowerCase() === "autodeliver";
            const values = {
                subscription: {
                    inputClass: `rca-subscription-form__radio--subscription`,
                    inputValue: "subscription",
                    spanText: this.subscriptionMsg,
                },
                onetime: {
                    inputClass: `rca-subscription-form__radio--otp`,
                    inputValue: "onetime",
                    spanText: this.onetimeMsg,
                },
            };
            return {
                first: subFirst ? values.subscription : values.onetime,
                second: subFirst ? values.onetime : values.subscription,
            };
        },
    },
};
</script>

<style>
.rca-subscription-form__radio {
    margin-right: 0.5em;
}

.rca-subscription-form__label {
    color: var(--font_color);
}

.rca-subscription-form__radio--selected {
    background: var(--background_color);
    color: var(--active_color);
}
</style>
