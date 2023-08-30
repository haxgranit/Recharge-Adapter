import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import main from "./main.store";
import customer from "./customer.store";
import createMutationsSharer from "vuex-shared-mutations";

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
    key: "vuex",
    storage: window.localStorage,
});

export default new Vuex.Store({
    modules: { main, customer },
    plugins: [
        vuexLocal.plugin,
        createMutationsSharer({
            predicate: [
                "ADD_SUB_ITEM",
                "REMOVE_SUB_ITEM",
                "REPLACE_SUB_DATA",
                "setCartID",
                "setCartCurrency",
                "setSettings",
            ],
        }),
    ],
});
