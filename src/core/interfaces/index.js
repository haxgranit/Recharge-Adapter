import AdapterInterface from "./adapter";
import CheckoutInterface from "./checkout";
import CartInterface from "./cart";
import SubscriptionInterface from "./subscription";
import BigcommerceInterface from "./bigcommerce";
import { i18n } from "@/core/vue/plugins";
import AdapterSettingsInterface from "./settings";
import RechargeInterface from "./recharge";
import Tools from "./tools";
import account from "./account_interface";
import { Currency } from "@/core/vue/mixins/currency-helper";
import { camelToSnake, snakeToCamel } from "./camel_snake_keys";
import InterfaceUtils from "./interface_utils";

export const RCAInterface = {
    account,
    adapter: AdapterInterface,
    cart: CartInterface,
    checkout: CheckoutInterface,
    subscription: SubscriptionInterface,
    bigcommerce: BigcommerceInterface,
    localeMessages: () => i18n.messages,
    settings: AdapterSettingsInterface,
    recharge: RechargeInterface,
    tools: Tools,
    currency: Currency.constructor,
    config: {
        bigcommerceOrigin: null,
        rechargeDomain: window.bigcommerce_config?.store_domain || window.location.host,
        checkoutUrl: "https://checkout.rechargeapps.com/r/checkout",
    },
    utils: { camelToSnake, snakeToCamel },
};

export {
    AdapterInterface,
    AdapterSettingsInterface,
    BigcommerceInterface,
    CartInterface,
    CheckoutInterface,
    InterfaceUtils,
    RechargeInterface,
    SubscriptionInterface,
};

export const AccountInterface = account;
export const InterfaceTools = Tools;
export * from "./interface_utils";
