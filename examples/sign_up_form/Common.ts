import {ValidationState} from "../../src/Validate";

export interface Action<T> {
    type: string;
    payload: T;
}

export interface HasValidationState {
    validationState: ValidationState;
}

export function guard<T>(type: string):
    ((action: Action<any>) => action is Action<T>) {
    return function (action: Action<any>): action is Action<T> {
        return action.type === type;
    };
}
