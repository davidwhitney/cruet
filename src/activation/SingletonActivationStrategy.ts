import { IActivationStrategy, ValidActivationLifecycle } from "../types";
import { TransientActivationStrategy } from "./TransientActivationStrategy";

export class SingletonActivationStrategy implements IActivationStrategy {
    public static get shortName(): ValidActivationLifecycle { return "singleton"; }

    private instanceCache: Map<string, any>;
    private transientActivationStrategy: TransientActivationStrategy;

    constructor(transientActivationStrategy: TransientActivationStrategy) {
        this.transientActivationStrategy = transientActivationStrategy;
        this.instanceCache = new Map<string, any>();
    }

    public activate(key: string) {
        if (!this.instanceCache.has(key)) {
            const instance = this.transientActivationStrategy.activate(key);
            this.instanceCache.set(key, instance);
        }

        return this.instanceCache.get(key);
    }
}
