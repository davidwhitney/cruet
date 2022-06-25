import hello from "./index";

describe("hello", () => {
    it("should be defined", () => {
        expect(hello).toBeDefined();
    });

    it("should be an object", () => {
        expect(hello).toBeInstanceOf(Object);
    });
});