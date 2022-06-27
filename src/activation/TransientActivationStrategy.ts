import { IActivationStrategy, ValidActivationLifecycle } from "../types";
import { typeConstructionRequirements } from "../Inject";
import { Container, isUsingRegistration } from "../Container";

export class TransientActivationStrategy implements IActivationStrategy {
    public static get shortName(): ValidActivationLifecycle { return "transient"; }

    private parent: Container;

    constructor(parent: Container) {
        this.parent = parent;
    }

    public activate(key: string) {
        if (!this.parent.registrations.get(key)) {
            throw new Error("No registration found for key: " + key);
        }

        const registrationConfiguration = this.parent.registrations.get(key);
        const registration = registrationConfiguration.value;

        if (isUsingRegistration(registration)) {
            return registration.using(this.parent);
        }

        const metadata = typeConstructionRequirements.requirementsFor(key);
        const args = metadata.map(({ registrationName }) => this.activate(registrationName));
        return new registration.usingConstructor(...args);
    }
}
