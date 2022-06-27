export class ConstructionRequirement {
    private values = new Map<string, any[]>();

    public register(registrationName: any, target: any, paramIndex: number) {
        if (!this.values.get(target.name)) {
            this.values.set(target.name, []);
        }

        const metadata = this.values.get(target.name);
        metadata.push({ paramIndex, registrationName });
        this.values.set(target.name, metadata);
    }

    public requirementsFor(key: string) {
        const metadata = this.values.get(key) || [];
        metadata.sort((a, b) => a.paramIndex - b.paramIndex);
        return metadata;
    }
}
