import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";

/**
 *
 */
export class Logger {
    /**
     * @param {string} moduleName - The name of the module to be logged.
     * @param {object} [options] - An options object to pass to the logger instance.
     * @param {Console|Logger} [options.logger=console] - The logger object to pass messages to.
     * @param {boolean} [options.enabled=true] - Indicator if this logger object should be enabled
     * and print messages.
     * @param {boolean} [options.formatMessages=true] - Indicator if the logger should create
     * formatted messages.
     */
    constructor(
        moduleName = "Default",
        { logger = console, enabled = true, formatMessages = true } = {}
    ) {
        this.moduleName = moduleName;
        this.enabled = enabled;
        this.logger = logger;
        this._formatMessages = formatMessages;
    }

    /**
     * @returns {string} The name of the method or function calling the logger.
     */
    get methodName() {
        let error;

        try {
            throw new Error("");
        } catch (e) {
            error = e;
        }
        // IE9 does not have .stack property
        if (error.stack === undefined) {
            return "";
        }
        let stackTrace = error.stack.split("\n")[5];
        if (/ /.test(stackTrace)) {
            stackTrace = stackTrace.trim().split(" ")[1];
        }
        if (stackTrace && stackTrace.indexOf(".") > -1) {
            stackTrace = stackTrace.split(".")[1];
        }
        return stackTrace;
    }

    /**
     * @param {string} msg - The log message.
     * @param {boolean} [includeMethod=true] - Indicator if the method name should be included with
     * the formatted message.
     * @returns {string} The logging message formatted with the module name and, optionally, the
     * method name.
     */
    formatMessage(msg, includeMethod = true) {
        let method = this.methodName;
        if (method && (this.methodName.startsWith("_") || this.methodName === "eval")) {
            method = null;
        }
        const parts = [this.moduleName, includeMethod ? method : null, msg];
        return parts.filter((value) => !!value).join(" | ");
    }

    /**
     * Creates a message in the logger.
     * @param {string} level - The logging level of the message.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message. This creates a log
     * group to bundle everything.
     */
    _sendLog(level, msg, extra) {
        if (this.enabled) {
            if (extra) {
                this.logger.groupCollapsed(this.formatMessage(msg));
                this.logger[level](extra);
                this.logger.groupEnd();
            } else {
                if (this._formatMessages) {
                    msg = this.formatMessage(msg);
                }
                this.logger[level](msg);
            }
        }
    }

    /**
     * Create a log message at the LOG level.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message.
     */
    log(msg, extra = null) {
        this._sendLog("log", msg, extra);
    }

    /**
     * Create a log message at the DEBUG level.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message.
     */
    debug(msg, extra = null) {
        this._sendLog("debug", msg, extra);
    }

    /**
     * Create a log message at the INFO level.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message.
     */
    info(msg, extra = null) {
        this._sendLog("info", msg, extra);
    }

    /**
     * Create a log message at the WARN level.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message.
     */
    warn(msg, extra = null) {
        this._sendLog("warn", msg, extra);
    }

    /**
     * Create a log message at the ERROR level.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message.
     */
    error(msg, extra = null) {
        this._sendLog("error", msg, extra);
    }

    /**
     * Create a log message at the FATAL level.
     * @param {string} msg - The message to log.
     * @param {object} extra - Extra data to include with the logged message.
     */
    fatal(msg, extra = null) {
        this._sendLog("fatal", msg, extra);
    }

    /**
     * Logs an object.
     * @param {object} obj - The object to log.
     */
    dir(obj) {
        // eslint-disable-next-line jsdoc/require-jsdoc
        class Log {
            // eslint-disable-next-line jsdoc/require-jsdoc
            constructor(moduleName, args) {
                this._module = moduleName;
                Object.assign(this, args);
            }
        }

        this.logger.dir(new Log(this.moduleName, obj));
    }

    /**
     * Create a collapsable group where logs or other groups can be attached.
     * @param {string} label - The title of the logging group.
     * @param {boolean} [collapsed=true] - Indicator if the logging group should be displayed as
     * already collapsed.
     * @returns {console.group|undefined} - The newly created group.
     */
    startGroup(label = null, collapsed = true) {
        if (this.enabled) {
            const cmd = collapsed ? "groupCollapsed" : "group";
            this.logger[cmd](this.formatMessage(label, !label));
            const newLogger = Object.create(this);
            newLogger._formatMessages = false;
            return newLogger;
        }
        return undefined;
    }

    /**
     * Closes the lowest level open logging group.
     */
    endGroup() {
        if (this.enabled) {
            this.logger.groupEnd();
        }
    }
}

export default {
    /**
     * Log message to enabled providers for LOG level.
     *
     * @param {Vue} Vue A frontend instance to be used with.
     * @param {object} options An object specifying which logging providers to use
     * ex. {useSentry: true, useConsole: true}.
     */
    install(Vue, options) {
        // setup sentry
        if (options.useSentry) {
            const sentry_show_errors = process.env.NODE_ENV !== "production";
            // Errors during component render functions, watchers, lifecycle hooks, and custom event
            // handlers. In 2.6.0+, this hook will capture errors thrown inside v-on DOM listeners.
            // (https://vuejs.org/v2/api/#errorHandler)
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: process.env.NODE_ENV,
                integrations: (defaults) => [
                    ...defaults.filter(
                        (integration) =>
                            integration.name !== "GlobalHandlers" && integration.name !== "TryCatch"
                    ),
                    new VueIntegration({
                        Vue: Vue,
                        attachProps: true,
                        logErrors: sentry_show_errors,
                    }),
                ],
            });
        }

        Vue.prototype.$logger = new Logger();
        Vue.prototype.$logger.enabled = options.useConsole;
        Vue.mixin({
            /**
             *
             */
            beforeCreate() {
                this.$logger = new Logger(
                    this.$vnode?.componentOptions?.Ctor?.extendOptions?.name,
                    { enabled: options.useConsole }
                );
            },
        });
    },
};
