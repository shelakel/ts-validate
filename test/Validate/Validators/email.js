module.exports = function (assert, email) {
    describe("validator: email", function () {
        const validate = email({ errorMessage: "Email is invalid" });

        it("should return null when validating falsey values", function () {
            const inputs = [undefined, null, ""];
            for (input of inputs) {
                const error = validate(input);
                assert(error === null);
            }
        });

        it("should return an error when the value is not a valid email address", function () {
            const error = validate("test");
            assert(error === "Email is invalid");
        });

        it("should return null when the value is a valid email address", function () {
            const error = validate("test@test.com");
            assert(error === null);
        });

    });
};
