module.exports = function (assert, isEmptyOr) {
    describe("isEmptyOr", function () {

        it("should always return true when the value is falsey (undefined, null or empty)", function () {
            const inputs = [undefined, null, ""];
            const isValid = isEmptyOr((value) => false);
            for (const input of inputs) {
                assert(isValid(input), "expected isEmptyOr to always return true when the value is falsey (undefined, null or empty)");
            }
            assert(!isValid("valid"), "expected isEmptyOr to return false when isValid always returns false for non-falsey values.");
        });

    });
};
