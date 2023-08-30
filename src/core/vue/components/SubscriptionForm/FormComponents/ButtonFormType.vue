<template>
    <span class="rca-subscription-form__buttons-type">
        <label class="rca-subscription-form__buttons">
            <label
                v-if="showSubscription"
                class="rca-subscription-form__button rca-button-left"
                :class="[
                    {
                        'rca-subscription-form__button--selected':
                            value === optionProps.first.inputValue,
                    },
                    optionProps.first.inputClass,
                ]"
                @click="$emit('input', optionProps.first.inputValue)"
            >
                <span :class="optionProps.first.textClass">{{ optionProps.first.spanText }}</span>
                <br />
                <span class="rca-subscription-form__button-price">{{
                    optionProps.first.spanPrice
                }}</span>
            </label>
            <label
                v-if="showSubscription"
                class="rca-subscription-form__button rca-button-right"
                :class="[
                    {
                        'rca-subscription-form__button--selected':
                            value === optionProps.second.inputValue,
                    },
                    optionProps.second.inputClass,
                ]"
                @click="$emit('input', optionProps.second.inputValue)"
            >
                <span :class="optionProps.second.textClass">{{ optionProps.second.spanText }}</span>
                <br />
                <span class="rca-subscription-form__button-price">{{
                    optionProps.second.spanPrice
                }}</span>
            </label>
        </label>
    </span>
</template>

<script>
export default {
    name: "ButtonFormType",
    props: {
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
         * The subscription price of the item.
         */
        subPrice: {
            type: String,
            required: true,
        },
        /**
         * The onetime price of the item.
         */
        onetimePrice: {
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
         * @property {string} first.textClass - Additional class which pertains to the text displayed on button.
         * @property {string} first.inputValue - The value of the input element.
         * @property {string} first.spanPrice - The price displayed on the button.
         * @property {string} first.spanText - The text value displayed by the span element.
         * @property {object} second - Properties for the second label element.
         * @property {string} second.inputClass - Additional class to include on the input element.
         * @property {string} second.textClass - Additional class which pertains to the text displayed on button.
         * @property {string} second.inputValue - The value of the input element.
         * @property {string} first.spanPrice - The price displayed on the button.
         * @property {string} second.spanText - The text value displayed by the span element.
         *
         * @returns {optionProps} The first and second elements according to the value.
         */
        optionProps() {
            const subFirst = this.firstOption.toLowerCase() === "autodeliver";
            const values = {
                subscription: {
                    inputClass: `rca-subscription-form__button--subscription`,
                    textClass: `rca-subscription-form-buttons-subscription-text`,
                    inputValue: "subscription",
                    spanPrice: this.subPrice,
                    spanText: this.subscriptionMsg,
                },
                onetime: {
                    inputClass: `rca-subscription-form__button--otp`,
                    textClass: `rca-subscription-form-buttons-otp-text`,
                    inputValue: "onetime",
                    spanPrice: this.onetimePrice,
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
.rca-subscription-form__buttons-type {
    display: flex;
}

.rca-subscription-form__button {
    cursor: pointer;
    background: none;
    color: var(--font_color);
    display: inline-block;
    min-width: 144px;
    width: 50%;
    height: 100%;
    padding: 0.5em 0.2em;
    margin: 0;
    border-radius: 0;
    border: #917052 0.1em solid;
    text-align: center;
    flex: 1;
}

/**
* Styling for the button on the left or right respectively. To keep styling and custom classes separated
* and to avoid conflicts when the buttons change places.
*/
.rca-button-left {
    border-top-left-radius: 0.5em;
    border-bottom-left-radius: 0.5em;
    margin-right: 1px;
}

.rca-subscription-form__button--selected {
    box-shadow: 0 0 0 1px #917052;
    background: var(--background_color);
    color: var(--active_color);
}

.rca-button-right {
    border-top-right-radius: 0.5em;
    border-bottom-right-radius: 0.5em;
    margin-left: 1px;
}

.rca-subscription-form__button--selected {
    box-shadow: 0 0 0 1px var(--active_color);
}

.rca-subscription-form__button-price {
    font-size: 1.3em;
    font-weight: bold;
}

.rca-subscription-form__buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 338px;
}

@media only screen and (max-width: 400px) {
    .rca-subscription-form__button {
        font-size: 13px;
        padding: 0.5em 0.3em;
        width: calc(50vw - 30px);
        padding-top: 9px;
    }
}

@media only screen and (min-width: 401px) {
    .rca-subscription-form__button {
        width: 169px;
    }
}
</style>
