import { typeConstructionRequirements } from "./Inject";

describe("Inject", () => {
    it("uses a global cache", () => {
        expect(global.clarityTypeConstructionRequirements).toBeDefined();
        expect(global.clarityTypeConstructionRequirements === typeConstructionRequirements).toBe(true);
    });
});