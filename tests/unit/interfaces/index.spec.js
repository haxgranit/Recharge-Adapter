import {
    RCAInterface,
    AdapterInterface,
    AdapterSettingsInterface,
    BigcommerceInterface,
    CartInterface,
    CheckoutInterface,
    InterfaceUtils,
    RechargeInterface,
    SubscriptionInterface,
} from "../../../src/core/interfaces";

describe("Core Interfaces", () => {
    it("should import RCAInterface", () => {
        expect(RCAInterface).not.toBeUndefined();
        expect(RCAInterface.account).not.toBeUndefined();
        expect(RCAInterface.adapter).not.toBeUndefined();
        expect(RCAInterface.cart).not.toBeUndefined();
        expect(RCAInterface.checkout).not.toBeUndefined();
        expect(RCAInterface.subscription).not.toBeUndefined();
        expect(RCAInterface.bigcommerce).not.toBeUndefined();
        expect(RCAInterface.localeMessages).not.toBeUndefined();
        expect(RCAInterface.settings).not.toBeUndefined();
        expect(RCAInterface.recharge).not.toBeUndefined();
        expect(RCAInterface.tools).not.toBeUndefined();
        expect(RCAInterface.currency).not.toBeUndefined();
        expect(RCAInterface.config).not.toBeUndefined();
        expect(RCAInterface.config.rechargeDomain).not.toBeUndefined();
        expect(RCAInterface.config.checkoutUrl).not.toBeUndefined();
        expect(RCAInterface.utils).not.toBeUndefined();
    });

    it("should import AdapterInterface", () => {
        expect(AdapterInterface).not.toBeUndefined();
        expect(AdapterInterface.getAdapterBackendSettings).not.toBeUndefined();
    });

    it("should import AdapterSettingsInterface", () => {
        expect(AdapterSettingsInterface).not.toBeUndefined();
        expect(AdapterSettingsInterface.adapterSettings).not.toBeUndefined();
    });

    it("should import BigcommerceInterface", () => {
        expect(BigcommerceInterface).not.toBeUndefined();
        expect(BigcommerceInterface.convertWordpressCart).not.toBeUndefined();
        expect(BigcommerceInterface.getWordpressCurrentCart).not.toBeUndefined();
        expect(BigcommerceInterface.customer).not.toBeUndefined();
    });

    it("should import CartInterface", () => {
        expect(CartInterface).not.toBeUndefined();
        expect(CartInterface.cartTotal).not.toBeUndefined();
        expect(CartInterface.itemPrice).not.toBeUndefined();
        expect(CartInterface.hasSubscription).not.toBeUndefined();
        expect(CartInterface.helper).not.toBeUndefined();
    });

    it("should import CartInterface", () => {
        expect(CheckoutInterface).not.toBeUndefined();
        expect(CheckoutInterface.createPayload).not.toBeUndefined();
        expect(CheckoutInterface.performCheckout).not.toBeUndefined();
        expect(CheckoutInterface.submit).not.toBeUndefined();
    });

    it("should import InterfaceUtils", () => {
        expect(InterfaceUtils).not.toBeUndefined();
        expect(InterfaceUtils.makeVM).not.toBeUndefined();
        expect(InterfaceUtils.makeStoreVM).not.toBeUndefined();
        expect(InterfaceUtils.snakeToCamel).not.toBeUndefined();
        expect(InterfaceUtils.interfaceConfig).not.toBeUndefined();
    });

    it("should import RechargeInterface", () => {
        expect(RechargeInterface).not.toBeUndefined();
        expect(RechargeInterface.getRechargeSettings).not.toBeUndefined();
        expect(RechargeInterface.getRechargeTempToken).not.toBeUndefined();
    });

    it("should import SubscriptionInterface", () => {
        expect(SubscriptionInterface).not.toBeUndefined();
        expect(SubscriptionInterface.addSubscription).not.toBeUndefined();
        expect(SubscriptionInterface.getSubscriptions).not.toBeUndefined();
        expect(SubscriptionInterface.updateSubscription).not.toBeUndefined();
        expect(SubscriptionInterface.removeSubscription).not.toBeUndefined();
        expect(SubscriptionInterface.addProductToSubscriptions).not.toBeUndefined();
        expect(SubscriptionInterface.currentSubscriptionData).not.toBeUndefined();
    });
});
