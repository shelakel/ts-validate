// todo: avoid Object.assign - user provided function
//       note es5 compatibility polyfills required
//       Promise<ValidateResult> musn't throw errors**

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

// validation functions

export interface IsValid<TValue> {
    (value: TValue): boolean;
}

export function isNotEmpty(value: string): boolean {
    return value.length > 0;
}

export interface StringLengthBetweenOptions {
    minLength?: number;
    maxLength?: number;
}

export function isStringLengthBetween(options: StringLengthBetweenOptions): IsValid<string> {
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
                return value.length <= maxLength;
            };
        }
        return function (value: string): boolean {
            return value.length >= minLength && value.length <= maxLength;
        };
    }
    if (minLength === 0) {
        return function (value: string): boolean { return true; };
    }
    return function (value: string): boolean {
        return value.length >= minLength;
    };
}

const reEmail = new RegExp("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", "i");

export function isValidEmail(value: string): boolean {
    return reEmail.test(value);
}

// basic validators

export interface ValidatorOptions {
    errorMessage: string;
}

export function notEmpty<TState extends State>(options: ValidatorOptions): SyncValidator<string, TState> {
    return createBasicValidator<string, TState>({
        isValid: isNotEmpty,
        errorMessage: options.errorMessage
    });
}

export interface StringLengthBetweenValidatorOptions extends ValidatorOptions, StringLengthBetweenOptions { }

export function stringLengthBetween<TState extends State>(options: StringLengthBetweenValidatorOptions): SyncValidator<string, TState> {
    return createBasicValidator<string, TState>({
        isValid: isStringLengthBetween(options),
        errorMessage: options.errorMessage
    });
}

export interface RegExpValidatorOptions extends ValidatorOptions {
    regExp: RegExp;
}

export function regexp<TState extends State>(options: RegExpValidatorOptions): SyncValidator<string, TState> {
    return createBasicValidator<string, TState>({
        isValid: options.regExp.test,
        errorMessage: options.errorMessage
    });
}

export function isEmptyOr(isValid: IsValid<string>): IsValid<string> {
    return function (value: string): boolean {
        return value.length === 0 || isValid(value);
    };
}

export function email<TState extends State>(options: ValidatorOptions): SyncValidator<string, TState> {
    return createBasicValidator<string, TState>({
        isValid: isEmptyOr(isValidEmail),
        errorMessage: options.errorMessage
    });
}

export interface BasicValidatorOptions<TValue> extends ValidatorOptions {
    isValid: IsValid<TValue>;
}

export function createBasicValidator<TValue, TState extends State>(options: BasicValidatorOptions<TValue>): SyncValidator<TValue, TState> {
    const { isValid, errorMessage } = options;
    return function (oldState: TState, value: TValue): TState {
        if (isValid(value)) {
            return oldState;
        }
        return Object.assign({}, oldState, { error: errorMessage });
    };
}

// helper functions

export function isValid(state: State): boolean {
    return state.error == null;
}

export function isInvalid(state: State): boolean {
    return state.error != null;
}

export function isValidModel<TModel>(getStates: GetState<TModel, State>[]): ((model: TModel) => boolean) {
    if (getStates.length === 0) {
        return function (model: TModel): boolean {
            return true;
        };
    }
    return function (model: TModel): boolean {
        for (const getState of getStates) {
            const state = getState(model);
            if (isInvalid(state)) {
                return false;
            }
        }
        return true;
    };
}

export function isInvalidModel<TModel>(getStates: GetState<TModel, State>[]): ((model: TModel) => boolean) {
    if (getStates.length === 0) {
        return function (model: TModel): boolean {
            return false;
        };
    }
    return function (model: TModel): boolean {
        for (const getState of getStates) {
            const state = getState(model);
            if (isValid(state)) {
                return false;
            }
        }
        return true;
    };
}

export function listModelErrors<TModel>(getStates: GetState<TModel, State>[]): ((model: TModel) => string[]) {
    return function (model: TModel): string[] {
        return getStates
            .map(getState => getState(model))
            .filter(isInvalid)
            .map(state => state.error);
    };
}

// validation

export function createValidator<TModel, TValue, TState extends State>(
    getValue: GetValue<TModel, TValue>,
    getState: GetState<TModel, TState>,
    setState: SetState<TModel, TState>,
    syncValidators: SyncValidator<TValue, TState>[],
    asyncValidators: AsyncValidator<TValue, TState>[]
): Validator<TModel> {
    return function (model: TModel): ValidateResult<TModel> {
        const initialState = getState(model);
        const value = getValue(model);
        const syncState = validateSync(value, Object.assign({}, initialState, { error: null }), syncValidators);
        if (isValid(syncState) && asyncValidators.length > 0) {
            // retain the old error when validating async to avoid the flash
            // when previous async validation state was invalid,
            // the current synchronous validation state is invalid
            // and the next async validation state is invalid
            const asyncState = Object.assign({}, syncState, { error: initialState.error });
            return {
                newModel: setState(asyncState)(model),
                updateModel: validateAsync(value, syncState, asyncValidators)
                    .then<UpdateModel<TModel>>((state) => Promise.resolve(setState(state)))
            };
        } else {
            return {
                newModel: setState(syncState)(model),
                updateModel: null
            };
        }
    };
}

function validateSync<TValue, TState extends State>(
    value: TValue,
    initialState: TState,
    validators: SyncValidator<TValue, TState>[]
): TState {
    let state = initialState;
    for (const validate of validators) {
        if (isInvalid(state)) {
            break;
        }
        state = validate(state, value);
    }
    return state;
}

function validateAsync<TValue, TState>(
    value: TValue,
    initialState: TState,
    validators: AsyncValidator<TValue, TState>[]
): Promise<TState> {
    if (validators.length === 0) {
        return null;
    }
    return validators.reduce<Promise<TState>>(
        (promise: Promise<TState>, validate: AsyncValidator<TValue, TState>) => {
            return promise.then<TState>(
                (state) => {
                    if (isValid(state)) {
                        return validate(state, value);
                    } else {
                        return Promise.resolve(state);
                    }
                }
            );
        },
        Promise.resolve(initialState)
    );
}

interface CombineValidatorsResult<TModel> {
    model: TModel;
    promises: Promise<UpdateModel<TModel>>[];
}

export function combineValidators<TModel>(
    ...validators: Validator<TModel>[]
): Validator<TModel> {
    return function (initialModel: TModel): ValidateResult<TModel> {
        const { model, promises } = validators.reduce<CombineValidatorsResult<TModel>>(
            ({model, promises}, validate) => {
                const {newModel, updateModel} = validate(model);
                if (updateModel == null) {
                    return { model: newModel, promises };
                }
                return { model: newModel, promises: promises.concat(updateModel) };
            },
            { model: initialModel, promises: [] }
        );
        if (promises.length === 0) {
            return {
                newModel: model,
                updateModel: null
            };
        }
        return {
            newModel: model,
            updateModel: Promise.all<UpdateModel<TModel>>(promises).then<UpdateModel<TModel>>(
                updateModels => {
                    return function (model: TModel): TModel {
                        return updateModels.reduce<TModel>(
                            (model, transform) => transform(model),
                            model
                        );
                    };
                })
        };
    };
}