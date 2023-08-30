describe("bc-cart mixin", () => {
    it.todo("mixin mounts");
});
// import BCCart from "../../src/mixins/bc-cart";
// import { shallowMount, createLocalVue } from "@frontend/test-utils";
// import axios from "axios";
// import lodash from "lodash";
//
// const localVue = createLocalVue();
// localVue.mixin(BCCart);
// const mock_cart_data = JSON.parse(
//     '[{ "id": "c3b3946e-0989-4aef-a131-e60f1e9ed50c", "customerId": 0, "email": "", "currency": { "name": "Australian Dollar", "code": "AUD", "symbol": "AUD $", "decimalPlaces": 2 }, "isTaxIncluded": false, "baseAmount": 222.86, "discountAmount": 0, "cartAmount": 222.86, "coupons": [], "discounts": [{ "id": "4904a932-b924-4356-8086-82ab7f250ed5", "discountedAmount": 0 }, { "id": "c5f52193-8894-48da-a2e2-e41a1bccd840", "discountedAmount": 0 }], "lineItems": { "physicalItems": [{ "id": "4904a932-b924-4356-8086-82ab7f250ed5", "parentId": null, "variantId": 267, "productId": 154, "sku": "THX-123", "name": "Black Shirt - Test modifiers", "url": "https://tmifitness.mybigcommerce.com/black-shirt-test-modifiers/", "quantity": 1, "brand": "Common Good", "isTaxable": true, "imageUrl": "https://cdn11.bigcommerce.com/s-gy68868uk5/products/154/images/380/crna__01390.1596734317.220.290.png?c=1", "discounts": [], "discountAmount": 0, "couponAmount": 0, "listPrice": 221.86, "salePrice": 244.05, "extendedListPrice": 221.86, "extendedSalePrice": 244.05, "isShippingRequired": true, "type": "physical", "giftWrapping": null, "isMutable": true, "options": [{ "name": "Date Picker", "nameId": 145, "value": "May 2nd 2021", "valueId": 1619931600 }, { "name": "Pick List", "nameId": 146, "value": "Digital Product debugCartSalePrice", "valueId": 186 }, { "name": "Include Insurance?", "nameId": 147, "value": "", "valueId": 187 }, { "name": "ModifierDropdown", "nameId": 148, "value": "10", "valueId": 191 }, { "name": "Custom Message", "nameId": 155, "value": "La la la", "valueId": null }] }, { "id": "c5f52193-8894-48da-a2e2-e41a1bccd840", "parentId": null, "variantId": 146, "productId": 123, "sku": "IND3", "name": "Indica2", "url": "https://tmifitness.mybigcommerce.com/indica/", "quantity": 1, "brand": "", "isTaxable": true, "imageUrl": "https://cdn11.bigcommerce.com/s-gy68868uk5/products/123/images/377/cannabis_indica__10042.1591035570.220.290.jpg?c=1", "discounts": [], "discountAmount": 0, "couponAmount": 0, "listPrice": 1, "salePrice": 1.1, "extendedListPrice": 1, "extendedSalePrice": 1.1, "isShippingRequired": true, "type": "physical", "giftWrapping": null, "isMutable": true, "options": [] }], "digitalItems": [{ "id": "b74afaf4-077c-455b-8503-01115ee221d5", "parentId": "4904a932-b924-4356-8086-82ab7f250ed5", "variantId": 165, "productId": 139, "sku": "", "name": "Digital Product debugCartSalePrice", "url": "https://tmifitness.mybigcommerce.com/digital-product-debugcartsaleprice/", "quantity": 1, "brand": "Common Good", "isTaxable": true, "imageUrl": "https://cdn11.bigcommerce.com/r-7f3397d2ae83e8b48dd889540b7b618246f07f43/themes/ClassicNext/images/ProductDefault.gif", "discounts": [], "discountAmount": 0, "couponAmount": 0, "listPrice": 0, "salePrice": 0, "extendedListPrice": 0, "extendedSalePrice": 0, "isShippingRequired": false, "type": "digital", "isMutable": false, "options": [] }], "giftCertificates": [], "customItems": [] }, "createdTime": "2020-08-17T17:45:54+00:00", "updatedTime": "2020-08-17T19:36:43+00:00" }]'
// );
//
// //mock axios storefront call
// jest.mock("axios", () => ({
//     get: jest.fn(url => {
//         if (
//             url.endsWith(
//                 "/api/storefront/carts?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options"
//             )
//         ) {
//             return Promise.resolve({
//                 data: mock_cart_data
//             });
//         } else {
//             return Promise.reject("mock not found");
//         }
//     })
// }));
//
// describe("bc-cart mixin", () => {
//     test("resolves and getting the expected data", async () => {
//         const wrapper = shallowMount(BCCart, {
//             localVue,
//             mocks: {
//                 $axios: axios,
//                 $_: lodash
//             },
//             mixins: [BCCart],
//             render(createElement) {
//                 return createElement("div");
//             }
//         });
//         await expect(wrapper.vm.getCartResponse()).resolves.toEqual({ data: mock_cart_data });
//     });
// });
