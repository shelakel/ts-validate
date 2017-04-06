"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validate_1 = require("../Validate");
function isNotEmpty(value) { return !!value; }
exports.isNotEmpty = isNotEmpty;
function notEmpty({ errorMessage }) {
    return Validate_1.createSyncValidator({
        isValid: isNotEmpty,
        errorMessage: errorMessage
    });
}
exports.notEmpty = notEmpty;
//# sourceMappingURL=NotEmpty.js.map