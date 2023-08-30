import { config } from "@vue/test-utils";
import storeMain from "@/core/vue/store/main.store.js";

config.showDeprecationWarnings = false;

describe("Main Store / Vuex", () => {
    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(jest.fn());
    });

    it("should be defined", () => {
        expect(storeMain).toBeDefined();
        expect(typeof storeMain).toBe("object");
    });

    describe("replace sub data", () => {
        it("should replace state.subdata with payload", () => {
            const payload = {
                cartid: "6148b1dc-dbf2-44ba-ba99-37254ed91749",
                line_item: "0675eb80-3145-4f9f-9646-e6a027f38e7c",
                shipping_unit: "week",
                shipping_frequency: 4,
                charge_frequency: 4,
                discount_type: "percentage",
                discount_amount: 15,
                storefront_purchase_options: "subscription_and_onetime",
                productID: 117,
                properties: {
                    bundle_id: "xfabcdefgh",
                },
            };

            storeMain.mutations.REPLACE_SUB_DATA(storeMain.state, payload);
            expect(storeMain.state.subdata).toEqual(payload);
        });
    });

    describe("add sub data", () => {
        it("should add state.subdata with payload", () => {
            const payload = {
                cartid: "xxxjsjsjjdjdj-dbf2-44ba-ba99-37254ed91749",
                line_item: "33xjsjsj333-3145-4f9f-9646-e6a027f38e7c",
                shipping_unit: "week",
                shipping_frequency: 4,
                charge_frequency: 4,
                discount_type: "percentage",
                discount_amount: 15,
                storefront_purchase_options: "subscription_and_onetime",
                productID: 113,
                properties: {
                    bundle_id: "cbcdeghklj",
                },
            };

            storeMain.state.subdata = [];
            storeMain.mutations.ADD_SUB_ITEM(storeMain.state, payload);
            expect(storeMain.state.subdata).toContainEqual(payload);
        });
    });

    describe("remove sub data", () => {
        it("should remove item with line_id from state.subdata", () => {
            let line_item = "33xjsjsj333-3145-4f9f-9646-e6a027f38e7c";
            const remove_item = [
                {
                    line_item: "33xjsjsj333-3145-4f9f-9646-e6a027f38e7c",
                    shipping_unit: "week",
                    shipping_frequency: 4,
                    charge_frequency: 4,
                    discount_type: "percentage",
                    discount_amount: 15,
                    storefront_purchase_options: "subscription_and_onetime",
                    productID: 113,
                    properties: {
                        bundle_id: "asdfadsfgh",
                    },
                },
            ];

            storeMain.mutations.REMOVE_SUB_ITEM(storeMain.state, line_item);
            expect(storeMain.state).toEqual(expect.not.arrayContaining(remove_item));
        });
    });
});

//reference for implementation : https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html#creating-the-mutation
