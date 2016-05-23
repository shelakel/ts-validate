module.exports = function (assert, regExp) {
    describe("validator: regExp", function () {
        const validate = regExp({ regExp: new RegExp("^[0-9]+$"), errorMessage: "Number is invalid" });

        it("should return null when validating falsey values", function () {
            const inputs = [undefined, null, ""];
            for (input of inputs) {
                const error = validate(input);
                assert(error === null);
            }
        });

        it("should return an error when the value is not a valid number", function () {
            const error = validate("test");
            assert(error === "Number is invalid");
        });

        it("should return null when the value is a valid number", function () {
            const error = validate("1");
            assert(error === null);
        });

    });
};
