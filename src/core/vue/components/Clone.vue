<!-- This component copies an existing elements/node in the DOM and converts it into a Vue
 component. -->
<template>
    <component :is="template"></component>
</template>

<script>
import { nanoid } from "nanoid";
import jQuery from "jquery-slim";

export default {
    name: "Clone",
    props: {
        target: {
            type: [jQuery, String],
            required: true,
        },
    },
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * @property {string} rca_id - The unique ID for the temporary element created.
     * @property {string} selector - The CSS selector for the temporary mount element.
     */
    data() {
        const rca_id = nanoid();
        return {
            rca_id,
            selector: `[rca_id=${rca_id}`,
        };
    },
    computed: {
        /**
         * @returns {object} The template object containing the HTML for the cloned element.
         */
        template() {
            const target = this.$(this.target);
            target.attr("rca_id", this.rca_id);
            return { template: target.prop("outerHTML") };
        },
    },
    methods: {
        /**
         * @returns {jQuery} The cloned element as a jQuery object.
         */
        select() {
            return this.$(this.selector);
        },
    },
};
</script>

<style></style>
