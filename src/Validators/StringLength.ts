import { IsValid, ValidatorOptions, createSyncValidator, SyncValidator } from "../Validate";

export interface StringLengthOptions {
    minLength?: number;
    maxLength?: number;
}

/**
 * isStringLength takes options containing the minLength and maxLength constraints and
 * returns a IsValid<string> function that checks that the value is between minLength and maxLength.
 * @param {StringLengthOptions} options The options containing minLength and maxLength constraints.
 * @returns {boolean} Returns a IsValid<string> function that checks that the value is between minLength and maxLength.
 */
export function isStringLength(options: StringLengthOptions): IsValid<string> {
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
            return function (value: string): boolean {
                return value && value.length <= maxLength;
            };
        }
        return function (value: string): boolean {
            return value && value.length >= minLength && value.length <= maxLength;
        };
    }
    if (minLength === 0) {
        return function (value: string): boolean { return true; };
    }
    return function (value: string): boolean {
        return value && value.length >= minLength;
    };
}

export interface StringLengthValidatorOptions extends ValidatorOptions, StringLengthOptions { }

/**
 * stringLength creates a new SyncValidator<string> to validate a value is between minLength and maxLength.
 * @param {StringLengthValidatorOptions} options The options to configure the stringLength SyncValidator<string>.
 * @returns {SyncValidator<string>} Returns a SyncValidator<string> to validate a value is between minLength and maxLength.
 */
export function stringLength(options: StringLengthValidatorOptions): SyncValidator<string> {
    return createSyncValidator<string>({
        isValid: isStringLength(options),
        errorMessage: options.errorMessage
    });
}
