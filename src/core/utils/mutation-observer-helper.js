/**
 * By default, trigger the mutation observer on ALL changes.
 * See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit for more details
 */
let defaultObserverOptions = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [],
    attributeOldValue: false,
    characterData: false,
    characterDataOldValue: false,
};

export class BaseMutationObserver {
    constructor({
        observedElementSelector,
        callback,
        observerOptions = null,
        name = "Base Observer",
        startHook = null,
        startCondition = null,
        logger = null,
    }) {
        this.callback = callback;
        this.observedElementSelector = observedElementSelector;
        this.observer = null;
        this.name = name;
        this.startHook = startHook;
        this.startCondition =
            startCondition ||
            function () {
                return true;
            };
        this.observerOptions = observerOptions || defaultObserverOptions;
        this.$logger = logger || console;
    }
    start() {
        if (!this.observer) {
            this.register();
        }
        try {
            if (this.startHook) {
                this.startHook();
                this.$logger.debug(`${this.name} start hook ran.`);
            }
            const observedElement = document.querySelector(this.observedElementSelector);
            const startConditionResult = this.startCondition();
            if (startConditionResult === true && !!observedElement) {
                this.observer.observe(observedElement, this.observerOptions);
                this.$logger.debug(`${this.name} started.`);
            } else {
                if (!startConditionResult) {
                    this.$logger.debug(`${this.name} start condition failed.`);
                }
                if (!observedElement) {
                    this.$logger.debug(`${this.observedElementSelector} not found.`);
                }
            }
        } catch (e) {
            this.$logger.debug(`${this.name} unhandled error in start method.`);
            throw e;
        }
    }
    register() {
        try {
            this.observer = new MutationObserver(this.callback);
            this.$logger.debug(`${this.name} registered.`);
        } catch (e) {
            this.$logger.debug(`${this.name} unhandled error in register method.`);
            throw e;
        }
    }
    stop() {
        try {
            this.observer.disconnect();
            this.$logger.debug(`${this.name} stopped.`);
        } catch (e) {
            this.$logger.debug(`${this.name} unhandled error in stop method.`);
            throw e;
        }
    }
}
