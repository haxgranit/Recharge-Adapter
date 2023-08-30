import { AppVue } from "@/core/utils";

/**
 * @returns {object} Adapter settings.
 */
function getAdapterSettings() {
    const vm = new AppVue();
    const settings = vm.$store.getters.settings;
    vm.settingsLoader.refresh().then(() => vm.$destroy());
    return settings;
}

export default {
    adapterSettings: getAdapterSettings,
};
