"use strict";
const Validate_1 = require("../Validate");
function isStringLength(options) {
    const minLength = (options.minLength || 0) | 0;
    const maxLength = (options.maxLength ? options.maxLength | 0 : null);
    if (minLength < 0) {
        throw new Error("minLength must be greater than or equal to 0");
    }
    if (maxLength != null) {
        if (maxLength < 0) {
            throw new Error("maxLength must be greater than or equal to 0");
        }
        if (maxLength < minLength) {
            throw new Error("maxLength must be greater than or equal to minLength");
        }
        if (minLength === 0) {
            return function (value) {
                return value && value.length <= maxLength;
            };
        }
        return function (value) {
            return value && value.length >= minLength && value.length <= maxLength;
        };
    }
    if (minLength === 0) {
        return function (value) { return true; };
    }
    return function (value) {
        return value && value.length >= minLength;
    };
}
exports.isStringLength = isStringLength;
function stringLength(options) {
    return Validate_1.createSyncValidator({
        isValid: isStringLength(options),
        errorMessage: options.errorMessage
    });
}
exports.stringLength = stringLength;
//# sourceMappingURL=StringLength.js.map