import { IActivationContext, IActivationStrategy, ValidActivationLifecycle } from "../interfaces";
import { typeConstructionRequirements } from "../Inject";
import { Container, isUsingRegistration } from "../Container";

export class TransientActivationStrategy implements IActivationStrategy {
    public static get shortName(): ValidActivationLifecycle { return "transient"; }

    private parent: Container;

    constructor(parent: Container) {
        this.parent = parent;
    }

    public activate(key: string, activationContext: IActivationContext) {
        if (!this.parent.registrations.get(key, activationContext)) {
            throw new Error("No registration found for key: " + key);
        }

        const registrationConfiguration = this.parent.registrations.get(key, activationContext);
        const registration = registrationConfiguration.value;

        if (isUsingRegistration(registration)) {
            return registration.using(this.parent);
        }

        const metadata = typeConstructionRequirements.requirementsFor(key);
        const args = metadata.map(({ registrationName }) => this.activate(registrationName, activationContext));
        return new registration.usingConstructor(...args);
    }
}
