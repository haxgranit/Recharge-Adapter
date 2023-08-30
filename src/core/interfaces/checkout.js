import { mapGetters } from "vuex";
import store from "@/core/vue/store";
import { interfaceConfig, makeVM, CartInterface as cart } from "@/core/interfaces";
import { RechargeCheckoutForm } from "@/core/vue/components";

/**
 * DEPRECATED  todo Remove this function after September 01, 2021
 * Creates a RC checkout payload.
 *
 * @param {object} bc_cart_data - BC current cart data.
 * @param {object} subscription_data -  Adapter subscription data in vuex format.
 * @returns {object} RC checkout payload.
 */
function createPayload(bc_cart_data, subscription_data) {
    console.warn(
        `RCAInterface.checkout.createPayload is deprecated and will be removed on
        September 01, 2021. Use RCAInterface.checkout.submit`
    );
    const cartHelper = cart.helper();
    cartHelper.cartData = bc_cart_data;
    cartHelper.subscriptionData = subscription_data;
    return cartHelper.createRechargeCheckout();
}

/**
 * DEPRECATED  todo Remove this function after September 01, 2021
 * Creates a RC checkout payload and submits to RC via a form.
 *
 * @param {object} cart_data - A specific BC cart object as returned from the Storefront API.
 * @returns {Promise<boolean>} Whether the form has been submitted.
 */
async function performCheckout(cart_data = null) {
    console.warn(
        `RCAInterface.checkout.performCheckout is deprecated and will be removed on
        September 01, 2021. Use RCAInterface.checkout.submit`
    );

    const opts = {
        store: store,
        computed: { ...mapGetters(["currentSubData"]) },
        propsData: {
            cart: cart_data,
            submitOnMount: true,
            domain: interfaceConfig("rechargeDomain"),
        },
    };
    const vm = makeVM(RechargeCheckoutForm, opts);
    vm.$mount();
}

/**
 * @param {string} rechargeDomain The Domain of a store.
 * @param {string} checkoutUrl The url of a store.
 */
function submit(rechargeDomain, checkoutUrl) {
    const cartHelper = cart.helper(rechargeDomain, checkoutUrl);
    cartHelper.getRechargeCheckout().then((cart) => {
        const client = makeVM(RechargeCheckoutForm, {
            propsData: {
                baseUrl: cartHelper.recharge.checkout.url,
                cart,
                domain: rechargeDomain,
                submitOnMount: true,
            },
        });
        client.$mount();
    });
}

export default {
    createPayload: createPayload,
    performCheckout: performCheckout,
    submit,
};
