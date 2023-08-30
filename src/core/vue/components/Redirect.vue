<!-- This component redirects the current page on mount. -->
<template></template>

<script>
export default {
    name: "Redirect",
    props: {
        /**
         * @description The new URL to redirect the page to.
         */
        url: {
            type: String,
            required: true,
        },
    },
    // eslint-disable-next-line jsdoc/require-jsdoc
    mounted() {
        this.$logger.debug(`Redirecting to ${this.url} ...`);
        window.location = this.url;
    },
};
</script>

<style scoped></style>
