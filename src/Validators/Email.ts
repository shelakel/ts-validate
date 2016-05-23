import { ValidatorOptions, SyncValidator } from "../Validate";
import { regExp } from "./RegExp";

const reEmail = new RegExp("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", "i");

/**
 * isValidEmail determines if a string value is a valid email address.
 * @param {string} value The value to check. An empty, null and undefined value is considered an invalid email address.
 * @returns {boolean} Returns a boolean value indicating whether the value is a valid email address.
 */
export function isValidEmail(value?: string): boolean {
    return value && reEmail.test(value);
}

/**
 * email creates a new SyncValidator<string> to validate a value is empty, null, undefined or a valid email address.
 * @param {ValidatorOptions} options The options to configure the email SyncValidator<string>.
 * @returns {SyncValidator<string>} Returns a SyncValidator<string> to validate a value is empty, null, undefined or a valid email address.
 */
export function email(options: ValidatorOptions): SyncValidator<string> {
    const { errorMessage } = options;
    return regExp({ regExp: reEmail, errorMessage });
}
