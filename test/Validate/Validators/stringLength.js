module.exports = function (assert, stringLength) {
    describe("validator: stringLength", function () {

        it("should return an error when the length is less than 2 characters", function () {
            const validate = stringLength({ errorMessage: "Text must be longer than 2 characters", minLength: 3 });
            const inputs = [undefined, null, "", "a"];
            for (const input of inputs) {
                const error = validate(input);
                assert(error === "Text must be longer than 2 characters");
            }
            assert(validate("abc") === null);
        });

        it("should return an error when the length is longer than 6 characters", function () {
            const validate = stringLength({ errorMessage: "Postal code is invalid", maxLength: 6 });
            const error = validate("1234567");
            assert(error === "Postal code is invalid");
            assert(validate("123456") === null);
        });

        it("should return an error when the length is not between 2 and 3 characters", function () {
            const validate = stringLength({ errorMessage: "Country code must be 2 or 3 characters", minLength: 2, maxLength: 3 });
            const inputs = [undefined, null, "", "a", "abcd"];
            for (const input of inputs) {
                const error = validate(input);
                assert(error === "Country code must be 2 or 3 characters");
            }
            assert(validate("ZA") === null);
        });

    });
};
