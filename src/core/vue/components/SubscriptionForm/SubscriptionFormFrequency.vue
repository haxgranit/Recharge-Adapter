<template>
    <transition name="slide-fade">
        <label v-if="show" class="rca-subscription-form__frequency">{{ labelText }}
            <select
                :value="value"
                v-on:input="$emit('input', $event.target.value)"
                class="rca-subscription-form__frequency-selector"
            >
                <option v-for="(opt, index) in frequencies" :value="opt.value" v-bind:key="index"
                        class="rca-subscription-form__frequency-option">
                    {{ opt.text }}
                </option>
            </select>
        </label>
    </transition>
</template>

<script>
export default {
    name: "SubscriptionFormFrequency",
    props: {
        /**
         * Label text to display for the frequency selector.
         */
        labelText: {
            type: String,
            default: ""
        },
        /**
         * An array of subscription frequencies (ex. [{value: 30, text: "Every 30 days"}]).
         */
        frequencies: {
            type: Array,
            required: true
        },
        /**
         * Whether to hide or show the frequency input.
         */
        show: {
            type: Boolean,
            default: true
        },
        /**
         * The value to bind selections to.
         */
        value: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            frequencySelectorClass: this.getCustomClass("frequency_selector", false),
            frequencyOptionClass: this.getCustomClass("frequency_option", false)
        }
    }
}
</script>

<style>

.rca-subscription-form__frequency {
    display: block;
}

 .rca-subscription-form__frequency-selector{
    width: 200px;
    display: block;
    border-radius: 0.5em;
    padding: 0.5em;
    color: black;
}

.rca-subscription-form__frequency-selector:focus {
    box-shadow: 0 0 0 0.5pt black;
    outline: none !important;
}

.slide-fade-enter-active {
    overflow: hidden;
    transition: all 300ms ease-in-out;
}

.slide-fade-leave-active {
    overflow: hidden;
    transition: all 300ms ease-in-out;
}

.slide-fade-enter-to, .slide-fade-leave {
    opacity: 1;
    max-height: 4em;
}

.slide-fade-enter, .slide-fade-leave-to {
    opacity: 0;
    max-height: 0;
}


</style>
