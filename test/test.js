const assert = require("chai").assert;
const Validate = require("../dist/Validate");

const validators = {
    notEmpty: require("../dist/Validators/NotEmpty").notEmpty,
    email: require("../dist/Validators/Email").email,
    regExp: require("../dist/Validators/RegExp").regExp,
    stringLength: require("../dist/Validators/StringLength").stringLength
};

// Validate tests
require("./Validate/createSyncValidator")(assert, Validate.createSyncValidator);
require("./Validate/isEmptyOr")(assert, Validate.isEmptyOr);
require("./Validate/createValidator")(assert, Validate.createValidator, validators);
require("./Validate/combineValidateResults")(assert, Validate);

// Validator tests
require("./Validate/Validators/email")(assert, validators.email);
require("./Validate/Validators/notEmpty")(assert, validators.notEmpty);
require("./Validate/Validators/regExp")(assert, validators.regExp);
require("./Validate/Validators/stringLength")(assert, validators.stringLength);