describe("Subscription", () => {
    it.todo("component mounts");
});
// import { shallowMount, createLocalVue } from "@frontend/test-utils";
// import Vuex from "vuex";
// import CustomClasses from "@/plugins/custom_classes"
// import Logger from "../../src/plugins/logger";
// import Subscription from "../../src/templates/Subscription.frontend";
// import storeMain from "../../src/store";
//
// jest.mock("@/libs/locales-loader", () => {
//     return {
//         keys: () => {
//             return [];
//         }
//     };
// });
//
// const localVue = createLocalVue();
// localVue.use(Vuex);
// localVue.use(CustomClasses);
// localVue.use(Logger, { useSentry: false, useLogDNA: false, useConsole: false });
//
// const mock_product_data = JSON.parse(
//     '[{"id": 123, "weight": 11, "variants": [{"id": 146, "weight": 11, "tax_code": "TEST-TAX-CODE-5", "tax_class_id": ""}], "discounts": [], "subscriptions": [{"discount_amount": 25.0, "discount_type": "percentage", "charge_interval_frequency": 30, "order_interval_unit": "day", "storefront_purchase_options": "subscription_and_onetime", "expire_after_specific_number_of_charges": null, "order_interval_frequency_options": ["1", "30", "60", "90"]}], "tax_code": "TEST-TAX-CODE-5"}]'
// );
//
// // mock store_data object for tests
// const mock_store_data = {
//     getSubscriptionsByBCProductID: product_id => {
//         for (let i = 0; i < mock_product_data.length; i++) {
//             if (parseInt(mock_product_data[i].id) === product_id) {
//                 return mock_product_data[i];
//             }
//         }
//         return null;
//     }
// };
//
// // mock custom classes
// const mock_custom_classes = {
//     groups: {},
//     classes: {}
// };
//
// describe("Subscription", () => {
//     it("component mounts", () => {
//         shallowMount(Subscription, {
//             localVue,
//             mocks: {
//                 $store_data: mock_store_data,
//                 $custom_classes: mock_custom_classes
//             },
//             propsData: { productID: 123, productPrice: 9.97 }
//         });
//     });
//
//     describe("saves subscription info", () => {
//         it("saves onetime", () => {
//             const mock_onetime = {
//                 cartid: "5fb858be-db45-4ad8-8dbe-ecb007be186b",
//                 line_item: "60dfb2c4-72f6-469f-a2d3-1801da15a9f4",
//                 discount_type: false,
//                 charge_frequency: null,
//                 discount_amount: null,
//                 shipping_frequency: null,
//                 shipping_unit: null
//             };
//
//             const wrapper = shallowMount(Subscription, {
//                 localVue,
//                 mocks: {
//                     $store: storeMain,
//                     $store_data: mock_store_data,
//                     $custom_classes: mock_custom_classes
//                 },
//                 propsData: { productID: 123, productPrice: 9.97 }
//             });
//
//             wrapper.setData({ selectedType: "onetime" });
//             wrapper.vm.saveSubscription(mock_onetime.cartid, mock_onetime.line_item);
//             expect(wrapper.vm.$store.getters.subData[0]).toEqual(mock_onetime);
//         });
//
//         it("saves subscription", () => {
//             const mock_elem_options_data = [
//                 {
//                     selectedFrequency: "30"
//                 }
//             ];
//             const mock_subs_options_data = [
//                 {
//                     order_interval_unit: "day",
//                     charge_interval_frequency: 30,
//                     discount_type: "percentage",
//                     discount_amount: 30
//                 }
//             ];
//             const mock_subs_data = {
//                 cartid: "5fb858be-db45-4ad8-8dbe-ecb007be186b",
//                 line_item: "60dfb2c4-72f6-469f-a2d3-1801da15a9f4",
//                 charge_frequency: mock_subs_options_data[0].charge_interval_frequency,
//                 discount_amount: mock_subs_options_data[0].discount_amount,
//                 discount_type: mock_subs_options_data[0].discount_type,
//                 shipping_unit: mock_subs_options_data[0].order_interval_unit,
//                 shipping_frequency: null
//             };
//
//             const wrapper = shallowMount(Subscription, {
//                 localVue,
//                 mocks: {
//                     $store: storeMain,
//                     $store_data: mock_store_data,
//                     $custom_classes: mock_custom_classes
//                 },
//                 propsData: { productID: 123, productPrice: 9.97 }
//             });
//
//             wrapper.setData({
//                 selectedType: "subscription",
//                 selectedFrequency: mock_elem_options_data.selectedFrequency,
//                 subscriptionOptions: mock_subs_options_data
//             });
//             wrapper.vm.saveSubscription(mock_subs_data.cartid, mock_subs_data.line_item);
//             expect(wrapper.vm.$store.getters.subData[0]).toEqual(mock_subs_data);
//         });
//     });
//
//     // TODO Adds subscription form
//     // TODO loads subscription data on mount
// });
