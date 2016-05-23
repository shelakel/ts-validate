import { IsValid, ValidatorOptions, SyncValidator } from "../Validate";
export interface StringLengthOptions {
    minLength?: number;
    maxLength?: number;
}
export declare function isStringLength(options: StringLengthOptions): IsValid<string>;
export interface StringLengthValidatorOptions extends ValidatorOptions, StringLengthOptions {
}
export declare function stringLength(options: StringLengthValidatorOptions): SyncValidator<string>;
