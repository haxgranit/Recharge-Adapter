<!-- This component will move the slotted component to another location within the DOM. -->
<template>
    <MountingPortal v-if="mountReady" :mount-to="mountTo" target-slim>
        <slot></slot>
    </MountingPortal>
</template>

<script>
import { nanoid } from "nanoid";
import jQuery from "jquery-slim";

export default {
    name: "Teleport",
    props: {
        /**
         * @description This is the element within the DOM to target when moving the slotted
         * component. If a String is passed, it is converted into a jQuery object.
         */
        target: {
            type: [jQuery, String, HTMLElement],
            required: true,
        },
        /**
         * @description This is a selector to keep from mounting multiple copies, if
         * a single copy is desired.
         */
        uniqueSelector: {
            type: [jQuery, String, HTMLElement],
        },
        /**
         * @description The type of movement the component will make. The values are:
         *      - prepend => Adds the slotted component as the first child element within the target
         *                   element.
         *      - append => Adds the slotted component as the last child element within the target
         *                  element.
         *      - replace => Replaces the target element with the slotted component.
         *      - before => Adds the slotted component as a sibling before the target element.
         *      - after => Adds the slotted component as a sibling after the target element.
         */
        mode: {
            type: String,
            default: "after",
            // eslint-disable-next-line jsdoc/require-jsdoc
            validator(value) {
                const validValues = ["prepend", "append", "replace", "before", "after"];
                return validValues.includes(value);
            },
        },
        /**
         * @description The HTML tag to use for the temporary element added to the DOM. This element
         * should be replaced with the slotted component.
         */
        tag: {
            type: String,
            default: "div",
        },
    },
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * @property {string} mount_id - The unique ID for the temporary element created.
     * @property {boolean} mountReady - Indicator is the temporary element has been created and is
     * ready to be overridden.
     * @property {string} mountTo - The CSS selector for the temporary mount element.
     * @property {string} mountElement - The HTML template for the temporary mount element.
     */
    data() {
        const mount_id = nanoid();
        const tag = this.tag.toLowerCase();
        return {
            mount_id,
            mountReady: false,
            mountTo: `[mount_id="${mount_id}"]`,
            mountElement: `<${tag} mount_id="${mount_id}"></${tag}>`,
        };
    },
    // eslint-disable-next-line jsdoc/require-jsdoc
    mounted() {
        const element = this.uniqueSelector && this.$(this.uniqueSelector);
        if (element?.length > 0) {
            return;
        }

        // Normalize the target into a jQuery element.
        const target = this.$(this.target);

        // jQuery action to take depending on the type of this component.
        const actionMap = {
            prepend: () => target.prepend(this.mountElement),
            append: () => target.append(this.mountElement),
            replace: () => target.attr("mount_id", this.mount_id),
            before: () => target.before(this.mountElement),
            after: () => target.after(this.mountElement),
        };
        const setMountReady = () => (this.mountReady = true);
        // Execute the actionMap function. When it is successful, set this.mountReady.
        actionMap[this.mode]()[0] && setMountReady();
    },
};
</script>

<style scoped></style>
