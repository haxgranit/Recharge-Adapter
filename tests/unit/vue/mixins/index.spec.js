import {
    CurrencyMixin,
    Currency,
    LocalizeMixin,
    MutationsCheckerMixin,
    PricingMixin,
    PricingHelper,
    SubscriptionDetailsMixin,
    CustomerMixin,
} from "../../../../src/core/vue/mixins";

describe("Core Vue - Mixins", () => {
    it("should import CurrencyMixin", () => {
        expect(CurrencyMixin).not.toBeUndefined();
    });

    it("should import Currency", () => {
        expect(Currency).not.toBeUndefined();
    });

    it("should import LocalizeMixin", () => {
        expect(LocalizeMixin).not.toBeUndefined();
    });

    it("should import MutationsCheckerMixin", () => {
        expect(MutationsCheckerMixin).not.toBeUndefined();
    });

    it("should import PricingMixin", () => {
        expect(PricingMixin).not.toBeUndefined();
    });

    it("should import PricingHelper", () => {
        expect(PricingHelper).not.toBeUndefined();
    });

    it("should import SubscriptionDetailsMixin", () => {
        expect(SubscriptionDetailsMixin).not.toBeUndefined();
    });

    it("should import CustomerMixin", () => {
        expect(CustomerMixin).not.toBeUndefined();
    });
});
