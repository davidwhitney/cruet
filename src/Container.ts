import { TransientActivationStrategy } from "./activation/TransientActivationStrategy";
import type * as Types from "./types";

export class Container {
    public registrations = new Map<string, Types.IRegistration>();
    private defaultActivationStrategy: Types.IActivationStrategy;

    constructor() {
        this.defaultActivationStrategy = new TransientActivationStrategy(this);

        this.registrations.set("Container",  { using: () => (this) });
        this.registrations.set("container",  { using: () => (this) });
    }

    public register(constructor: Types.Constructor): Types.IRegistration;
    public register(key: string | Types.Constructor, value: object): Types.IRegistration;
    public register(key: string | Types.Constructor, registration: Types.IRegistration): Types.IRegistration;
    public register(key: string | Types.Constructor, factoryFunction: Types.FactoryFunction): Types.IRegistration;

    public register(key: string | Types.Constructor, value?: Types.ValidRegistrationValue): Types.IRegistration {
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

        this.registrations.set(registrationKey, value);
        return value;
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
        if (!this.registrations.get(key)) {
            throw new Error("No registration found for key: " + key);
        }

        // const registration = this.registrations.get(key);
        return this.defaultActivationStrategy.activate(key);
    }
}

function isRegistration(value: Types.ValidRegistrationValue): value is Types.IRegistration {
    return ("usingConstructor" in value || "using" in value) ? true : false;
}

export function isUsingRegistration(value: Types.IRegistration): value is Types.UsingRegistration {
    return ("using" in value) ? true : false;
}

const keyNotRecognisedErrorFunction = (key: string) => () => { throw new Error(`Registration found for '${key}' but no value was provided`); };
