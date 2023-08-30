describe("interfaces", () => {
    it.todo("interface mount");
});

// import Vue from "frontend";
// import axios from "axios";
// import lodash from "lodash";
// import interfaces from "@/interfaces";
// import Logger from "@/plugins/logger";

// process.env.RECHARGE_CHECKOUT_URL = "https://checkout.rechargeapps.com";
// const mock_cart_data = JSON.parse(
//     '[{ "id": "c3b3946e-0989-4aef-a131-e60f1e9ed50c", "customerId": 0, "email": "", "currency": { "name": "Australian Dollar", "code": "AUD", "symbol": "AUD $", "decimalPlaces": 2 }, "isTaxIncluded": false, "baseAmount": 222.86, "discountAmount": 0, "cartAmount": 222.86, "coupons": [], "discounts": [{ "id": "4904a932-b924-4356-8086-82ab7f250ed5", "discountedAmount": 0 }, { "id": "c5f52193-8894-48da-a2e2-e41a1bccd840", "discountedAmount": 0 }], "lineItems": { "physicalItems": [{ "id": "4904a932-b924-4356-8086-82ab7f250ed5", "parentId": null, "variantId": 267, "productId": 154, "sku": "THX-123", "name": "Black Shirt - Test modifiers", "url": "https://tmifitness.mybigcommerce.com/black-shirt-test-modifiers/", "quantity": 1, "brand": "Common Good", "isTaxable": true, "imageUrl": "https://cdn11.bigcommerce.com/s-gy68868uk5/products/154/images/380/crna__01390.1596734317.220.290.png?c=1", "discounts": [], "discountAmount": 0, "couponAmount": 0, "listPrice": 221.86, "salePrice": 244.05, "extendedListPrice": 221.86, "extendedSalePrice": 244.05, "isShippingRequired": true, "type": "physical", "giftWrapping": null, "isMutable": true, "options": [{ "name": "Date Picker", "nameId": 145, "value": "May 2nd 2021", "valueId": 1619931600 }, { "name": "Pick List", "nameId": 146, "value": "Digital Product debugCartSalePrice", "valueId": 186 }, { "name": "Include Insurance?", "nameId": 147, "value": "", "valueId": 187 }, { "name": "ModifierDropdown", "nameId": 148, "value": "10", "valueId": 191 }, { "name": "Custom Message", "nameId": 155, "value": "La la la", "valueId": null }] }, { "id": "c5f52193-8894-48da-a2e2-e41a1bccd840", "parentId": null, "variantId": 146, "productId": 123, "sku": "IND3", "name": "Indica2", "url": "https://tmifitness.mybigcommerce.com/indica/", "quantity": 1, "brand": "", "isTaxable": true, "imageUrl": "https://cdn11.bigcommerce.com/s-gy68868uk5/products/123/images/377/cannabis_indica__10042.1591035570.220.290.jpg?c=1", "discounts": [], "discountAmount": 0, "couponAmount": 0, "listPrice": 1, "salePrice": 1.1, "extendedListPrice": 1, "extendedSalePrice": 1.1, "isShippingRequired": true, "type": "physical", "giftWrapping": null, "isMutable": true, "options": [] }], "digitalItems": [], "giftCertificates": [], "customItems": [] }, "createdTime": "2020-08-17T17:45:54+00:00", "updatedTime": "2020-08-17T19:36:43+00:00" }]'
// );
// const mock_product_data = JSON.parse(
//     '[{"id": 154, "weight": 0, "variants": [{"id": 267, "weight": null, "tax_code": null, "tax_class_id": ""}], "discounts": [], "subscriptions": [], "tax_code": ""}, {"id": 123, "weight": 0, "variants": [{"id": 146, "weight": null, "tax_code": null, "tax_class_id": ""}], "discounts": [], "subscriptions": [], "tax_code": ""}]'
// );
// const mock_store_data = JSON.parse('{"weight_units": "Grams"}');

// jest.mock("axios", () => ({
//     get: jest.fn((url) => {
//         if (
//             url.endsWith(
//                 "/api/storefront/carts?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options"
//             )
//         ) {
//             return Promise.resolve({
//                 data: mock_cart_data,
//             });
//         }
//         return Promise.reject("mock not found");
//     }),
// }));

// jest.mock("../../src/store/main.store", () => ({
//     namespaced: false,
//     state: {
//         cartid: "c3b3946e-0989-4aef-a131-e60f1e9ed50c",
//         subdata: [
//             {
//                 cartid: "c3b3946e-0989-4aef-a131-e60f1e9ed50c",
//                 line_item: "4904a932-b924-4356-8086-82ab7f250ed5",
//                 shipping_unit: "day",
//                 shipping_frequency: "3",
//                 charge_frequency: 3,
//                 discount_type: "percentage",
//                 discount_amount: 15,
//             },
//         ],
//     },
//     getters: {
//         subData: (state) => {
//             return state.subdata;
//         },
//         currentSubData: (state) => {
//             return state.subdata.filter((item) => item.cartid === state.cartid);
//         },
//         cartID: (state) => {
//             return state.cartid;
//         },
//     },
//     mutations: {
//         ADD_SUB_ITEM: (state, payload) => {
//             //delete existing matching sub
//             let found = false;
//             for (let i = 0; i < state.subdata.length; i++) {
//                 if (state.subdata[i].cartid === payload.cartid) {
//                     if (state.subdata[i].line_item === payload.line_item) {
//                         found = true;
//                         state.subdata.splice(i, 1, payload);
//                         break;
//                     }
//                 }
//             }
//             if (!found) {
//                 state.subdata.push(payload);
//             }
//             if (state.cartid !== payload.cartid) {
//                 state.cartid = payload.cartid;
//             }
//         },
//     },
//     actions: {
//         addSubItem: ({ commit }, subscription) => {
//             return new Promise((resolve, reject) => {
//                 if (subscription.line_item && subscription.cartid) {
//                     commit("ADD_SUB_ITEM", subscription);
//                     resolve();
//                 } else {
//                     reject("Missing line_item or cartid.");
//                 }
//             });
//         },
//     },
// }));

// Vue.prototype.$axios = axios;
// Vue.prototype.$logger = {
//     /**
//      * @param msg
//      */
//     log: function (msg) {
//         console.log(msg);
//     },
//     /**
//      * @param msg
//      */
//     debug: function (msg) {
//         console.debug(msg);
//     },
//     /**
//      * @param msg
//      */
//     warn: function (msg) {
//         console.warn(msg);
//     },
//     /**
//      * @param msg
//      */
//     error: function (msg) {
//         console.error(msg);
//     },
//     /**
//      * @param msg
//      */
//     fatal: function (msg) {
//         console.error(msg);
//     },
// };
// Vue.prototype.$_ = lodash;
// Vue.prototype.$store_data = {
//     getProductByBCProductID: (product_id) => {
//         for (let i = 0; i < mock_product_data.length; i++) {
//             if (parseInt(mock_product_data[i].id) === product_id) {
//                 return mock_product_data[i];
//             }
//         }
//         return null;
//     },
//     /**
//      *
//      */
//     getStoreWeightUnits() {
//         return mock_store_data.weight_units;
//     },
//     /**
//      *
//      */
//     getStoreDomain() {
//         return mock_store_data.rc_domain;
//     },
//     // TODO remove with temporary FAB settings
//     /**
//      *
//      */
//     getStoreHash() {
//         return "tempvalue";
//     },
// };

// let spy_console_warn, spy_console_error;

// describe("interfaces", () => {
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe("cart", () => {
//         beforeEach(() => {
//             spy_console_warn = jest.spyOn(global.console, "warn");
//             spy_console_error = jest.spyOn(global.console, "error");
//         });
//         afterEach(() => {
//             expect(spy_console_warn).not.toHaveBeenCalled();
//             expect(spy_console_error).not.toHaveBeenCalled();
//         });

//         // describe("getCurrentCart", () => {
//         //     it("resolves cart data", async () => {
//         //         await expect(interfaces.cart.getCurrentCart(axios)).resolves.toEqual(mock_cart_data[0]);
//         //     });
//         // });

//         describe("hasSubscription", () => {
//             it("finds subscription", async () => {
//                 try {
//                     const result = await interfaces.cart.hasSubscription();
//                     expect(result).toBe(true);
//                 } catch (error) {
//                     throw error;
//                 }
//             });
//         });
//     });

//     describe("checkout", () => {
//         beforeEach(() => {
//             spy_console_warn = jest.spyOn(global.console, "warn");
//             spy_console_error = jest.spyOn(global.console, "error");
//         });
//         describe("performCheckout", () => {
//             it("does not produce error", async () => {
//                 global.console.error = jest.fn();
//                 await interfaces.checkout.performCheckout();
//                 // suppress discount type not supported warnings
//                 let number_warnings = spy_console_warn.mock.calls.filter(
//                     (msg) => msg[0] !== "Discount type not supported: "
//                 ).length;
//                 // Expected to throw HTMLFormElement.prototype.submit error
//                 let number_errors = spy_console_error.mock.calls.filter(
//                     (msg) => msg[0].indexOf("HTMLFormElement.prototype.submit") === -1
//                 ).length;
//                 expect(number_warnings).toBe(0);
//                 expect(number_errors).toBe(0);
//                 global.console.error = console.error;
//             });
//         });
//     });

//     describe("subscription", () => {
//         beforeEach(() => {
//             spy_console_warn = jest.spyOn(global.console, "warn");
//             spy_console_error = jest.spyOn(global.console, "error");
//         });
//         afterEach(() => {
//             expect(spy_console_warn).not.toHaveBeenCalled();
//             expect(spy_console_error).not.toHaveBeenCalled();
//         });

//         describe("addSubscription", () => {
//             it("adds subscription", async () => {
//                 const subscription_data = {
//                     line_item: "789-tyjkj-0123",
//                     unit: null,
//                     frequency: null,
//                     cartid: "c3b3946e-0989-4aef-a131-e60f1e9ed50c",
//                     discount_type: null,
//                     discount_amount: null,
//                 };
//                 const sub_result = await interfaces.subscription.addSubscription(subscription_data);
//                 let number_warnings = spy_console_warn.mock.calls.filter(
//                     (msg) => msg[0] !== "Discount type not supported: "
//                 ).length;
//                 expect(number_warnings).toBe(0);
//                 return expect(sub_result).toBeTruthy();
//             });
//         });
//     });
// });
