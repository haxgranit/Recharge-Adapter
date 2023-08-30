import { config } from "@vue/test-utils";
import RechargeCheckoutForm from "@/core/vue/components/RechargeCheckoutForm.vue";

config.showDeprecationWarnings = false;

const vueSpy = jest.fn();
const utilsSpy = {
    AppVue: jest.fn(),
    initVueOptions: jest.fn(),
};

jest.doMock("vue", () => vueSpy);
jest.doMock("@/core/utils", () => utilsSpy);

describe("RechargeCheckoutForm", () => {
    // Turn off console.log, console.error and console.debug messages
    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(jest.fn());
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        jest.spyOn(console, "debug").mockImplementation(jest.fn());
        jest.spyOn(console, "warn").mockImplementation(jest.fn());
    });

    it("should be defined", () => {
        expect(RechargeCheckoutForm).toBeDefined();
        expect(typeof RechargeCheckoutForm).toBe("object");
    });

    describe("isPrefillCheckout", () => {
        it("should return FALSE if prefill_checkout_from from RCA_SETTINGS.pages.checkout.prefill_checkout_form is FALSE", () => {
            const localThis = {
                $store: {
                    getters: {
                        settings: {
                            pages: {
                                checkout: {
                                    prefill_checkout_form: false,
                                },
                            },
                        },
                    },
                },
            };

            expect(RechargeCheckoutForm.computed.isPrefillCheckout.call(localThis)).toBe(false);
        });

        it("should return TRUE if prefill_checkout_from from RCA_SETTINGS.pages.checkout.prefill_checkout_form is TRUE", () => {
            const localThis = {
                $store: {
                    getters: {
                        settings: {
                            pages: {
                                checkout: {
                                    prefill_checkout_form: true,
                                },
                            },
                        },
                    },
                },
            };
            expect(RechargeCheckoutForm.computed.isPrefillCheckout.call(localThis)).toBe(true);
        });
    });

    describe("customerInfo ", () => {
        it("should handle no customer object in this.$store_objects", () => {
            const thisArg = {
                $store_objects: {},
            };

            const expected = {
                email: "",
                province: "",
            };

            expect(RechargeCheckoutForm.computed.customerInfo.call(thisArg)).toEqual(expected);
        });

        it("should handle empty address object", () => {
            const thisArg = {
                $store_objects: {
                    customer: {
                        address: {},
                        email: "",
                        state: "",
                    },
                },
            };

            const expected = {
                email: "",
                province: "",
            };

            expect(RechargeCheckoutForm.computed.customerInfo.call(thisArg)).toEqual(expected);
        });

        it("should handle no state", () => {
            const thisArg = {
                $store_objects: {
                    customer: {
                        address: {
                            address1: "mock home ",
                            address2: "apt something",
                            city: "mock city",
                            company: "Test",
                            first_name: "mock first name",
                            last_name: "mock last name",
                            phone: "510 294 9234",
                            zip: "94522",
                        },
                        email: "test@test.com",
                    },
                },
            };

            const expected = {
                address1: "mock home ",
                address2: "apt something",
                city: "mock city",
                company: "Test",
                first_name: "mock first name",
                last_name: "mock last name",
                phone: "510 294 9234",
                zip: "94522",
                email: "test@test.com",
                province: "",
            };
            expect(RechargeCheckoutForm.computed.customerInfo.call(thisArg)).toEqual(expected);
        });

        it("should handle no email", () => {
            const thisArg = {
                $store_objects: {
                    customer: {
                        address: {
                            address1: "mock home ",
                            address2: "apt something",
                            city: "mock city",
                            company: "Test",
                            first_name: "mock first name",
                            last_name: "mock last name",
                            phone: "510 294 9234",
                            zip: "94522",
                        },
                    },
                },
            };

            const expected = {
                address1: "mock home ",
                address2: "apt something",
                city: "mock city",
                company: "Test",
                first_name: "mock first name",
                last_name: "mock last name",
                phone: "510 294 9234",
                zip: "94522",
                email: "",
                province: "",
            };
            expect(RechargeCheckoutForm.computed.customerInfo.call(thisArg)).toEqual(expected);
        });

        it("should return proper customer_data based on address object", () => {
            const thisArg = {
                $store_objects: {
                    customer: {
                        address: {
                            address1: "mock home ",
                            address2: "apt something",
                            city: "mock city",
                            company: "Test",
                            country: "United States",
                            country_id: "226",
                            destination: "residential",
                            first_name: "mock first name",
                            form_session_id: "0",
                            id: "1",
                            last_name: "mock last name",
                            last_used: "0",
                            phone: "510 294 9234",
                            state: "California",
                            state_id: "0",
                            zip: "94522",
                        },
                        email: "test@test.com",
                    },
                },
            };

            const expected = {
                address1: "mock home ",
                address2: "apt something",
                city: "mock city",
                company: "Test",
                country: "United States",
                country_id: "226",
                destination: "residential",
                first_name: "mock first name",
                form_session_id: "0",
                id: "1",
                last_name: "mock last name",
                last_used: "0",
                phone: "510 294 9234",
                state: "California",
                state_id: "0",
                zip: "94522",
                email: "test@test.com",
                province: "California",
            };

            expect(RechargeCheckoutForm.computed.customerInfo.call(thisArg)).toEqual(expected);
        });
    });
});
