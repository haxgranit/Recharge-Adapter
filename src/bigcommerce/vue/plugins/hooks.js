export default {
    /**
     * @param {object} Vue - Vue Instance.
     */
    install(Vue) {
        Vue.mixin({
            /**
             * @returns {*} - Vue Data.
             */
            data() {
                return {
                    hooks: {},
                };
            },
            methods: {
                /**
                 * @returns {Promise} - Stencil utils hooks.
                 */
                setHooks: function () {
                    return new Promise((resolve,reject) => {
                        if (window?.stencilUtils) {
                            this.hooks = window.stencilUtils.hooks;
                            this.$logger.debug("Hooks properly loaded");
                            resolve("Hooks properly loaded");
                        } else {
                            this.$logger.error("Failed to get hooks from window object");
                            reject("Failed to get hooks from window object")
                        }
                    });
                },
            },
        });
    },
};
