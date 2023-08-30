import { mount } from "@vue/test-utils";
import RadioFormType from "@/core/vue/components/SubscriptionForm/FormComponents/RadioFormType.vue";

//mock props sent to component

describe("RadioFormType", () => {
    // Turn off console.log, console.error and console.debug messages
    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(jest.fn());
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        jest.spyOn(console, "debug").mockImplementation(jest.fn());
        jest.spyOn(console, "warn").mockImplementation(jest.fn());
    });

    beforeEach(() => {
        mockProps = {
            value: "onetime",
            firstOption: "autodeliver",
            subscriptionType: "subscription_and_onetime",
            subscriptionMsg: "Subscribe & Save",
            onetimeMsg: "One-time purchase",
        };
    });

    afterEach(() => {
        mockProps = undefined;
    });

    let mockProps;

    it("should return the subscription information as first if firstOption is autodeliver", function () {
        let wrapper = mount(RadioFormType, {
            propsData: { ...mockProps, firstOption: "autodeliver" },
        });
        expect(wrapper.vm.optionProps.first.inputClass).toEqual(
            `rca-subscription-form__radio--subscription`
        );
        expect(wrapper.vm.optionProps.second.inputClass).toEqual(
            `rca-subscription-form__radio--otp`
        );
    });

    it("should return the onetime information as first if firstOption is onetime", function () {
        let wrapper = mount(RadioFormType, {
            propsData: { ...mockProps, firstOption: "onetime" },
        });
        expect(wrapper.vm.optionProps.first.inputClass).toEqual(
            `rca-subscription-form__radio--otp`
        );
        expect(wrapper.vm.optionProps.second.inputClass).toEqual(
            `rca-subscription-form__radio--subscription`
        );
    });

    it("should return true if the subscription type is subscription_and_onetime", function () {
        let wrapper = mount(RadioFormType, {
            propsData: { ...mockProps, subscriptionType: "subscription_and_onetime" },
        });
        expect(wrapper.vm.showSubscription).toBe(true);
    });

    it("should return false if the subscription type is subscription_only", function () {
        let wrapper = mount(RadioFormType, {
            propsData: { ...mockProps, subscriptionType: "subscription_only" },
        });
        expect(wrapper.vm.showSubscription).toBe(false);
    });

    it("should return false if the subscription type is onetime_only", function () {
        let wrapper = mount(RadioFormType, {
            propsData: { ...mockProps, subscriptionType: "onetime_only" },
        });
        expect(wrapper.vm.showSubscription).toBe(false);
    });
});
