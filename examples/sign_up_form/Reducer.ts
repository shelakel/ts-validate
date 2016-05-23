import {ValidationState} from "../../src/Validate";
import {Action, HasValidationState} from "./Common";
import {actions, guards} from "./Actions";

interface Model {
    username: string;
    password: string;
    validationState: ValidationState;
}

const initialModel: Model = {
    username: "",
    password: "",
    validationState: {}
};

function reducer(model = initialModel, action: Action<any>) {
    if (guards.SET_USERNAME(action)) {
        return merge(model, {
            username: action.payload.username,
            validationState: mergeValidationState(model, action)
        });
    }
    if (guards.SET_PASSWORD(action)) {
        return merge(model, {
            username: action.payload.password,
            validationState: mergeValidationState(model, action)
        });
    }
    if (guards.UPDATE_VALIDATION_STATE(action)) {
        return merge(model, {
            validationState: mergeValidationState(model, action)
        });
    }
    return model;
}

// helpers
function merge(model: Model, ...changes: {}[]) {
    return Object.assign({}, ...[model, ...changes]);
}

function mergeValidationState(model: Model, action: Action<HasValidationState>) {
    return Object.assign({}, model.validationState, action.payload.validationState);;
}
