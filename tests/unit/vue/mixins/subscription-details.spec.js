import { SubscriptionDetailsMixin } from "../../../../src/core/vue/mixins";
describe("SubscriptionDetailsMixin", () => {
    describe("displayIntervalText", () => {
        it.each([
            [
                "should add an extra s to the unit if frequency greater than 1",
                {
                    unit: "month",
                    frequency: 3,
                    expected: "months",
                },
            ],
            [
                "should leave the unit name as is when unit ends in s and frequency greather than 1",
                {
                    unit: "months",
                    frequency: 3,
                    expected: "months",
                },
            ],
            [
                "should leave unit name as is when frequency is equal to 1",
                {
                    unit: "month",
                    frequency: 1,
                    expected: "month",
                },
            ],
        ])("%s", ({ unit, frequency, expected }) => {
            expect(SubscriptionDetailsMixin.methods.displayIntervalText(unit, frequency)).toEqual(
                expected
            );
        });
    });
    describe("isPrepaidSubscriptionOptions", () => {
        const mockSubscriptionOptions = {
            order_interval_frequency_options: ["1"],
            charge_interval_frequency: 2,
            order_interval_unit: "day",
            charge_frequency: 30,
            discount_type: "percentage",
            discount_amount: 30,
            storefront_purchase_options: "subscription_only",
        };
        it.each([
            ["Subscription Only Prepaid should return true", { subOptions: {}, expected: true }],
            [
                "Subscription and Onetime should return false",
                {
                    subOptions: { storefront_purchase_options: "subscription_and_onetime" },
                    expected: false,
                },
            ],
            [
                "Multiple order interval frequency options should return false",
                {
                    subOptions: { order_interval_frequency_options: ["1", "3"] },
                    expected: false,
                },
            ],
            [
                "Undefined charge interval frequency should return false",
                {
                    subOptions: { charge_interval_frequency: undefined },
                    expected: false,
                },
            ],
            [
                "Subscription charge interval isn't divisible by order interval should return false",
                {
                    subOptions: {
                        order_interval_frequency_options: ["3"],
                        charge_interval_frequency: 4,
                    },
                    expected: false,
                },
            ],
        ])("%s", (n, { expected, subOptions }) => {
            const options = { ...mockSubscriptionOptions, ...subOptions };
            const result = SubscriptionDetailsMixin.methods.isPrepaidSubscriptionOptions(options);
            expect(result).toBe(expected);
        });
    });

    describe("hideForSubscription", () => {
        it.todo(
            "Should add the rca-hide-element to rca-shipping-label if the cart is a recharge cart"
        );
        it.todo("Should not add the rca-hide-element if cart is not a recharge cart");
        it.todo(
            "Should add the rca-hide-element to rca-cart-coupon if settings.backend.display_and_handoff_coupons is set to FALSE and cart is a recharge cart"
        );
        it.todo(
            "Should add the rca-hide-element to rca-hide-subscription if settings.backend.use_bc_discounts is FALSE and cart is recharge cart"
        );
    });
});
