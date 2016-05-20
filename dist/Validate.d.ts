export interface State {
    error?: string;
}
export interface SyncValidator<TValue, TState extends State> {
    (oldState: TState, value: TValue): TState;
}
export interface AsyncValidator<TValue, TState extends State> {
    (oldState: TState, value: TValue): Promise<TState>;
}
export interface ValidateResult<TModel> {
    newModel: TModel;
    updateModel?: Promise<UpdateModel<TModel>>;
}
export interface Validator<TModel> {
    (model: TModel): ValidateResult<TModel>;
}
export interface GetValue<TModel, TValue> {
    (model: TModel): TValue;
}
export interface GetState<TModel, TState extends State> {
    (model: TModel): TState;
}
export interface UpdateModel<TModel> {
    (model: TModel): TModel;
}
export interface SetState<TModel, TState extends State> {
    (state: TState): UpdateModel<TModel>;
}
export interface IsValid<TValue> {
    (value: TValue): boolean;
}
export declare function isNotEmpty(value: string): boolean;
export interface StringLengthBetweenOptions {
    minLength?: number;
    maxLength?: number;
}
export declare function isStringLengthBetween(options: StringLengthBetweenOptions): IsValid<string>;
export declare function isValidEmail(value: string): boolean;
export interface ValidatorOptions {
    errorMessage: string;
}
export declare function notEmpty<TState extends State>(options: ValidatorOptions): SyncValidator<string, TState>;
export interface StringLengthBetweenValidatorOptions extends ValidatorOptions, StringLengthBetweenOptions {
}
export declare function stringLengthBetween<TState extends State>(options: StringLengthBetweenValidatorOptions): SyncValidator<string, TState>;
export interface RegExpValidatorOptions extends ValidatorOptions {
    regExp: RegExp;
}
export declare function regexp<TState extends State>(options: RegExpValidatorOptions): SyncValidator<string, TState>;
export declare function isEmptyOr(isValid: IsValid<string>): IsValid<string>;
export declare function email<TState extends State>(options: ValidatorOptions): SyncValidator<string, TState>;
export interface BasicValidatorOptions<TValue> extends ValidatorOptions {
    isValid: IsValid<TValue>;
}
export declare function createBasicValidator<TValue, TState extends State>(options: BasicValidatorOptions<TValue>): SyncValidator<TValue, TState>;
export declare function isValid(state: State): boolean;
export declare function isInvalid(state: State): boolean;
export declare function isValidModel<TModel>(getStates: GetState<TModel, State>[]): ((model: TModel) => boolean);
export declare function isInvalidModel<TModel>(getStates: GetState<TModel, State>[]): ((model: TModel) => boolean);
export declare function listModelErrors<TModel>(getStates: GetState<TModel, State>[]): ((model: TModel) => string[]);
export declare function createValidator<TModel, TValue, TState extends State>(getValue: GetValue<TModel, TValue>, getState: GetState<TModel, TState>, setState: SetState<TModel, TState>, syncValidators: SyncValidator<TValue, TState>[], asyncValidators: AsyncValidator<TValue, TState>[]): Validator<TModel>;
export declare function combineValidators<TModel>(...validators: Validator<TModel>[]): Validator<TModel>;
