import type * as Types from "./types.js";
export const typeConstructionRequirements  = new Map<string, any[]>();

export class Container {
    public registrations = new Map<string, Types.IRegistration>();

    constructor() {
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

        const registration = this.registrations.get(key);

        if (isUsingRegistration(registration)) {            
            return registration.using(this); 
        }

        const metadata = this.getConstructionRequirements(key);
        const args = metadata.map(({ registrationName }) => this.getByKey(registrationName));
        return new registration.usingConstructor(...args);
    }

    private getConstructionRequirements(key: string) {
        const metadata = typeConstructionRequirements.get(key) || [];
        metadata.sort((a, b) => a.paramIndex - b.paramIndex);
        return metadata;
    }
}

export function Inject(registrationName: any) {
    return (target: any, __: string, paramIndex: number) => {
        if (!typeConstructionRequirements.get(target.name)) {
            typeConstructionRequirements.set(target.name, []);
        }

        const metadata = typeConstructionRequirements.get(target.name);
        metadata.push({ paramIndex, registrationName });        
        typeConstructionRequirements.set(target.name, metadata);
    }
}

function isRegistration(value: Types.ValidRegistrationValue): value is Types.IRegistration {
    return ("usingConstructor" in value || "using" in value) ? true : false;
}

function isUsingRegistration(value: Types.IRegistration): value is Types.UsingRegistration {
    return ("using" in value) ? true : false;
}

const keyNotRecognisedErrorFunction = (key: string) => () => { throw new Error(`Registration found for '${key}' but no value was provided`); };