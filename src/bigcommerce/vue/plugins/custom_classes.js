import customClasses from "@/bigcommerce/config/custom-classes.json";
import { CustomClassesMixin } from "@/bigcommerce/vue/mixins";

export default {
    /**
     * Custom selectors to append RCA custom classes.
     * @param {Vue} A Vue instance to be used with.
     * @param Vue
     */
    install(Vue) {
        /*
         * Flatten RCA elements list, removing its groups.
         * @param {Object} customClassesData Object to be flatten.
         */
        /**
         * @param customClassesData
         */
        function getCustomClassesAsList(customClassesData) {
            if (!customClassesData) return null;

            const classesList = Object.entries(customClassesData).map(([key, classes]) => classes);
            return classesList.reduce((list, classes) => ({ ...list, ...classes }), {});
        }

        /**
         * $custom_classes.themes is a list of themes and its correct order, defined in custom_classes.json
         * $custom_classes.groups is the custom_classes.json object.
         * $custom_classes.classes is the modules object as a flat object to facilitate element selection.
         */
        const groups = typeof customClasses !== "undefined" ? { ...customClasses } : {};
        const themes = groups["custom_classes_settings"]["themes"] || [];
        delete groups["custom_classes_settings"];

        Vue.prototype.$custom_classes = {
            themes,
            groups,
            classes: getCustomClassesAsList(groups),
        };

        Vue.mixin(CustomClassesMixin);
    },
};
