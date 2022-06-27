import type * as Types from "./types";
import { ActivationScope } from "./activation/ActivationScope";
import { RegistrationConfiguration } from "./registration/Registration";
import { TransientActivationStrategy } from "./activation/TransientActivationStrategy";
import { ContainerConfiguration } from "./ContainerConfiguration";
import { ContainerRegistrations } from "./registration/ContainerRegistrations";

export class Container {
    public registrations = new ContainerRegistrations();
    public configuration: ContainerConfiguration;

    private defaultScope: ActivationScope;

    constructor(configuration: ContainerConfiguration = null) {
        this.configuration = configuration || {
            defaultActivationLifecycle: TransientActivationStrategy.shortName
        };
        
        this.defaultScope = new ActivationScope(this, this.configuration.defaultActivationLifecycle);
        
        const selfRegistration = new RegistrationConfiguration({ using: () => (this) }).asSingleton();
        
        this.registrations = new ContainerRegistrations();
        this.registrations.add("Container", selfRegistration);
        this.registrations.add("container", selfRegistration);
    }

    public register(constructor: Types.Constructor): RegistrationConfiguration;
    public register(key: string | Types.Constructor, value: object): RegistrationConfiguration;
    public register(key: string | Types.Constructor, registration: Types.IRegistration): RegistrationConfiguration;
    public register(key: string | Types.Constructor, factoryFunction: Types.FactoryFunction): RegistrationConfiguration;

    public register(key: string | Types.Constructor, value?: Types.ValidRegistrationValue): RegistrationConfiguration {
        const ctorProvided = typeof key !== "string";
        const keyProvided = typeof key === "string";
        const registrationKey = ctorProvided ? (key as Types.Constructor).name : (key as string);

        if (ctorProvided && !value) {
            value = { usingConstructor: key };
        }

        if (keyProvided && !value) {
            value = { 
                using: keyNotRecognisedErrorFunction(key)
            };
        }

        if (!isRegistration(value)) {
            const valueSnapshot = value;
            value = typeof valueSnapshot === "function" 
                ? { using: valueSnapshot } 
                : { using: () => (valueSnapshot) };
        }

        if (!isRegistration(value)) {
            throw new Error("Invalid registration value provided - please provide one of: a constructor, a value, a callable function.", value);
        }

        const registration = new RegistrationConfiguration(value, this.configuration.defaultActivationLifecycle);

        this.registrations.add(registrationKey, registration);
        return registration;
    }

    public addModule(module: Types.IRegistrationModule) {
        module.registerComponents(this);
    }

    public get<T = any>(key: Types.Constructor | string): T {
        const ctorProvided = typeof key !== "string";
        const registeredKey = ctorProvided ? (key as Types.Constructor).name : (key as string);
        return this.getByKey(registeredKey);
    }

    public getByKey<T>(key: string): T {
        const activationContext = {
            requestedKey: key,
            activatedItems: new Map<string, any>()
        };

        const registrationConfiguration = this.registrations.get(key, activationContext);
        const activationScope = this.getActivationScope(registrationConfiguration);
        return activationScope.activate(key, activationContext);
    }

    private getActivationScope(registration: RegistrationConfiguration): ActivationScope {
        return this.defaultScope;
    }
}

function isRegistration(value: Types.ValidRegistrationValue): value is Types.IRegistration {
    return ("usingConstructor" in value || "using" in value) ? true : false;
}

export function isUsingRegistration(value: Types.IRegistration): value is Types.UsingRegistration {
    return ("using" in value) ? true : false;
}

const keyNotRecognisedErrorFunction = (key: string) => () => { throw new Error(`Registration found for '${key}' but no value was provided`); };
