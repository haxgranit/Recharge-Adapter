describe("Pricing Mixin", () => {
    it.todo("mixin mounts");
});
// import Pricing from "@/mixins/pricing";
// import {createLocalVue, mount} from "@frontend/test-utils";
//
// const localVue = createLocalVue()
// localVue.mixin(Pricing)
//
// describe('Pricing Mixin', () => {
//     let spy_console_warn;
//     let spy_console_error;
//     let wrapper;
//
//     beforeEach(() => {
//         spy_console_warn = jest.spyOn(global.console, 'warn');
//         spy_console_error = jest.spyOn(global.console, 'error');
//         wrapper = mount(Pricing, {
//             localVue,
//             mixins: [Pricing],
//             render(createElement) {
//                 return createElement('div');
//             }
//         });
//     });
//
//     afterEach(() => {
//         expect(spy_console_warn).not.toHaveBeenCalled();
//         expect(spy_console_error).not.toHaveBeenCalled();
//     });
//
//
//     describe('calculateLinePrice', () => {
//         describe('Single Quantity', () => {
//             it('fixed amount', () => {
//                 const expected_results = [
//                     {input: {discount_amount: 5, item_price: 1.49}, output: 0},
//                     {input: {discount_amount: 4.97, item_price: 10.15}, output: 5.18},
//                     {input: {discount_amount: 4.9765, item_price: 10.15}, output: 5.17}
//                 ];
//
//                 for (const expected_result of expected_results) {
//                     expect(wrapper.vm.calculateLinePrice(
//                         "fixed_amount", expected_result.input.discount_amount, expected_result.input.item_price, 1
//                     )).toBe(expected_result.output);
//                 }
//             });
//
//             it('percentage', () => {
//                 const expected_results = [
//                     {input: {discount_amount: 150, item_price: 1.49}, output: 0},
//                     {input: {discount_amount: 15, item_price: 1.49}, output: 1.27},
//                     {input: {discount_amount: 14, item_price: 1.49}, output: 1.28},
//                 ];
//
//                 for (const expected_result of expected_results) {
//                     expect(wrapper.vm.calculateLinePrice(
//                         "percentage", expected_result.input.discount_amount, expected_result.input.item_price, 1
//                     )).toBe(expected_result.output);
//                 }
//             });
//         });
//
//         describe('Multiple Quantity', () => {
//             it('fixed amount', () => {
//                 const expected_results = [
//                     {input: {discount_amount: 5, item_price: 1.49, quantity: 3}, output: 0},
//                     {input: {discount_amount: 4.97, item_price: 10.15, quantity: 3}, output: 15.54},
//                     {input: {discount_amount: 4.9765, item_price: 10.15, quantity: 3}, output: 15.51}
//                 ];
//
//                 for (const expected_result of expected_results) {
//                     expect(wrapper.vm.calculateLinePrice(
//                         "fixed_amount",
//                         expected_result.input.discount_amount,
//                         expected_result.input.item_price,
//                         expected_result.input.quantity
//                     )).toBe(expected_result.output);
//                 }
//             });
//
//             it('percentage', () => {
//                 const expected_results = [
//                     {input: {discount_amount: 150, item_price: 1.49, quantity: 3}, output: 0},
//                     {input: {discount_amount: 15, item_price: 1.49, quantity: 3}, output: 3.81},
//                     {input: {discount_amount: 14, item_price: 1.49, quantity: 3}, output: 3.84},
//                     {input: {discount_amount: 13, item_price: 1.11, quantity: 5000000000000000002}, output: 4850000000000000001.94},
//                 ];
//
//                 for (const expected_result of expected_results) {
//                     expect(wrapper.vm.calculateLinePrice(
//                         "percentage",
//                         expected_result.input.discount_amount,
//                         expected_result.input.item_price,
//                         expected_result.input.quantity
//                     )).toBe(expected_result.output);
//                 }
//             });
//         });
//     });
// });
