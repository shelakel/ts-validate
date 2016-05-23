import { ValidatorOptions, SyncValidator } from "../Validate";
export declare function isNotEmpty(value: string): boolean;
export declare function notEmpty({errorMessage}: ValidatorOptions): SyncValidator<string>;
