"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createSyncValidator(options) {
    const { isValid, errorMessage } = options;
    if (!isFunction(isValid)) {
        throw new Error("isValid must be a function.");
    }
    if (!errorMessage) {
        throw new Error("errorMessage must not be falsey (undefined, null or empty)");
    }
    return function (value) {
        if (isValid(value)) {
            return null;
        }
        return errorMessage;
    };
}
exports.createSyncValidator = createSyncValidator;
function isEmptyOr(isValid) {
    return function (value) {
        return !value || isValid(value);
    };
}
exports.isEmptyOr = isEmptyOr;
function createValidator(stateKey, syncValidators, asyncValidators) {
    if (!syncValidators) {
        syncValidators = [];
    }
    if (!asyncValidators) {
        asyncValidators = [];
    }
    const toValidationState = error => {
        return { [stateKey]: error };
    };
    if (syncValidators.length > 0 && asyncValidators.length === 0) {
        return function (value) {
            return {
                validationState: toValidationState(validateSync(value, syncValidators)),
                futureValidationState: null
            };
        };
    }
    if (asyncValidators.length > 0 && syncValidators.length === 0) {
        return function (value) {
            return {
                validationState: {},
                futureValidationState: validateAsync(value, asyncValidators)
                    .then(toValidationState)
            };
        };
    }
    if (syncValidators.length > 0 && asyncValidators.length > 0) {
        return function (value) {
            const error = validateSync(value, syncValidators || []);
            let validationState = toValidationState(error);
            let futureValidationState = null;
            if (!error) {
                delete (validationState.stateKey);
                futureValidationState = validateAsync(value, asyncValidators)
                    .then(toValidationState);
            }
            return {
                validationState,
                futureValidationState
            };
        };
    }
    return function (value) {
        return { validationState: toValidationState(null), futureValidationState: null };
    };
}
exports.createValidator = createValidator;
function validateSync(value, validators) {
    let error = null;
    for (const validate of validators) {
        if (error) {
            break;
        }
        error = validate(value);
    }
    return error;
}
function validateAsync(value, validators) {
    return validators.reduce((promise, validate) => {
        return promise.then(error => {
            if (!error) {
                return validate(value);
            }
            else {
                return error;
            }
        });
    }, Promise.resolve(null));
}
function combineValidateResults(...results) {
    const { newValidationState, futureValidationStates } = (results || []).reduce(({ newValidationState, futureValidationStates }, { validationState, futureValidationState }) => {
        if (futureValidationState != null) {
            futureValidationStates.push(futureValidationState);
        }
        return {
            newValidationState: Object.assign(newValidationState, validationState),
            futureValidationStates
        };
    }, { newValidationState: {}, futureValidationStates: [] });
    if (futureValidationStates.length === 0) {
        return {
            validationState: newValidationState,
            futureValidationState: null
        };
    }
    return {
        validationState: newValidationState,
        futureValidationState: Promise.all(futureValidationStates)
            .then(validationStates => Object.assign({}, ...validationStates))
    };
}
exports.combineValidateResults = combineValidateResults;
function isFunction(obj) { return !!(obj && obj.constructor && obj.call && obj.apply); }
//# sourceMappingURL=Validate.js.map