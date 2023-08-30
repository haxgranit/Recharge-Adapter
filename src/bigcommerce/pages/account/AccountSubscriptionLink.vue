<template>
    <Teleport :uniqueSelector="uniqueSelectorLink" :target="mountTo" mode="append" target-slim>
        <li :class="`${appendClasses} rca-manage-subscriptions`">
            <a :class="linkClasses" :style="cssVariables" :href="href" target="_blank">
                {{ $t("accounts.manage_subscriptions_label") }}
            </a>
        </li>
    </Teleport>
</template>

<script>
import { listElementStyleClasses } from "@/core/utils";
import { intersection } from "lodash";

export default {
    name: "AccountSubscriptionLink",
    props: ["customClassId", "href"],
    components: {
        Teleport: () => import("@/core/vue/components/Teleport"),
    },
    computed: {
        /**
         * Location to insert element.
         * @returns {string}
         */
        mountTo() {
            return this.getCustomClass(this.customClassId);
        },
        /**
         * Adds a unique selector whether it's mobile or desktop, so the link only adds once.
         * @returns {string} The selector with the subscription link and its parent element.
         */
        uniqueSelectorLink() {
            return this.mountTo + " " + this.getCustomClass("account_manage_subscriptions");
        },
        /**
         * Find common classes between these list item.
         * @returns {string} The classes to be added to the manage subscription link.
         *
         */
        appendClasses() {
            const el = this.getCustomClassElement(this.customClassId);
            const listEls = this.$(el).find("li");

            /**
             * @type {Array<Array>} List where each item is a list of classes.
             */
            const classes = Array.from(listEls).map((child) => child.classList);

            /**
             * @type {Array} List of classes which are present on all classes.
             */
            const sharedClasses = intersection(...classes);

            /** If there are no shared classes, return the classes from the last element. */
            return sharedClasses?.join(" ") || listEls.last().attr("class");
        },

        /**
         * Prepare classes that will be added to the link element.
         * @returns {string} All classes as string.
         */
        linkClasses() {
            const el = this.getCustomClassElement(this.customClassId);
            const classes = listElementStyleClasses("li > a", el);
            if (!this.isLiveLink) {
                classes.push(
                    "rca-link--disabled",
                    "rca-link--no-hover",
                    ".rca-manage-subscription"
                );
            }
            return classes.join(" ");
        },
        /**
         * Check if link exists.
         * @returns {boolean}   True if href exists, false if not.
         */
        isLiveLink() {
            return !!this.href;
        },
        /**
         * Apply correct theme color for css attributes.
         *
         * @returns {object} Object should hold value for the --property --color.
         */
        cssVariables() {
            const theme = this.$store_objects?.theme_settings;
            return { "--color": theme ? theme["color-textSecondary"] : "inherit" };
        },
    },
};
</script>

<style>
a.rca-link--disabled.rca-link--no-hover {
    cursor: default;
}
a.rca-link--disabled.rca-link--no-hover:hover {
    color: var(--color);
}
</style>
