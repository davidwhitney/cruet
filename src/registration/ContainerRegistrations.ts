import * as Types from "../interfaces";
import { RegistrationConfiguration } from "./Registration";

export class ContainerRegistrations {
    private registrations: Map<string, RegistrationConfiguration[]>;

    constructor() {
        this.registrations = new Map<string, RegistrationConfiguration[]>();
    }

    public all(): IterableIterator<[string, RegistrationConfiguration[]]> {
        return this.registrations.entries();
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
            scope: null
        };

        const registrationOptions = this.registrations.get(key);

        const hasConstraint = (x: RegistrationConfiguration) => (x.activationFilters.length > 0);
        const constraintMatches = (x: RegistrationConfiguration) => (x.activationFilters.every(filter => {
            return filter(activationContext);
        }));

        const valid = registrationOptions.filter(x => !hasConstraint(x) || (hasConstraint(x) && constraintMatches(x)));
        
        if (valid.length === 0) {
            throw new Error(`Failed to activate type: '${key}' while creating '${activationContext.requestedKey}'. Could not find a registration that match registration conditions.`);
        }

        if (valid.length === 1) {
            return valid[0];
        }

        const matchesWithConstraints = valid.filter(x => hasConstraint(x));
        const orderedMatchesWithConstraints = matchesWithConstraints.sort((a, b) => {
            return a.activationFilters.length - b.activationFilters.length;
        });

        const allMatchesWithConstraintsHaveSameNumberOfFilters = orderedMatchesWithConstraints.every((x) => {
            return x.activationFilters.length === orderedMatchesWithConstraints[0].activationFilters.length;
        }) && orderedMatchesWithConstraints.length > 1;

        if (orderedMatchesWithConstraints.length > 0 && !allMatchesWithConstraintsHaveSameNumberOfFilters) {
            return orderedMatchesWithConstraints[orderedMatchesWithConstraints.length - 1];
        }

        if (valid.length > 1) {
            throw new Error(`Failed to activate type: '${key}' while creating '${activationContext.requestedKey}'. Found multiple registrations that match registration conditions.`);
        }

        return valid[0];
    }
}
