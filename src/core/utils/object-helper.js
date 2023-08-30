/**
 *
 */
import _ from "lodash";
require("@/core/libs/lodash-mixins");

/**
 *
 */
class _ObjectMixin {
    /**
     * @param {object} obj Object.
     * @param {Function} condition Condition.
     * @returns {object}
     */
    static removeValues(obj, condition) {
        const convert = (_obj) => {
            // eslint-disable-next-line
            const entries = Object.entries(_obj).filter(([k, v]) => {
                return (typeof v === "object" && v !== null) || !condition(v);
            });
            return Object.fromEntries(
                entries.map(([k, v]) => {
                    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
                        return [k, convert(v)];
                    }
                    return !/^\s*$/.test(v) ? [k, v] : [];
                })
            );
        };

        if (obj !== null && typeof obj === "object") {
            return convert(obj);
        }
        return obj;
    }

    /**
     * @param {object} obj Object.
     * @returns {object}
     */
    static removeUndefined(obj) {
        return this.removeValues(obj, (value) => value === undefined);
    }

    /**
     * @param {object} obj Object.
     * @returns {object}
     */
    static removeNull(obj) {
        return this.removeValues(obj, (value) => [undefined, null].includes(value));
    }

    /**
     * @param {string} path Path.
     * @param {* | null} defaultValue Default Value.
     *
     * @returns {*}
     */
    get(path, defaultValue = null) {
        return _.get(this, path, defaultValue);
    }
}

/**
 *
 */
export class MappedObject extends _ObjectMixin {
    outputModel = Object();
    data = {};
    keyPriority = { 1: this.outputModel };
    transformers = [
        {
            condition: () => false,
            transform: (obj) => obj,
        },
    ];

    /**
     * @param {object} inputData Data input.
     * @param {string} key Key.
     * @returns {object}
     */
    static from(inputData, key) {
        const self = new this();
        const map = self.getMap(key);
        const mappedObj = _.deepMapValues(map, (item) =>
            _.isString(item) ? _.get(inputData, item) : item
        );
        self.data = mappedObj;
        self.transformers.map((_t) => _t.condition() && _t.transform());
        return _.deepOmitBy(
            self.data,
            (item) => _.isNil(item) || (_.isObject(item) && _.isEmpty(item))
        );
    }

    /**
     * @param {string} path Path.
     * @param {* | null} defaultValue Default Value.
     *
     * @returns {*}
     */
    get(path, defaultValue = null) {
        if (_.isArray(path)) {
            return path.map((p) => _.get(this.data, p, defaultValue));
        }
        return _.get(this.data, path, defaultValue);
    }

    /**
     * @param {string} path Path.
     * @param {boolean} value Value.
     */
    set(path, value) {
        _.set(this.data, path, value);
    }

    /**
     * @param {string} path Path.
     * @param {Function} transformer Function.
     * @param {boolean} asFunction Is Function or not.
     *
     * @returns {*}
     */
    transform(path, transformer, asFunction = true) {
        const func = () =>
            typeof transformer === "function"
                ? this.set(path, transformer(this.get(path)))
                : this.set(path, transformer);
        return asFunction ? func : func();
    }

    /**
     * @param {string} path Path.
     * @param {Function} checker Function.
     * @param {boolean} asFunction Is Function or not.
     *
     * @returns {*}
     */
    condition(path, checker, asFunction = true) {
        const func = () =>
            typeof checker === "function" ? checker(this.get(path)) : this.get(path) === checker;
        return asFunction ? func : func();
    }

    /**
     * @param {string} valueType Value Type.
     *
     * @returns {object}
     */
    getMap(valueType) {
        return _.deepOmitBy(
            _.deepMapValues(this.map, (item) => (_.isNestedObject(item) ? item : item[valueType])),
            _.isUndefined
        );
    }
}

/**
 *
 */
export class MergedObject extends _ObjectMixin {
    /**
     * @param {object} objectValues Values of objects.
     * @param {object} root0 Object containing includeNull.
     * @param {boolean} root0.includeNull Boolean.
     * @returns {object}
     */
    static byPriority(objectValues, { includeNull = false } = {}) {
        const keys = Object.keys(objectValues).sort().reverse();
        let objectList = keys.map((key) => {
            if (!includeNull) {
                return this.removeNull(objectValues[key]);
            }
            return objectValues[key];
        });
        if (!includeNull) {
            objectList = objectList.map((item) => this.removeNull(item));
        }
        return _.merge({}, ...objectList);
    }

    /**
     * @param {object} obj Object.
     * @param {object} mapping Mapping of the keys.
     * @returns {object} All the merged maps.
     */
    static remap(obj, mapping) {
        const remap = true;
        const merged = remap ? _.cloneDeep(obj) : {};

        // map of key value
        const maps = Object.entries(mapping);
        maps.forEach(([dest, src]) => {
            const value = _.get(obj, src);
            MergedObject._set(merged, dest, value);
        });

        return merged;
    }

    /**
     * @param {object} obj Object.
     * @param {object} key Key.
     * @param {string} value Value.
     * @returns {object}
     */
    static _set(obj, key, value) {
        // only support name.name1.name2
        const partials = key.split(".");
        let base = obj;
        partials.forEach((partial, i) => {
            if (i + 1 === partials.length) {
                // preserve any existing value for migration
                // to standardized naming conventions
                base[partial] = MergedObject._exists(base[partial]) ? base[partial] : value;
                return;
            }
            base[partial] = MergedObject._exists(base[partial]) ? base[partial] : {};
            base = base[partial];
        });
        return obj;
    }

    /**
     * @param {string} value Value.
     * @returns {boolean}
     */
    static _exists(value) {
        return value !== undefined && value !== null;
    }
}
