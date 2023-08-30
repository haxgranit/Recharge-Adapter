import Zachs_store from "../data/zachs_store/zachs_store";

export const defaultStoreObjectsData = Zachs_store.storeObjectsData;
export const defaultStoreData = Zachs_store.RCA_DATA;
/**
 * @param root0
 * @param root0.currentSubData
 * @param root0.productData
 * @param root0.rechargeDomain
 * @param root0.storeObjectData
 * @param root0.weightUnits
 * @param root0.themeObjectData
 * @param root0.allCheckoutsOnRecharge
 * @param root0.currencySettings
 * @param root0.checkoutData
 */
export function mockBigcommerceHelper({
    currentSubData = [],
    productData = [],
    rechargeDomain = null,
    weightUnits = defaultStoreData.RCA_STORE_DATA.weight_units,
    themeObjectData = defaultStoreObjectsData,
    allCheckoutsOnRecharge = true,
    currencySettings = Zachs_store.currencySettings,
    checkoutData = Zachs_store.checkouts.withSubscription,
} = {}) {
    /**
     *
     */
    const original = jest.requireActual("@/bigcommerce/utils/bigcommerce-helper.js");
    const cart = new original.BigcommerceCart({
        subscriptionDataGetter: () => currentSubData,
        rcaProductData: productData,
        domain: rechargeDomain || window.location.hostname,
        subscriptionCheckoutURL: "https://checkout.rechargeapps.com/r/checkout",
        weightUnits,
        themeObjectData,
        allCheckoutsOnRecharge,
        currencySettings,
    });
    /**
     *
     */
    cart.getCheckoutData = async function () {
        this.checkoutData = checkoutData;
        return this;
    };

    return {
        BigcommerceCart: () => cart,
        BigcommerceCustomer: original.BigcommerceCustomer,
    };
}
