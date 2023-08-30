import {
    Clone,
    RechargeCheckoutForm,
    Redirect,
    Teleport,
    SubscriptionForm,
    PrepaidSubscription,
} from "../../../../src/core/vue/components";

describe("Core Vue - Components", () => {
    it("should import Clone", () => {
        expect(Clone).not.toBeUndefined();
    });

    it("should import RechargeCheckoutForm", () => {
        expect(RechargeCheckoutForm).not.toBeUndefined();
    });

    it("should import Redirect", () => {
        expect(Redirect).not.toBeUndefined();
    });

    it("should import Teleport", () => {
        expect(Teleport).not.toBeUndefined();
    });

    it("should import SubscriptionForm", () => {
        expect(SubscriptionForm).not.toBeUndefined();
    });

    it("should import PrepaidSubscription", () => {
        expect(PrepaidSubscription).not.toBeUndefined();
    });
});
