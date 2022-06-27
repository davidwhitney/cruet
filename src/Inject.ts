import { ConstructionRequirement } from "./ConstructionRequirement";

export const typeConstructionRequirements = new ConstructionRequirement();

export function Inject(registrationName: any) {
    return (target: any, __: string, paramIndex: number) => {
        typeConstructionRequirements.register(registrationName, target, paramIndex);
    };
}
