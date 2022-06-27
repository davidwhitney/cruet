import * as Types from "../types";
import { RegistrationConfiguration } from "./Registration";

export class ContainerRegistrations {
    private registrations: Map<string, RegistrationConfiguration[]>;

    constructor() {
        this.registrations = new Map<string, RegistrationConfiguration[]>();
    }

    public has(key: string) {
        if (this.registrations.has(key)) {
            return true;
        }

        return this.registrations.get(key).length > 0;
    }

    public add(key: string, value: RegistrationConfiguration) {
        if (!this.registrations.has(key)) {
            this.registrations.set(key, []);
        }

        const current = this.registrations.get(key);
        current.push(value);

        this.registrations.set(key, current);
    }

    public get(key: string, activationContext: Types.IActivationContext = null): RegistrationConfiguration {
        activationContext = activationContext || {
            requestedKey: key,
            activatedItems: new Map<string, any>()
        };

        const registrationOptions = this.registrations.get(key);
        const wherePredicatesMatch = registrationOptions.filter(x => (!x.activationFilter) || (x.activationFilter && x.activationFilter()));

        if (wherePredicatesMatch.length === 0) {
            throw new Error(`Failed to activate type: '${key}' while creating '${activationContext.requestedKey}'. Could not find a registration that match registration conditions.`);
        }

        if (wherePredicatesMatch.length > 1) {
            throw new Error(`Failed to activate type: '${key}' while creating '${activationContext.requestedKey}'. Found multiple registrations that match registration conditions.`);
        }

        return wherePredicatesMatch[0];
    }
}
