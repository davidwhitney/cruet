import { SingletonActivationStrategy } from "../activation/SingletonActivationStrategy";
import { TransientActivationStrategy } from "../activation/TransientActivationStrategy";
import type * as Types from "../types";

export class RegistrationConfiguration {
    public value: Types.IRegistration;
    public lifecycle: Types.ValidActivationLifecycle;
    public activationFilter: (activationContext: Types.IActivationContext) => boolean;

    constructor(value: Types.IRegistration, lifecycle: Types.ValidActivationLifecycle = null) {
        this.value = value;
        this.lifecycle = lifecycle;
    }

    public asSingleton(): RegistrationConfiguration {
        this.lifecycle = SingletonActivationStrategy.shortName;
        return this;
    }

    public asTransient(): RegistrationConfiguration {
        this.lifecycle = TransientActivationStrategy.shortName;
        return this;
    }

    public when(condition: (activationContext: Types.IActivationContext) => boolean) {
        this.activationFilter = condition;
    }
}