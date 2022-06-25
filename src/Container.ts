import type { Constructor, FactoryFunction, IRegistrationModule, Registration } from "./types.js";

export const typeConstructionRequirements  = new Map<string, any[]>();

export class Container {
    public registrations = new Map<string, Registration>();

    constructor() {
        this.register("Container", this);
        this.register("container", this);
    }

    public register(key: string | Constructor, value?: any | FactoryFunction) {
        const ctorProvided = typeof key !== "string";
        const keyProvided = typeof key === "string";

        if (ctorProvided && !value) {
            value = { usingConstructor: key };
        }

        if (keyProvided && !value) {
            value = { 
                using: () => { throw new Error(`Registration found for '${key}' but no value was provided`); } 
            };
        }

        const registrationKey = ctorProvided ? (key as Constructor).name : (key as string);
        const valueOrFactoryProvided = !value.usingConstructor && !value.using;

        if (valueOrFactoryProvided) {
            value = { using: value };
        }

        this.registrations.set(registrationKey, value);
    }

    public addModule(module: IRegistrationModule) {
        module.registerComponents(this);
    }

    public get<T = any>(key: Constructor | string): T {
        const ctorProvided = typeof key !== "string";
        const registeredKey = ctorProvided ? (key as Constructor).name : (key as string);
        return this.getByKey(registeredKey);
    }

    public getByKey<T>(key: string): T {
        if (!this.registrations.get(key)) {
            throw new Error("No registration found for key: " + key);
        }

        const registration = this.registrations.get(key);

        if (registration.using && typeof registration.using === "function") {
            return registration.using(this) as T;
        }

        if (registration.using) {
            return registration.using as T;
        }

        const metadata = typeConstructionRequirements.get(key) || [];
        metadata.sort((a, b) => a.paramIndex - b.paramIndex);

        const args = [];

        for (const metadataItem of metadata) {
            const value = this.getByKey(metadataItem.registrationName);
            args.push(value);
        }

        return new registration.usingConstructor(...args);
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
