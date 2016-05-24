# ts-validate
Validation library for TypeScript/JavaScript supporting sync and async validation with state

## Current status
*Work-in-progress*

Polyfills required for ES5 compatibility:
 - for..of
 - Promise
 - Object.assign
 - Object.spread

## Background
Initially ts-validate started out as a port of shelakel/elm-validate.
This library aims to be easy to use.

Validation produces validation state "diffs" that is compatible with
most immutable implementations and redux time-travelling (JSON serialization of state).

## Example

See examples.

```typescript
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
```

## License

MIT