"use strict";
const Validate_1 = require("../Validate");
function regExp(options) {
    const isValid = value => options.regExp.test(value);
    return Validate_1.createSyncValidator({
        isValid: Validate_1.isEmptyOr(isValid),
        errorMessage: options.errorMessage
    });
}
exports.regExp = regExp;
//# sourceMappingURL=RegExp.js.map