import { ValidatorOptions, createSyncValidator, SyncValidator } from "../Validate";

/**
 * isNotEmpty checks that the value is not empty, null or undefined (falsey).
 * @param {string} value The value to check.
 * @returns {boolean} Returns a boolean value indicating whether the value is not empty, null or undefined.
 */
export function isNotEmpty(value: string): boolean { return !!value; }

/**
 * notEmpty creates a new SyncValidator<string> to validate a value is not empty, null or undefined (falsey).
 * @param {ValidatorOptions} options The options to configure the notEmpty SyncValidator<string>.
 * @returns {SyncValidator<string>} Returns a SyncValidator<string> to validate a value is not empty, null or undefined (falsey).
 */
export function notEmpty({ errorMessage }: ValidatorOptions): SyncValidator<string> {
    return createSyncValidator<string>({
        isValid: isNotEmpty,
        errorMessage: errorMessage
    });
}
