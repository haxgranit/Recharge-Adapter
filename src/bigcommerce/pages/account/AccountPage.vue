<template>
    <div v-if="displayLinks && portalUrl">
        <!-- Desktop Link -->
        <account-subscription-link
            v-if="hasNavbarSection"
            :customClassId="'account_navbar_section'"
            :href="portalUrl"
        />
        <!-- Mobile Link -->
        <account-subscription-link
            v-if="hasMobileMenuSection"
            :customClassId="'all_mobile_menu_account_section'"
            :href="portalUrl"
        />
        <!--Mobile selector for FAB-->
        <account-subscription-link
            customClassId="all_mobile_menu_account_section_fab"
            :href="portalUrl"
        />
    </div>
</template>

<script>
import { adapterBackendMixin } from "@/core/utils";
import CustomerMixin from "@/core/vue/mixins/customer";
import { AccountSubscriptionLink } from "@/bigcommerce/pages";

export default {
    name: "AccountPage",
    components: { AccountSubscriptionLink },
    mixins: [CustomerMixin, adapterBackendMixin],
    /**
     * Initializing the variables for the application.
     * @returns {object} All the data initialized.
     */
    data() {
        return {
            /**
             * If True, the desktop subscription link has already been added to the page.
             */
            hasNavbarSection: false,
            /**
             * If True, the mobile subscription link has already been added to the page.
             */
            hasMobileMenuSection: false,
        };
    },
    /**
     *
     */
    methods: {
        /**
         * This method checks if the custom subscription link elements already exists.
         * The corresponding `data` attributes are updated with the results.
         *
         * @property {Array} navbarSectionElements - A list of elements.
         * @property {Array} mobileMenuSectionElements -A list of elements.
         */
        checkExistCustomElements() {
            const navbarSectionElements = this.getCustomClassElements("account_navbar_section");
            const mobileMenuSectionElements = this.getCustomClassElements(
                "all_mobile_menu_account_section"
            );
            this.hasNavbarSection = navbarSectionElements.length > 0;
            this.hasMobileMenuSection = mobileMenuSectionElements.length > 0;
        },
    },
    /**
     *
     */
    mounted() {
        this.$logger.debug("Mounting...");
        this.addCustomClassesToGroup("account");
        this.checkExistCustomElements();
        this.displayLinks = true;
        this.preloadCustomerPortalUrl();
    },
};
</script>

<style></style>
