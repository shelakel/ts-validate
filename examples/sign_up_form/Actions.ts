import {createValidator, combineValidateResults, ValidationState, Validator, ValidateResult} from "../../src/Validate";
import {Action, guard, HasValidationState} from "./Common";

export const actions = {
    SIGNUP_SET_USERNAME: "SIGNUP_SET_USERNAME",
    SIGNUP_SET_PASSWORD: "SIGNUP_SET_PASSWORD",
    SIGNUP_UPDATE_VALIDATION_STATE: "SIGNUP_UPDATE_VALIDATION_STATE"
};

export interface SetUsername extends HasValidationState { username: string; }
export interface SetPassword extends HasValidationState { password: string; }

export const guards = {
    SET_USERNAME: guard<SetUsername>(actions.SIGNUP_SET_USERNAME),
    SET_PASSWORD: guard<SetPassword>(actions.SIGNUP_SET_PASSWORD),
    UPDATE_VALIDATION_STATE: guard<HasValidationState>(actions.SIGNUP_UPDATE_VALIDATION_STATE)
};


const validateUsername = createValidator<string>(
    "username",
    [value => !!value ? null : "Username is required"],
    []
);

const validatePassword = createValidator<string>(
    "password",
    [value => !!value ? null : "Password is required"],
    []
);

const validateModel: ((model: any) => ValidateResult) =
    model => combineValidateResults(
        validateUsername(model.username),
        validatePassword(model.password)
    );

// redux-thunk
function dispatchWithValidationState(
    action: string,
    merge: {},
    {validationState, futureValidationState }: ValidateResult):
    ((dispatch: ((action: Action<HasValidationState>) => void)) => void) {
    return function (dispatch: ((action: Action<HasValidationState>) => void)) {
        dispatch({ type: action, payload: Object.assign(merge, { validationState }) });
        if (futureValidationState) {
            futureValidationState.then((validationState: ValidationState) =>
                dispatch({ type: action, payload: { validationState } }));
        }
    };
}

export function setUsername(username: string) {
    return dispatchWithValidationState(actions.SIGNUP_SET_USERNAME, { username }, validateUsername(username));
}

export function setPassword(password: string) {
    return dispatchWithValidationState(actions.SIGNUP_SET_PASSWORD, { password }, validatePassword(password));
}