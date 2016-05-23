module.exports = function (assert, notEmpty) {
    describe("validator: notEmpty", function () {
        const validate = notEmpty({ errorMessage: "Username is required" });

        it("should return error on falsey values", function () {
            const inputs = [undefined, null, ""];
            for (const input of inputs) {
                const error = validate(input);
                assert(error === "Username is required");
            }
        });

    });
};
