module.exports = function (assert, createValidator, validators) {
    describe("createValidator", function () {

        describe("with no validators", function () {

            it("should always return valid result", function () {
                const validate = createValidator("username", [], []);
                const result = validate("");
                assert(result.validationState.username === null);
                assert(result.futureValidationState === null);
            });

        });

        describe("with only sync validators", function () {

            it("should return \"Username is required\" given an empty username", function () {
                const validate = createValidator("username", [
                    validators.notEmpty({ errorMessage: "Username is required" })
                ], []);
                const result = validate("");
                assert(result.validationState.username === "Username is required");
                assert(result.futureValidationState === null);
            });

            it("should return \"Username must be between 3 and 12 characters\" given \"S\" as username", function () {
                const validate = createValidator("username", [
                    validators.notEmpty({ errorMessage: "Username is required" }),
                    validators.stringLength({ minLength: 3, maxLength: 12, errorMessage: "Username must be between 3 and 12 characters" })
                ], []);
                const result = validate("S");
                assert(result.validationState.username === "Username must be between 3 and 12 characters");
                assert(result.futureValidationState === null);
            });

        });

        describe("with only async validators", function () {

            it("should (temporarily) return initial validation state when sync validation succeeded", function () {
                const validate = createValidator("username", [], [
                    value => Promise.resolve(null)
                ]);
                const result = validate("test");
                assert(!Object.hasOwnProperty(result.validationState.username));
                assert(result.futureValidationState != null);
                return result.futureValidationState.then(validationState => assert(validationState.username === null));
            });

            it("should eventually return \"Username is required\" given an empty username", function () {
                const validate = createValidator("username", [], [
                    value => Promise.resolve(value ? "null" : "Username is required")
                ]);
                const result = validate("");
                assert(!Object.hasOwnProperty(result.validationState.username));
                assert(result.futureValidationState != null);
                return result.futureValidationState.then(validationState => assert(validationState.username === "Username is required"));
            });

        });

        describe("with sync and async validators", function () {

            it("should only execute async validation after sync validation succeeded", function () {
                const validate = createValidator("username",
                    [value => value ? null : "Username is required"],
                    [value => Promise.resolve(value != "test" ? null : "Username \"test\" is not available")]);

                // sync first
                let result = validate("");
                assert(result.validationState.username === "Username is required");
                assert(result.futureValidationState === null); // async validation not run

                // async after sync succeeds
                result = validate("test");
                assert(result.validationState.username === null);
                return result.futureValidationState.then(validationState => assert(validationState.username === "Username \"test\" is not available"));
            });

        });

    });
};
