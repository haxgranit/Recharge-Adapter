describe("SubscriptionForm", () => {
    it.todo("component mounts");
});
// import Vue from "vue";
// import { createWrapper, mount, createLocalVue } from "@vue/test-utils";
// import SubscriptionForm from "@/components/SubscriptionForm";
// import SubscriptionFormType from "@/components/SubscriptionForm/SubscriptionFormType";
// import SubscriptionFormFrequency from "@/components/SubscriptionForm/SubscriptionFormFrequency";
// import CustomClasses from "@/plugins/custom_classes"
//
// const localVue = createLocalVue();
// localVue.use(CustomClasses);
//
// describe("SubscriptionForm", () => {
//     const mock_minimum_data = {
//         subscriptionType: "subscription_and_onetime",
//         onetimePrice: 1.0,
//         subscriptionPrice: 1.0
//     };
//
//     const $t_mock = id => {
//         let text = "Local String Not Set - Update $t_mock for " + id;
//         if (id === "products.one_time_purchase_label") {
//             text = "One-Time Purchase";
//         } else if (id === "products.subscribe_and_save_label") {
//             text = "Subscribe & Save";
//         } else if (id === "products.subscription_label") {
//             text = "Subscription Purchase";
//         } else if (id === "products.subscribe_and_save_extended_label") {
//             text = "on every recurring order";
//         } else if (id === "products.subscribe_and_save_frequency_label") {
//             text = "Save Frequency";
//         }
//         return text;
//     };
//
//     // mock custom classes
//     const mock_custom_classes = {
//         groups: {},
//         classes: {}
//     };
//
//     let spy_console_warn;
//     let spy_console_error;
//
//     beforeEach(() => {
//         jest.clearAllMocks();
//         spy_console_warn = jest.spyOn(global.console, "warn");
//         spy_console_error = jest.spyOn(global.console, "error");
//     });
//
//     afterEach(() => {
//         expect(spy_console_warn).not.toHaveBeenCalled();
//         expect(spy_console_error).not.toHaveBeenCalled();
//     });
//
//     it("component mounts", () => {
//         mount(SubscriptionForm, {
//             localVue,
//             propsData: mock_minimum_data,
//             mocks: {
//                 $t: $t_mock,
//                 $custom_classes: mock_custom_classes
//             }
//         });
//     });
//
//     describe("Choose Input Type", () => {
//         const form_type_selectors = {
//             button: "label > label",
//             radio: "input[type='radio']",
//             checkbox: "input[type='checkbox'"
//         };
//
//         let number_found;
//         let cmp;
//
//         beforeEach(() => {
//             number_found = 0;
//             cmp = false;
//         });
//
//         afterEach(() => {
//             expect(cmp.findAll(".rca-subscription-form-type").length).toBe(1);
//         });
//
//         it("button", () => {
//             const mock_prop_data = Object.assign({}, mock_minimum_data, {
//                 inputType: "button"
//             });
//             const wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: mock_prop_data,
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//
//             cmp = wrapper.findComponent(SubscriptionFormType);
//             expect(cmp.findAll(form_type_selectors["button"]).length).toBe(2);
//         });
//
//         it("radio", () => {
//             const mock_prop_data = Object.assign({}, mock_minimum_data, {
//                 inputType: "radio"
//             });
//             const wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: mock_prop_data,
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//
//             cmp = wrapper.findComponent(SubscriptionFormType);
//             expect(cmp.findAll(form_type_selectors["radio"]).length).toBe(2);
//         });
//
//         it("checkbox", () => {
//             const mock_prop_data = Object.assign({}, mock_minimum_data, {
//                 inputType: "checkbox"
//             });
//             const wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: mock_prop_data,
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//
//             cmp = wrapper.findComponent(SubscriptionFormType);
//             expect(cmp.findAll(form_type_selectors["checkbox"]).length).toBe(1);
//         });
//     });
//
//     describe("Subscription Type Number of Inputs", () => {
//         function checkNumberInputs(sub_type, input_type, selector, expected_number) {
//             const mock_prop_data = Object.assign({}, mock_minimum_data, {
//                 inputType: input_type,
//                 subscriptionType: sub_type
//             });
//
//             const wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: mock_prop_data,
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//             const cmp = wrapper.findComponent(SubscriptionFormType);
//             const found = cmp.findAll(selector).length;
//             expect(found).toBe(expected_number);
//         }
//
//         const form_type_selectors = {
//             button: "label > label",
//             radio: 'input[type="radio"]',
//             checkbox: 'input[type="checkbox"]'
//         };
//
//         describe("button", () => {
//             const expected_numbers = {
//                 subscription_only: 0,
//                 subscription_and_onetime: 2
//             };
//             for (const [sub_type, num_expected] of Object.entries(expected_numbers)) {
//                 it(sub_type, async () => {
//                     await checkNumberInputs(
//                         sub_type,
//                         "button",
//                         form_type_selectors["button"],
//                         num_expected
//                     );
//                 });
//             }
//         });
//
//         describe("radio", () => {
//             const expected_numbers = {
//                 subscription_only: 0,
//                 subscription_and_onetime: 2
//             };
//             for (const [sub_type, num_expected] of Object.entries(expected_numbers)) {
//                 it(sub_type, async () => {
//                     await checkNumberInputs(
//                         sub_type,
//                         "radio",
//                         form_type_selectors["radio"],
//                         num_expected
//                     );
//                 });
//             }
//         });
//
//         describe("checkbox", () => {
//             const expected_numbers = {
//                 subscription_only: 1,
//                 subscription_and_onetime: 1
//             };
//             for (const [sub_type, num_expected] of Object.entries(expected_numbers)) {
//                 it(sub_type, async () => {
//                     await checkNumberInputs(
//                         sub_type,
//                         "checkbox",
//                         form_type_selectors["checkbox"],
//                         num_expected
//                     );
//                 });
//             }
//         });
//     });
//
//     describe("Subscription Messages", () => {
//         function makeMessage(message_type, discount_text = "") {
//             let message = message_parts[message_type][0] + discount_text;
//             if (message_parts[message_type].length > 0) {
//                 message = message + message_parts[message_type].slice(1);
//             }
//             return message;
//         }
//
//         const message_parts = {
//             onetime: ["One-Time Purchase"],
//             subscription: ["Subscription Purchase"],
//             sub_and_save: ["Subscribe & Save "],
//             combined: ["Subscribe & Save ", " on every recurring order"]
//         };
//
//         let wrapper;
//         let cmp;
//         const props = Object.assign({}, mock_minimum_data, {
//             subscriptionType: "subscription_and_onetime"
//         });
//
//         describe("One-Time", () => {
//             const otp_props = {
//                 onetimePrice: 1.0,
//                 subscriptionPrice: 1.0
//             };
//             beforeEach(function() {
//                 wrapper = mount(SubscriptionForm, {
//                     localVue,
//                     propsData: Object.assign({}, props, otp_props),
//                     mocks: {
//                         $t: $t_mock,
//                         $custom_classes: mock_custom_classes
//                     }
//                 });
//                 cmp = wrapper.findComponent(SubscriptionFormType);
//             });
//
//             it("button", async () => {
//                 wrapper.setProps({ inputType: "button" });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll("label > label:first-of-type > span:first-of-type")
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(makeMessage("onetime"));
//             });
//
//             it("radio", async () => {
//                 wrapper.setProps({ inputType: "radio" });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll("input:first-of-type + span")
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(
//                     makeMessage("onetime") + " - " + otp_props.onetimePrice.toFixed(2)
//                 );
//             });
//         });
//
//         describe("Subscription", () => {
//             const otp_props = {
//                 onetimePrice: 1.0,
//                 subscriptionPrice: 1.0
//             };
//             beforeEach(function() {
//                 wrapper = mount(SubscriptionForm, {
//                     localVue,
//                     propsData: Object.assign({}, props, otp_props),
//                     mocks: {
//                         $t: $t_mock,
//                         $custom_classes: mock_custom_classes
//                     }
//                 });
//                 cmp = wrapper.findComponent(SubscriptionFormType);
//             });
//
//             it("button", async () => {
//                 wrapper.setProps({ inputType: "button" });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll("label > label:last-of-type > span:first-of-type")
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(makeMessage("subscription"));
//             });
//
//             it("radio", async () => {
//                 wrapper.setProps({ inputType: "radio" });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll("label:last-of-type > span")
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(
//                     makeMessage("subscription") + " - " + otp_props.subscriptionPrice.toFixed(2)
//                 );
//             });
//         });
//
//         describe("Sub & Save", () => {
//             const otp_props = {
//                 onetimePrice: 1.0,
//                 subscriptionPrice: 0.5,
//                 discountText: "32%"
//             };
//             beforeEach(function() {
//                 wrapper = mount(SubscriptionForm, {
//                     localVue,
//                     propsData: Object.assign({}, props, otp_props),
//                     mocks: {
//                         $t: $t_mock,
//                         $custom_classes: mock_custom_classes
//                     }
//                 });
//                 cmp = wrapper.findComponent(SubscriptionFormType);
//             });
//
//             it("button", async () => {
//                 wrapper.setProps({ inputType: "button" });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll("label > label:last-of-type > span:first-of-type")
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(makeMessage("sub_and_save") + otp_props.discountText);
//             });
//
//             it("radio", async () => {
//                 wrapper.setProps({
//                     inputType: "radio",
//                     subscriptionText: "Subscribe & Save"
//                 });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll("label:last-of-type > span")
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(
//                     makeMessage("sub_and_save", otp_props.discountText) +
//                         " - " +
//                         otp_props.subscriptionPrice.toFixed(2)
//                 );
//             });
//         });
//
//         describe("Combined", () => {
//             const otp_props = {
//                 onetimePrice: 1.0,
//                 subscriptionPrice: 0.5,
//                 discountText: "$2.87"
//             };
//             beforeEach(function() {
//                 wrapper = mount(SubscriptionForm, {
//                     localVue,
//                     propsData: Object.assign({}, props, otp_props),
//                     mocks: {
//                         $t: $t_mock,
//                         $custom_classes: mock_custom_classes
//                     }
//                 });
//                 cmp = wrapper.findComponent(SubscriptionFormType);
//             });
//
//             it("checkbox", async () => {
//                 wrapper.setProps({ inputType: "checkbox" });
//                 await Vue.nextTick();
//                 const message = cmp
//                     .findAll('input[type="checkbox"] + span')
//                     .at(0)
//                     .text();
//                 expect(message).toEqual(makeMessage("combined", otp_props.discountText));
//             });
//         });
//     });
//
//     describe("Frequency Default Value", () => {
//         const selection_props = {
//             subscriptionType: "subscription_and_onetime",
//             subscriptionFrequencies: [
//                 { value: "30", text: "Every 30 days" },
//                 { value: "60", text: "Every 60 days" },
//                 { value: "90", text: "Every 90 days" }
//             ]
//         };
//
//         it("first option", async () => {
//             const wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: Object.assign({}, mock_minimum_data, selection_props),
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//             const cmp = wrapper.findComponent(SubscriptionFormFrequency);
//             wrapper.setData({ selectedType: "subscription" });
//             await Vue.nextTick();
//             expect(cmp.find("option:checked").text()).toBe(
//                 selection_props.subscriptionFrequencies[0].text
//             );
//         });
//
//         it("specified option", async () => {
//             const frequency = selection_props.subscriptionFrequencies[1];
//             const wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: Object.assign({}, mock_minimum_data, selection_props, {
//                     initialFrequency: frequency.value
//                 }),
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//             const cmp = wrapper.findComponent(SubscriptionFormFrequency);
//             wrapper.setData({ selectedType: "subscription" });
//             await Vue.nextTick();
//             expect(cmp.find("option:checked").text()).toBe(frequency.text);
//         });
//     });
//
//     describe("Frequency Selection Visibility", () => {
//         const selection_props = {
//             subscriptionType: "subscription_and_onetime",
//             subscriptionFrequencies: [
//                 { value: "30", text: "Every 30 days" },
//                 { value: "60", text: "Every 60 days" },
//                 { value: "90", text: "Every 90 days" }
//             ]
//         };
//
//         let wrapper;
//         let cmp;
//
//         beforeEach(function() {
//             wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: Object.assign({}, mock_minimum_data, selection_props),
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//             cmp = wrapper.findComponent(SubscriptionFormFrequency);
//         });
//
//         it("subscription visible", async () => {
//             wrapper.setData({ selectedType: "subscription" });
//             await Vue.nextTick();
//             expect(cmp.find("label").exists()).toBe(true);
//         });
//
//         it("onetime hidden", async () => {
//             wrapper.setData({ selectedType: "onetime" });
//             await Vue.nextTick();
//             expect(cmp.find("label").exists()).toBe(false);
//         });
//     });
//
//     describe("Emits Event On Change", () => {
//         const selection_props = {
//             subscriptionType: "subscription_and_onetime",
//             subscriptionFrequencies: [
//                 { value: "30", text: "Every 30 days" },
//                 { value: "60", text: "Every 60 days" },
//                 { value: "90", text: "Every 90 days" }
//             ]
//         };
//
//         let wrapper;
//         let root_wrapper;
//
//         beforeEach(function() {
//             wrapper = mount(SubscriptionForm, {
//                 localVue,
//                 propsData: Object.assign({}, mock_minimum_data, selection_props),
//                 mocks: {
//                     $t: $t_mock,
//                     $custom_classes: mock_custom_classes
//                 }
//             });
//             root_wrapper = createWrapper(wrapper.vm.$root);
//         });
//
//         it("type", async () => {
//             async function checkType(type_str) {
//                 wrapper.setData({ selectedType: type_str });
//                 await Vue.nextTick();
//                 const events = root_wrapper.emitted("sub-update-values");
//                 const event = events[events.length - 1][0];
//                 expect(event.type).toBe(type_str);
//             }
//
//             await checkType("subscription");
//             await checkType("onetime");
//         });
//
//         it("frequency", async () => {
//             const frequency = selection_props.subscriptionFrequencies[1];
//             wrapper.setData({ selectedFrequency: frequency.value });
//             await Vue.nextTick();
//
//             const events = root_wrapper.emitted("sub-update-values");
//             const event = events[events.length - 1][0];
//             expect(event.frequency).toBe(frequency.value);
//         });
//     });
// });
