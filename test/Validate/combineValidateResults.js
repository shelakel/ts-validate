module.exports = function (assert, Validate) {
    const createValidator = Validate.createValidator;
    const combineValidateResults = Validate.combineValidateResults;

    describe("combineValidateResults", function () {

        it("should combine sync validation results", function () {
            const validateUsername =
                createValidator("username", [value => value ? null : "Username is required"], []);
            const validatePassword =
                createValidator("password", [value => value ? null : "Password is required"], []);

            const combinedResult = combineValidateResults(validateUsername(""), validatePassword(""))
            assert(combinedResult.validationState.username === "Username is required");
            assert(combinedResult.validationState.password === "Password is required");
            assert(combinedResult.futureValidationState === null);
        });

        it("should combine async validation results", function () {
            const validateUsername =
                createValidator("username", [], [value => Promise.resolve(value ? null : "Username is required")]);
            const validatePassword =
                createValidator("password", [], [value => Promise.resolve(value ? null : "Password is required")]);

            const combinedResult = combineValidateResults(validateUsername(""), validatePassword(""));
            assert(!Object.hasOwnProperty(combinedResult.validationState.username));
            assert(!Object.hasOwnProperty(combinedResult.validationState.password));
            assert(combinedResult.futureValidationState !== null);
            return combinedResult.futureValidationState.then(validationState => {
                assert(validationState.username === "Username is required");
                assert(validationState.password === "Password is required");
            });
        });

    });
};
