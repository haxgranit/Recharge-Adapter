import _ from "lodash";

/**
 * Recursively apply a function to the values of an object.
 * @param {object} obj - The target object.
 * @param {Function} iterator - The function applied to each value.
 * @param {object} context - An object used for the `this` variable.
 * @returns {object} - The target object with all values replaced with the result of
 * iterator(value).
 */
function deepMapValues(obj, iterator, context) {
    return _.transform(obj, function (result, val, key) {
        const _result = iterator.call(context, val, key, obj);
        if (_.isObject(val) && !_.isUndefined(_result) && !_.isMatch(_result, val)) {
            result[key] = _result;
        } else {
            result[key] = _.isObject(val) ? deepMapValues(val, iterator, context) : _result;
        }
    });
}

/**
 * Checks if a object is a nested object.
 * @param {object} obj - Object to check.
 * @returns {boolean}
 */
function isNestedObject(obj) {
    return _.isObject(obj) && _.values(obj).some((i) => _.isObject(i));
}

/**
 * Recursively runs `_.omitBy` on the target object.
 * @param {object} obj - The target object.
 * @param {Function} predicate - The function used to determine if a value is omitted. Must return
 * a boolean.
 * @param {object} context - An object used for the `this` variable.
 * @returns {object} - The target object with all values removed where predicate = true.
 */
function deepOmitBy(obj, predicate, context) {
    let newValue = _.omitBy(obj, predicate);
    newValue = deepMapValues(
        newValue,
        (item) => (_.isObject(item) ? _.omitBy(item, predicate) : item),
        context
    );
    if (!_.isEqual(obj, newValue)) {
        newValue = deepOmitBy(newValue, predicate, context);
    }

    return newValue;
}

_.mixin({
    deepMapValues,
    isNestedObject,
    deepOmitBy,
});

export default _;
