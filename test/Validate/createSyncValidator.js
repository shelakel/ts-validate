module.exports = function (assert, createSyncValidator) {
    describe("CreateSyncValidator", function () {
        const validate = createSyncValidator({
            isValid: (value) => !!value,
            errorMessage: "invalid"
        });

        it("should raise an error when option errorMessage is falsey", function () {
            const errorMessages = [undefined, null, ""];
            for (const errorMessage of errorMessages) {
                const throwError = function () {
                    return createSyncValidator({
                        isValid: (value) => !!value,
                        errorMessage
                    });
                };
                assert.throws(throwError, Error, "errorMessage must not be falsey (undefined, null or empty)");
            }
        });

        it("should return null when valid", function () {
            const error = validate("valid");
            assert(error === null, "expected error to be null");
        });

        it("should return not null when invalid", function () {
            const inputs = [undefined, null, ""];
            for (const input of inputs) {
                const error = validate(input);
                assert(error != null, "expected error to not be null or undefined");
            }
        });

    });
};
