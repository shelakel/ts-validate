import { IsValid, isEmptyOr, ValidatorOptions, createSyncValidator, SyncValidator } from "../Validate";

export interface RegExpValidatorOptions extends ValidatorOptions { regExp: RegExp; }

/**
 * regExp creates a new SyncValidator<string> to validate a value is empty, null or undefined (falsey) or matches the RegExp.
 * @param {RegExpValidatorOptions} options The options to configure the regExp SyncValidator<string>.
 * @returns {SyncValidator<string>} Returns a SyncValidator<string> to validate a value is empty, null or undefined (falsey) or matches the RegExp.
 */
export function regExp(options: RegExpValidatorOptions): SyncValidator<string> {
    const isValid: IsValid<string> = value => options.regExp.test(value);
    return createSyncValidator<string>({
        isValid: isEmptyOr(isValid),
        errorMessage: options.errorMessage
    });
}
