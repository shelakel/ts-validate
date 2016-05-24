import {createValidator, combineValidateResults, ValidationState, Validator, ValidateResult} from "../../src/Validate";
import {Action, guard, HasValidationState} from "./Common";

const actions = {
    SET_USERNAME: "e30ec56d-8ded-4e3e-b577-83527ea94aa1",
    SET_PASSWORD: "41d235b1-5b35-46f6-8bd3-3a13b7d67a52",
    UPDATE_VALIDATION_STATE: "86b9ba3f-a46a-4b33-ac88-e1fd6910576b"
};

export interface SetUsername extends HasValidationState { username: string; }
export interface SetPassword extends HasValidationState { password: string; }

export const guards = {
    isSetUsername: guard<SetUsername>(actions.SET_USERNAME),
    isSetPassword: guard<SetPassword>(actions.SET_PASSWORD),
    isUpdateValidationState: guard<HasValidationState>(actions.UPDATE_VALIDATION_STATE)
};

const validateUsername = createValidator<string>(
    "username",
    [value => value ? null : "Username is required"],
    []
);

const validatePassword = createValidator<string>(
    "password",
    [value => value ? null : "Password is required"],
    []
);

const validateModel: ((model: any) => ValidateResult) =
    model => combineValidateResults(
        validateUsername(model.username),
        validatePassword(model.password)
    );

export function setUsername(username: string) {
    return dispatchWithValidationState(actions.SET_USERNAME, { username }, validateUsername(username));
}

export function setPassword(password: string) {
    return dispatchWithValidationState(actions.SET_PASSWORD, { password }, validatePassword(password));
}

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
                dispatch({ type: actions.UPDATE_VALIDATION_STATE, payload: { validationState } }));
        }
    };
}
