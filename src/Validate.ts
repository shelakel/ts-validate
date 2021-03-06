export interface ValidationState { [key: string]: string; }
export interface ValidateResult {
    validationState: ValidationState;
    futureValidationState?: Promise<ValidationState>;
}

export interface SyncValidator<T> { (value: T): string; }
export interface AsyncValidator<T> { (value: T): Promise<string>; }
export interface Validator<T> { (value: T): ValidateResult; }

// validation functions

export interface IsValid<T> { (value: T): boolean; }
export interface ValidatorOptions { errorMessage: string; }

export interface SyncValidatorOptions<T> extends ValidatorOptions {
    isValid: IsValid<T>;
}

/**
 * createSyncValidator<T> creates a SyncValidator<T> to validate a value of type T.
 * @param {SyncValidatorOptions<T>} options Options to configure the SyncValidator<T>.
 * @returns {SyncValidator<T>} Returns a SyncValidator<T> to validate a value of type T.
 */
export function createSyncValidator<T>(options: SyncValidatorOptions<T>
): SyncValidator<T> {
    const { isValid, errorMessage } = options;
    if (!isFunction(isValid)) {
        throw new Error("isValid must be a function.");
    }
    if (!errorMessage) {
        throw new Error("errorMessage must not be falsey (undefined, null or empty)");
    }
    return function (value: T): string {
        if (isValid(value)) {
            return null;
        }
        return errorMessage;
    };
}

/**
 * isEmptyOr checks that the value is falsey (empty, null or undefined) or isValid.
 * @param {IsValid<string>} isValid A function to determine if the non-empty|null|undefined value is invalid.
 * @returns {boolean} Returns a boolean value indicating whether the value is valid.
 */
export function isEmptyOr(isValid: IsValid<string>): IsValid<string> {
    return function (value: string): boolean {
        return !value || isValid(value);
    };
}

// validation

/**
 * createValidator<T> creates a new validator to validate a value of type T.
 * @param {string} stateKey The key to the error in the validation state.
 * @param {SyncValidator<T>[]} syncValidators An array of SyncValidator<T> to validate the value.
 * @param {AsyncValidator<T>[]} asyncValidators An array of AsyncValidator<T> to validate the value.
 * @returns {(value: T) => Validator} Returns a function that takes the value to validate, and returns a Validator.
 */
export function createValidator<T>(
    stateKey: string,
    syncValidators: SyncValidator<T>[],
    asyncValidators: AsyncValidator<T>[]
): Validator<T> {
    if (!syncValidators) { syncValidators = []; }
    if (!asyncValidators) { asyncValidators = []; }
    const toValidationState: ((error: string) => ValidationState) = error => {
        return { [stateKey]: error };
    };
    if (syncValidators.length > 0 && asyncValidators.length === 0) {
        return function (value: T): ValidateResult {
            return {
                validationState: toValidationState(validateSync(value, syncValidators)),
                futureValidationState: null
            };
        };
    }
    if (asyncValidators.length > 0 && syncValidators.length === 0) {
        return function (value: T): ValidateResult {
            return {
                validationState: {},
                futureValidationState: validateAsync(value, asyncValidators)
                    .then<ValidationState>(toValidationState)
            };
        };
    }
    if (syncValidators.length > 0 && asyncValidators.length > 0) {
        return function (value: T): ValidateResult {
            const error = validateSync(value, syncValidators || []);
            let validationState = toValidationState(error);
            let futureValidationState: Promise<ValidationState> = null;
            if (!error) {
                // retain the old error when validating async to avoid the flash
                // when previous async validation state was invalid,
                // the current synchronous validation state is invalid
                // and the next async validation state is invalid
                delete (validationState.stateKey);
                futureValidationState = validateAsync(value, asyncValidators)
                    .then<ValidationState>(toValidationState);
            }
            return {
                validationState,
                futureValidationState
            };
        };
    }
    // syncValidators.length === 0 && asyncValidators.length === 0
    return function (value: T): ValidateResult {
        return { validationState: toValidationState(null), futureValidationState: null };
    };
}

function validateSync<T>(
    value: T,
    validators: SyncValidator<T>[]
): string {
    let error = null;
    for (const validate of validators) {
        if (error) { break; }
        error = validate(value);
    }
    return error;
}

function validateAsync<T>(
    value: T,
    validators: AsyncValidator<T>[]
): Promise<string> {
    return validators.reduce<Promise<string>>(
        (promise: Promise<string>, validate: AsyncValidator<T>) => {
            return promise.then<string>(
                error => {
                    if (!error) {
                        return validate(value);
                    } else {
                        return error;
                    }
                }
            );
        },
        Promise.resolve(null)
    );
}

interface CombineValidatorsResult {
    newValidationState: ValidationState;
    futureValidationStates: Promise<ValidationState>[];
}

/**
 * combineValidateResults combines the validation results of one or more validators.
 * @param {ValidateResult[]} results The validation results to combine.
 * @returns {ValidateResult} Returns the combined validation result.
 */
export function combineValidateResults(
    ...results: ValidateResult[]
): ValidateResult {
    const { newValidationState, futureValidationStates } =
        (results || []).reduce<CombineValidatorsResult>(
            ({newValidationState, futureValidationStates},
                {validationState, futureValidationState}) => {
                if (futureValidationState != null) {
                    futureValidationStates.push(futureValidationState);
                }
                return {
                    newValidationState: Object.assign(newValidationState, validationState),
                    futureValidationStates
                };
            },
            { newValidationState: {}, futureValidationStates: [] }
        );
    if (futureValidationStates.length === 0) {
        return {
            validationState: newValidationState,
            futureValidationState: null
        };
    }
    return {
        validationState: newValidationState,
        futureValidationState: Promise.all<ValidationState>(futureValidationStates)
            .then<ValidationState>(validationStates => Object.assign({}, ...validationStates))
    };
}

// helpers

function isFunction(obj) { return !!(obj && obj.constructor && obj.call && obj.apply); }
