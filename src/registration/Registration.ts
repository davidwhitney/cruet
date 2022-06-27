import { SingletonActivationStrategy } from "../activation/SingletonActivationStrategy";
import { TransientActivationStrategy } from "../activation/TransientActivationStrategy";
import type * as Types from "../types";

export class RegistrationConfiguration {
    public value: Types.IRegistration;
    public lifecycle: Types.ValidActivationLifecycle;
    public activationFilters: ((activationContext: Types.IActivationContext) => boolean)[];

    constructor(value: Types.IRegistration, lifecycle: Types.ValidActivationLifecycle = null) {
        this.value = value;
        this.lifecycle = lifecycle;
        this.activationFilters = [];
    }

    public asSingleton(): RegistrationConfiguration {
        this.lifecycle = SingletonActivationStrategy.shortName;
        return this;
    }

    public asTransient(): RegistrationConfiguration {
        this.lifecycle = TransientActivationStrategy.shortName;
        return this;
    }

    public inScope(scope: string): RegistrationConfiguration {        
        return this.when((activationContext: Types.IActivationContext) => {
            return activationContext.scope === scope;
        });
    }

    public whenInjectedInto(key: string | Types.Constructor): RegistrationConfiguration {        
        return this.when((activationContext: Types.IActivationContext) => {
            const comparisonKey = (typeof key === "string" ? key : key.name);
            return activationContext.requestedKey === comparisonKey;
        });
    }

    public when(condition: (activationContext: Types.IActivationContext) => boolean) {
        this.activationFilters.push(condition);
        return this;
    }
}