"use strict";
function isNotEmpty(value) {
    return value.length > 0;
}
exports.isNotEmpty = isNotEmpty;
function isStringLengthBetween(options) {
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
                return value.length <= maxLength;
            };
        }
        return function (value) {
            return value.length >= minLength && value.length <= maxLength;
        };
    }
    if (minLength === 0) {
        return function (value) { return true; };
    }
    return function (value) {
        return value.length >= minLength;
    };
}
exports.isStringLengthBetween = isStringLengthBetween;
const reEmail = new RegExp("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", "i");
function isValidEmail(value) {
    return reEmail.test(value);
}
exports.isValidEmail = isValidEmail;
function notEmpty(options) {
    return createBasicValidator({
        isValid: isNotEmpty,
        errorMessage: options.errorMessage
    });
}
exports.notEmpty = notEmpty;
function stringLengthBetween(options) {
    return createBasicValidator({
        isValid: isStringLengthBetween(options),
        errorMessage: options.errorMessage
    });
}
exports.stringLengthBetween = stringLengthBetween;
function regexp(options) {
    return createBasicValidator({
        isValid: options.regExp.test,
        errorMessage: options.errorMessage
    });
}
exports.regexp = regexp;
function isEmptyOr(isValid) {
    return function (value) {
        return value.length === 0 || isValid(value);
    };
}
exports.isEmptyOr = isEmptyOr;
function email(options) {
    return createBasicValidator({
        isValid: isEmptyOr(isValidEmail),
        errorMessage: options.errorMessage
    });
}
exports.email = email;
function createBasicValidator(options) {
    const { isValid, errorMessage } = options;
    return function (oldState, value) {
        if (isValid(value)) {
            return oldState;
        }
        return Object.assign({}, oldState, { error: errorMessage });
    };
}
exports.createBasicValidator = createBasicValidator;
function isValid(state) {
    return state.error == null;
}
exports.isValid = isValid;
function isInvalid(state) {
    return state.error != null;
}
exports.isInvalid = isInvalid;
function isValidModel(getStates) {
    if (getStates.length === 0) {
        return function (model) {
            return true;
        };
    }
    return function (model) {
        for (const getState of getStates) {
            const state = getState(model);
            if (isInvalid(state)) {
                return false;
            }
        }
        return true;
    };
}
exports.isValidModel = isValidModel;
function isInvalidModel(getStates) {
    if (getStates.length === 0) {
        return function (model) {
            return false;
        };
    }
    return function (model) {
        for (const getState of getStates) {
            const state = getState(model);
            if (isValid(state)) {
                return false;
            }
        }
        return true;
    };
}
exports.isInvalidModel = isInvalidModel;
function listModelErrors(getStates) {
    return function (model) {
        return getStates
            .map(getState => getState(model))
            .filter(isInvalid)
            .map(state => state.error);
    };
}
exports.listModelErrors = listModelErrors;
function createValidator(getValue, getState, setState, syncValidators, asyncValidators) {
    return function (model) {
        const initialState = getState(model);
        const value = getValue(model);
        const syncState = validateSync(value, Object.assign({}, initialState, { error: null }), syncValidators);
        if (isValid(syncState) && asyncValidators.length > 0) {
            const asyncState = Object.assign({}, syncState, { error: initialState.error });
            return {
                newModel: setState(asyncState)(model),
                updateModel: validateAsync(value, syncState, asyncValidators)
                    .then((state) => Promise.resolve(setState(state)))
            };
        }
        else {
            return {
                newModel: setState(syncState)(model),
                updateModel: null
            };
        }
    };
}
exports.createValidator = createValidator;
function validateSync(value, initialState, validators) {
    let state = initialState;
    for (const validate of validators) {
        if (isInvalid(state)) {
            break;
        }
        state = validate(state, value);
    }
    return state;
}
function validateAsync(value, initialState, validators) {
    if (validators.length === 0) {
        return null;
    }
    return validators.reduce((promise, validate) => {
        return promise.then((state) => {
            if (isValid(state)) {
                return validate(state, value);
            }
            else {
                return Promise.resolve(state);
            }
        });
    }, Promise.resolve(initialState));
}
function combineValidators(...validators) {
    return function (initialModel) {
        const { model, promises } = validators.reduce(({ model, promises }, validate) => {
            const { newModel, updateModel } = validate(model);
            if (updateModel == null) {
                return { model: newModel, promises: promises };
            }
            return { model: newModel, promises: promises.concat(updateModel) };
        }, { model: initialModel, promises: [] });
        if (promises.length === 0) {
            return {
                newModel: model,
                updateModel: null
            };
        }
        return {
            newModel: model,
            updateModel: Promise.all(promises).then(updateModels => {
                return function (model) {
                    return updateModels.reduce((model, transform) => transform(model), model);
                };
            })
        };
    };
}
exports.combineValidators = combineValidators;
//# sourceMappingURL=Validate.js.map