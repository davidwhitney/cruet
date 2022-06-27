import { IActivationStrategy } from "../types";
import { typeConstructionRequirements } from "../Inject";
import { Container, isUsingRegistration } from "../Container";

export class TransientActivationStrategy implements IActivationStrategy {
    private parent: Container;

    constructor(parent: Container) {
        this.parent = parent;
    }

    public activate(key: string) {
        if (!this.parent.registrations.get(key)) {
            throw new Error("No registration found for key: " + key);
        }

        const registration = this.parent.registrations.get(key);

        if (isUsingRegistration(registration)) {
            return registration.using(this.parent);
        }

        const metadata = typeConstructionRequirements.requirementsFor(key);
        const args = metadata.map(({ registrationName }) => this.activate(registrationName));
        return new registration.usingConstructor(...args);
    }
}
