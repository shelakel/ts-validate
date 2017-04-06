"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegExp_1 = require("./RegExp");
const reEmail = new RegExp("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", "i");
function isValidEmail(value) {
    return value && reEmail.test(value);
}
exports.isValidEmail = isValidEmail;
function email(options) {
    const { errorMessage } = options;
    return RegExp_1.regExp({ regExp: reEmail, errorMessage });
}
exports.email = email;
//# sourceMappingURL=Email.js.map