<template>
    <div class="rc_popup" v-show="showPopup">
        <div class="rc_popup__hover" :style="cssProps">
            <svg
                v-if="show_subscription_details_icon"
                fill="none"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                alt="ReCharge Subscription services icon"
                class="rc_popup__icon"
            >
                <path
                    d="M13.64 2.35C12.19 0.9 10.2 0 7.99 0C3.57 0 0 3.58 0 8C0 12.42 3.57 16 7.99 16C11.72 16 14.83 13.45 15.72 10H13.64C12.82 12.33 10.6 14 7.99 14C4.68 14 1.99 11.31 1.99 8C1.99 4.69 4.68 2 7.99 2C9.65 2 11.13 2.69 12.21 3.78L8.99 7H15.99V0L13.64 2.35Z"
                    :fill="widgetIcon"
                />
            </svg>
            <div class="rc_popup__block" v-if="showPopup">
                <div class="rc_popup__block__content">
                    <div class="rc_popup__close" style="display: none">x</div>
                    <div v-html="howItWorksText"></div>
                    <a
                        v-if="showLearnMoreURL"
                        :href="learnMoreURL"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Learn more about ReCharge Payments"
                        >{{ learnMoreLink }}</a
                    >
                </div>
                <div class="rc_popup__block__footer">
                    <a
                        class="tooltip-badge"
                        v-if="showPoweredBy"
                        :href="poweredByURL"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="ReCharge Payments homepage"
                    >
                        <!-- Start Recharge SVG -->
                        <span class="powered-by">Powered by</span>
                        <svg
                            width="61"
                            height="14"
                            viewBox="0 0 61 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clip-path="url(#clip0)">
                                <path
                                    d="M6.811 3.49468C6.90279 3.3542 6.90279 3.27598 6.76351 3.1355C6.44181 2.87109 6.03895 2.72774 5.62396 2.73003C4.75821 2.73003 3.90829 3.24405 3.31952 4.10288L3.48729 3.1355C3.51736 2.97587 3.42556 2.90084 3.28628 2.90084H0.321853C0.182574 2.90084 0.120848 3.01099 0.198401 3.11954L1.1876 4.52432L0.0053093 10.5441C-0.00179514 10.5748 -0.00176934 10.6067 0.00538467 10.6374C0.0125387 10.668 0.0266271 10.6966 0.046549 10.7209C0.0664709 10.7452 0.0916865 10.7645 0.120225 10.7773C0.148764 10.7901 0.179853 10.7961 0.211063 10.7947H1.79378C1.8602 10.79 1.92305 10.7626 1.97196 10.7171C2.02087 10.6715 2.05293 10.6105 2.06284 10.5441L2.66586 7.4089C3.06787 5.33366 3.93203 4.64883 4.97029 4.64883C5.18407 4.65132 5.39492 4.69918 5.58914 4.78931C5.75849 4.86753 5.83604 4.88189 5.94367 4.72705L6.811 3.49468Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M10.5114 2.73005C8.19112 2.73005 6.41215 4.33596 6.01014 6.78475C5.62395 9.1569 6.96926 10.9975 9.44463 10.9975C10.5415 10.9975 11.7475 10.6782 12.4898 9.99817C12.6291 9.87366 12.6765 9.77947 12.5832 9.639L12.0118 8.73547C11.9184 8.59499 11.7791 8.64129 11.6557 8.73547C11.112 9.1063 10.4743 9.31186 9.81815 9.32771C8.76723 9.32771 7.97746 8.78176 7.93156 7.62761H12.9393C13.3714 7.62761 13.5581 7.20618 13.6341 6.66981C13.9744 4.61692 12.8617 2.73005 10.5114 2.73005ZM11.8409 6.25476H8.09774C8.41428 5.22512 9.2278 4.50837 10.2787 4.50837C11.0843 4.50837 11.9184 5.02239 11.8409 6.25476Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M26.9337 2.73004C25.8511 2.73004 24.9236 3.36858 24.3048 4.30563L25.1088 0.234964C25.1404 0.0944861 25.0629 0.000302156 24.9078 0.000302156H22.1634C22.1408 -0.00125447 22.1183 0.00322297 22.098 0.0132811C22.0777 0.0233393 22.0605 0.0386209 22.0479 0.0575788C22.0354 0.0765367 22.0281 0.0984975 22.0266 0.121238C22.0252 0.143978 22.0298 0.16669 22.0399 0.187074L22.9215 1.37315L21.1188 10.6064C21.1145 10.6296 21.1155 10.6535 21.1215 10.6763C21.1276 10.6991 21.1386 10.7203 21.1537 10.7383C21.1688 10.7564 21.1878 10.7708 21.2091 10.7805C21.2304 10.7903 21.2536 10.7951 21.277 10.7947H22.9943C23.0442 10.7915 23.0915 10.771 23.1281 10.7367C23.1647 10.7024 23.1885 10.6563 23.1953 10.6064L23.7207 8.12726C24.1386 6.1462 25.112 4.74143 26.3496 4.74143C27.0144 4.74143 27.3088 5.41348 27.0919 6.50538L26.2784 10.5441C26.267 10.5746 26.2637 10.6076 26.2688 10.6398C26.274 10.6719 26.2874 10.7022 26.3077 10.7275C26.328 10.7529 26.3546 10.7724 26.3847 10.7842C26.4148 10.796 26.4475 10.7996 26.4794 10.7947H28.1033C28.1715 10.7925 28.2367 10.7662 28.2876 10.7204C28.3385 10.6746 28.3719 10.6122 28.3819 10.5441L29.2856 6.06639C29.6559 4.22741 28.6667 2.73004 26.9337 2.73004Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M38.5318 2.90084H37.0409C36.9696 2.89749 36.8996 2.92145 36.845 2.96792C36.7904 3.0144 36.7552 3.07995 36.7465 3.15147L36.5613 4.10927C36.2211 3.25044 35.3395 2.73642 34.211 2.73642C32.0759 2.73642 30.2542 4.28008 29.849 6.8869C29.485 9.18722 30.71 11.015 32.8879 11.015C33.3754 11.0124 33.8564 10.9021 34.2972 10.692C34.7379 10.4818 35.1277 10.1769 35.4392 9.79861L35.2999 10.5601C35.2698 10.7197 35.3474 10.7947 35.4867 10.7947H37.0013C37.0707 10.8 37.1394 10.7788 37.1939 10.7353C37.2485 10.6919 37.2848 10.6293 37.2957 10.5601L38.7328 3.15147C38.7442 3.12097 38.7476 3.088 38.7424 3.05582C38.7373 3.02364 38.7239 2.99338 38.7036 2.96804C38.6832 2.9427 38.6567 2.92317 38.6266 2.91138C38.5964 2.89959 38.5638 2.89596 38.5318 2.90084V2.90084ZM35.8729 6.81666C35.6877 8.06499 34.765 9.12496 33.4988 9.12496C32.2928 9.12496 31.6897 8.03307 31.8907 6.83262C32.0918 5.63217 32.9955 4.62968 34.2332 4.62968C35.3933 4.62968 36.058 5.56832 35.8729 6.81666Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M44.2074 4.72707L45.0732 3.49469C45.1666 3.35422 45.1666 3.27599 45.0273 3.13552C44.7043 2.87005 44.2996 2.72665 43.883 2.73005C43.0172 2.73005 42.1657 3.24407 41.5786 4.1029L41.7495 3.13552C41.7796 2.97588 41.6862 2.90086 41.5485 2.90086H39.9088C39.8154 2.90086 39.7505 2.97908 39.7236 3.10359L38.2691 10.5441C38.2622 10.574 38.2621 10.6051 38.2687 10.635C38.2753 10.6649 38.2886 10.693 38.3074 10.7171C38.3263 10.7411 38.3503 10.7606 38.3776 10.7741C38.4049 10.7875 38.4349 10.7946 38.4653 10.7947H40.0481C40.1161 10.7919 40.181 10.7654 40.2318 10.7197C40.2825 10.674 40.3161 10.6119 40.3266 10.5441L40.9296 7.40891C41.3316 5.33367 42.1958 4.64885 43.2341 4.64885C43.4458 4.6518 43.6544 4.69966 43.8466 4.78932C44.0223 4.86754 44.0998 4.88191 44.2074 4.72707Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M53.0533 2.90086H51.537C51.47 2.90152 51.4056 2.92771 51.3569 2.97418C51.3082 3.02066 51.2787 3.08399 51.2743 3.15148L51.0891 4.00871C50.8264 3.43244 49.9812 2.73164 48.7388 2.73164C46.4961 2.73164 44.7171 4.35352 44.3072 6.75601C43.9289 8.87594 45.1128 10.7788 47.346 10.7788C48.4903 10.7788 49.2452 10.4036 50.0683 9.62463C49.6362 11.636 48.3985 12.2442 46.9139 12.2442C46.0624 12.2442 45.3676 11.9633 44.6554 11.5115C44.6322 11.4933 44.6053 11.4807 44.5765 11.4747C44.5478 11.4687 44.518 11.4696 44.4897 11.4772C44.4613 11.4848 44.4351 11.4989 44.413 11.5184C44.3909 11.5379 44.3737 11.5623 44.3626 11.5897L43.6345 12.7439C43.5986 12.7912 43.5819 12.8505 43.5878 12.9098C43.5937 12.9691 43.6217 13.0239 43.6662 13.0631C44.4702 13.7192 45.7237 14.0002 46.8316 14.0002C49.4763 14.0002 51.4215 12.5172 51.9818 9.6789L53.2479 3.15946C53.2603 3.12912 53.2646 3.09605 53.2604 3.06352C53.2561 3.03099 53.2436 3.00014 53.2239 2.97402C53.2042 2.94789 53.1782 2.9274 53.1482 2.91457C53.1183 2.90173 53.0856 2.89701 53.0533 2.90086V2.90086ZM50.3009 6.73206C50.1142 7.93251 49.193 8.94778 47.9347 8.94778C46.7287 8.94778 46.1257 7.90218 46.3267 6.74803C46.5277 5.59388 47.4235 4.62969 48.6612 4.62969C49.8213 4.62969 50.494 5.538 50.3009 6.73845V6.73206Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M57.8157 2.73005C55.497 2.73005 53.718 4.33596 53.316 6.78475C52.9298 9.1569 54.2751 10.9975 56.7489 10.9975C57.8473 10.9975 59.0533 10.6782 59.7956 9.99817C59.9349 9.87366 59.9808 9.77947 59.889 9.639L59.3161 8.73547C59.2227 8.59499 59.0834 8.64129 58.96 8.73547C58.416 9.10691 57.7776 9.31252 57.1208 9.32771C56.0683 9.32771 55.2801 8.78176 55.2327 7.62761H60.2436C60.6772 7.62761 60.8624 7.20618 60.9399 6.66981C61.2802 4.61692 60.166 2.73005 57.8157 2.73005ZM59.1467 6.25476H55.4004C55.717 5.22512 56.5289 4.50837 57.5814 4.50837C58.3886 4.50837 59.2227 5.02239 59.1467 6.25476Z"
                                    fill="#191D48"
                                />
                                <path
                                    d="M19.8573 8.48484C19.8379 8.46225 19.8142 8.44388 19.7875 8.43085C19.7608 8.41783 19.7318 8.41042 19.7021 8.40907C19.6725 8.40773 19.6429 8.41248 19.6152 8.42303C19.5875 8.43359 19.5622 8.44973 19.5408 8.47047C19.0777 8.8286 18.5145 9.03026 17.9312 9.04675C16.7093 9.04675 16.0319 8.07937 16.1902 6.86296C16.3485 5.64655 17.2886 4.69513 18.4788 4.69513C19.1293 4.69513 19.5471 4.92979 20.0109 5.39752C20.1343 5.52204 20.2119 5.52204 20.3512 5.41349L21.448 4.45568C21.474 4.43865 21.4963 4.41649 21.5136 4.39051C21.5309 4.36454 21.5428 4.3353 21.5485 4.30457C21.5543 4.27383 21.5538 4.24224 21.5472 4.21169C21.5405 4.18114 21.5278 4.15228 21.5097 4.12684C20.845 3.16903 19.8099 2.72366 18.6608 2.72366C16.3627 2.73004 14.4903 4.47005 14.1817 6.75441C13.8414 9.24949 15.4811 11.015 17.6621 11.015C18.2125 11.0277 18.7599 10.9295 19.2722 10.7261C19.7845 10.5227 20.2514 10.2183 20.6455 9.83055C20.6762 9.8099 20.7023 9.78308 20.7222 9.75176C20.7421 9.72045 20.7554 9.68533 20.7612 9.64861C20.767 9.61188 20.7652 9.57434 20.7559 9.53835C20.7466 9.50235 20.7301 9.46868 20.7073 9.43945L19.8573 8.48484Z"
                                    fill="#191D48"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0">
                                    <rect width="61" height="14" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <!--End Recharge SVG -->
                    </a>
                </div>
            </div>
            {{ subscriptionDetailsLabel }}
        </div>
    </div>
</template>

<script>
export default {
    name: "SubscriptionFormRCInfo",
    props: {
        /**
         * Boolean for whether the popup should be shown or not.
         */
        showPopup: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        /**
         * Build css variables for component.
         * @returns {object} - Css props.
         */
        cssProps() {
            const styles = this.$store.getters.settings.style || {};
            const css = {
                "--widgetCursor": this.showPopup ? "pointer" : "auto",
            };

            Object.entries(styles).forEach(([style, value]) => (css[`--${style}`] = value));

            return css;
        },
        /**
         * Text for info popup content.
         *
         * @returns {string} - Localization string for the how it works text.
         */
        howItWorksText: function () {
            return this.$t("products.how_it_works");
        },
        /**
         * Text for link popup.
         *
         * @returns {string} - Localization string for the link text.
         */
        learnMoreLink: function () {
            return this.$t("products.learnmore_verbiage");
        },
        /**
         * Text to display for view info element.
         *
         * @returns {string} - Localization string for the view info text.
         */
        subscriptionDetailsLabel: function () {
            return this.$t("products.subscription_details_verbiage");
        },
        /**
         * Condition to show the subscription details icon.
         *
         * @returns {boolean} - From settings.
         */
        show_subscription_details_icon: function () {
            return this.$store.getters.settings.pages.product.show_subscription_details_icon;
        },
        /**
         * Powered by url for widget.
         *
         * @returns {string} - From settings.
         */
        poweredByURL: function () {
            return this.$t("products.poweredby_url");
        },
        /**
         * Learn more url for widget.
         *
         * @returns {string} - From settings.
         */
        learnMoreURL: function () {
            return this.$t("products.learnmore_url");
        },
        /**
         * Icon to display for view info element.
         *
         * @returns {string} - Color of the icon (Hexcode or name).
         */
        widgetIcon: function () {
            return this.$store.getters.settings.pages.product.widget_icon;
        },
        /**
         * Condition to show powered by section.
         *
         * @returns {boolean} - From settings.
         */
        showPoweredBy: function () {
            return this.$store.getters.settings.pages.product.show_poweredby;
        },
        /**
         * Condition to show learn more url.
         *
         * @returns {boolean} - From settings.
         */
        showLearnMoreURL: function () {
            return this.$store.getters.settings.pages.product.show_learnmore;
        },
    },
    /**
     * @returns {*} - Component Data.
     */
    data() {
        return {
            /**
             * Icon for powered by link.
             */
            poweredByIcon:
                "//rechargestatic-bootstrapheroes.netdna-ssl.com/static/images/widget/rc_widget__banner@2x.png",
        };
    },
};
</script>

<style>
.rc_popup {
    display: block;
    white-space: nowrap;
    padding: 5px;
}

.rc_popup__hover {
    display: inline-block;
    position: relative;
    padding: 14px 0 12px 0;
    clear: both;
    cursor: var(--widgetCursor);
}

img.rc_popup__icon {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    height: 22px;
    top: -2px;
    margin-right: 3px;
    -ms-interpolation-mode: bicubic;
    image-rendering: unset;
    padding: 1px;
}

.rc_popup__block {
    display: none;
    position: absolute;
    bottom: 100%;
    cursor: default;
    left: 0;
    text-align: left;
    white-space: normal;
    width: 300px;
    padding: 0;
    background-color: var(--popup_background_color);
    z-index: 56;
}

.rc_popup__hover:hover .rc_popup__block,
.rc_popup__block:hover {
    text-decoration: none;
    display: block;
}

.rc_popup__block:before {
    display: block;
    content: "";
    width: 1px;
    height: 1px;
    background-color: transparent;
    border: 10px solid transparent;
    border-top: 10px solid black;
    position: absolute;
    bottom: -21px;
    left: 0;
}

.rc_popup__block__content {
    font-size: 1.1rem;
    white-space: normal;
    padding: 20px 20px 20px;
}

.rc_popup__block__content {
    color: var(--popup_text_color);
    margin: 0;
}

.rc_popup__block__content p:first-of-type {
    padding-bottom: 2em;
}

.rc_popup__block__content a {
    text-decoration: none;
    color: var(--popup_link_color);
}

.rc_popup__block__footer {
    margin-bottom: 15px;
    margin-right: 20px;
    display: flex;
    justify-content: flex-end;
}

.tooltip-badge {
    font-size: 12px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    border-radius: 50px;
    padding: 4px 12px;
}

.tooltip-badge .powered-by {
    color: #191d48;
    font-weight: 400;
    padding-right: 4px;
}
</style>
