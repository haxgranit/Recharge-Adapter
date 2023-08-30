import { mapActions } from "vuex";
import { adapterBackendMixin } from "@/core/utils/adapter-backend-helper";

export default {
    mixins: [adapterBackendMixin],
    // eslint-disable-next-line
    data() {
        return {
            /**
             * Config for Time to live in minutes and hours
             * customerTTL - customer time to live used for checking if customer has subscriptions
             * tokenTTL - customer portal url time to live used for updating customer portal url.
             */
            config: {
                customerTTL: 10, // minutes,
                tokenTTL: 6, //hours,
            },
            /**
             * Current customer within customer mixin.
             */
            currentCustomer: null,
            /**
             * Toggle to display customer portal url.
             */
            displayLinks: false,
        };
    },
    computed: {
        /**.
         * Returns formated active customer from local customer object
         *
         * @returns {Array} Customer formatted object with subscription boolean param
         */
        activeCustomer: function () {
            return {
                id: this.$store_objects.customer?.id,
                email: this.$store_objects.customer?.email,
                hasSubscriptions: !!this.currentCustomer?.rechargeCustomerId,
            };
        },
        /**.
         * Returns customer portal url from current customer object
         *
         * @returns {string|undefined} Customer portal url
         */
        portalUrl: function () {
            return this.currentCustomer?.portalUrl;
        },
    },
    methods: {
        ...mapActions({
            saveCustomer: "customer/saveCustomer",
            getCustomerFromStorage: "customer/getCustomer",
            listCustomersInStorage: "customer/listCustomers",
        }),
        /**.
         * Creates a new customer expiration from customerTTL var in minutes
         *
         * @returns {Date} Current date + {customerTTL} minutes
         */
        newCustomerExpiration() {
            const ttl = this.activeCustomer.hasSubscriptions ? this.config.customerTTL : 1;
            return Date.now() + ttl * 60 * 1000;
        },
        /**.
         * Creates a new Token expiration date
         *
         * @returns {Date} Current date + {tokenTTL} hours
         */
        newTokenExpiration() {
            return Date.now() + this.config.tokenTTL * 60 * 60 * 1000;
        },
        /**.
         * Determines if the current customer portal url is expired or not
         *
         * @returns {boolean} whether the current date is greater than the current customer expiration
         */
        isCustomerTokenExpired() {
            return Date.now() > this.currentCustomer.tokenExpiration;
        },
        /**.
         * Gets current customer from storefront api
         *
         */
        async getCustomerFromRemote() {
            const data = await this.bigcommerce.storefront.customer.get_current();
            this.currentCustomer = {
                id: this.activeCustomer.id,
                email: this.activeCustomer.email,
                rechargeCustomerId: data?.rc_id,
                rechargeCustomerHash: data?.rc_hash,
                token: null,
                expiration: this.newCustomerExpiration(),
                tokenExpiration: null,
                portalUrl: null,
            };
        },
        /**.
         * Gets current customer from storage or from storefront api
         *
         */
        async getCurrentCustomer() {
            this.currentCustomer = await this.getCustomerFromStorage({
                id: this.activeCustomer.id,
                email: this.activeCustomer.email,
                key: this.lsKey,
            });

            if (!this.currentCustomer) {
                await this.getCustomerFromRemote();
            }
            this.currentCustomer.expiration = this.newCustomerExpiration();
        },
        /**.
         * Queries recharge for customer portal data and sets a new expiration date
         *
         */
        async refreshCurrentCustomerData() {
            const customerPortalData = await this.adapterBackend.getRechargePortalData(
                this.currentCustomer.rechargeCustomerId,
                this.$store_objects.store_hash
            );
            if (customerPortalData.temp_token) {
                this.currentCustomer.token = customerPortalData.temp_token;
                this.currentCustomer.portalUrl = customerPortalData.portal_url;
                this.currentCustomer.tokenExpiration = this.newTokenExpiration();
            } else {
                this.currentCustomer.tokenExpiration = Date.now();
            }
        },
        /**.
         * Saves current customer to local vuex storage
         *
         */
        async saveCurrentCustomer() {
            if (this.currentCustomer) {
                this.saveCustomer({
                    customerData: this.currentCustomer,
                    key: this.lsKey,
                });
                const allCustomers = await this.listCustomersInStorage({ key: this.lsKey });
                const group = this.$logger.startGroup("Customer Data");
                group.debug("Current Customer");
                group.debug(this.currentCustomer);
                group.debug(`${allCustomers.length} Stored Customers`);
                group.debug(allCustomers);
                group.endGroup();
            }
        },
        /**
         * This loads the current customer's ReCharge Portal URL in the background.
         */
        async preloadCustomerPortalUrl() {
            await this.getCurrentCustomer();
            if (this.activeCustomer.hasSubscriptions) {
                this.$logger.debug(`Current Customer is A Subscription Customer`);

                if (this.isCustomerTokenExpired()) {
                    await this.refreshCurrentCustomerData();
                }
                await this.saveCurrentCustomer();
            } else {
                this.$logger.debug(`Current Customer is NOT A Subscription Customer`);
            }
        },
    },
};
