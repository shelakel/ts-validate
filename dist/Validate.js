"use strict";
function createSyncValidator(options) {
    const { isValid, errorMessage } = options;
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
    return function (value) {
        const error = validateSync(value, syncValidators || []);
        let validationState = { [stateKey]: error };
        let futureValidationState = null;
        if (!error && asyncValidators && asyncValidators.length > 0) {
            delete (validationState, stateKey);
            futureValidationState = validateAsync(value, asyncValidators)
                .then((error) => { return { [stateKey]: error }; });
        }
        return {
            validationState: validationState,
            futureValidationState: futureValidationState
        };
    };
}
exports.createValidator = createValidator;
function validateSync(value, validators) {
    let error = null;
    for (const validate of validators) {
        if (!!error) {
            break;
        }
        error = validate(value);
    }
    return error;
}
function validateAsync(value, validators) {
    if (validators.length === 0) {
        return null;
    }
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
            futureValidationStates: futureValidationStates
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
//# sourceMappingURL=Validate.js.map