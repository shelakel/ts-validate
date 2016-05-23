export interface ValidationState {
    [key: string]: string;
}
export interface ValidateResult {
    validationState: ValidationState;
    futureValidationState?: Promise<ValidationState>;
}
export interface SyncValidator<T> {
    (value: T): string;
}
export interface AsyncValidator<T> {
    (value: T): Promise<string>;
}
export interface Validator<T> {
    (value: T): ValidateResult;
}
export interface IsValid<T> {
    (value: T): boolean;
}
export interface ValidatorOptions {
    errorMessage: string;
}
export interface SyncValidatorOptions<T> extends ValidatorOptions {
    isValid: IsValid<T>;
}
export declare function createSyncValidator<T>(options: SyncValidatorOptions<T>): SyncValidator<T>;
export declare function isEmptyOr(isValid: IsValid<string>): IsValid<string>;
export declare function createValidator<T>(stateKey: string, syncValidators: SyncValidator<T>[], asyncValidators: AsyncValidator<T>[]): Validator<T>;
export declare function combineValidateResults(...results: ValidateResult[]): ValidateResult;
