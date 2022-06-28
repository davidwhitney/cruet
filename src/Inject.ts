import { ConstructionRequirement } from "./ConstructionRequirement";

let globalStorage = typeof window !== "undefined" ? window : global;
if (!globalStorage.clarityTypeConstructionRequirements) {
    globalStorage.clarityTypeConstructionRequirements = new ConstructionRequirement();
}

export const typeConstructionRequirements = globalStorage.clarityTypeConstructionRequirements;

export function Inject(registrationName: any) {
    return (target: any, __: string, paramIndex: number) => {
        typeConstructionRequirements.register(registrationName, target, paramIndex);
    };
}
