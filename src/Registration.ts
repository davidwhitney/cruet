import { SingletonActivationStrategy } from "./activation/SingletonActivationStrategy";
import { TransientActivationStrategy } from "./activation/TransientActivationStrategy";
import type * as Types from "./types";

export class RegistrationConfiguration {
    public value: Types.IRegistration;
    public lifecycle: Types.ValidActivationLifecycle;

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
}