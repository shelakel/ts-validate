import { ValidatorOptions, SyncValidator } from "../Validate";
export interface RegExpValidatorOptions extends ValidatorOptions {
    regExp: RegExp;
}
export declare function regExp(options: RegExpValidatorOptions): SyncValidator<string>;
