import { IActivationContext, IActivationStrategy, ValidActivationLifecycle } from "../interfaces";
import { TransientActivationStrategy } from "./TransientActivationStrategy";

export class SingletonActivationStrategy implements IActivationStrategy {
    public static get shortName(): ValidActivationLifecycle { return "singleton"; }

    private instanceCache: Map<string, any>;
    private transientActivationStrategy: TransientActivationStrategy;

    constructor(transientActivationStrategy: TransientActivationStrategy) {
        this.transientActivationStrategy = transientActivationStrategy;
        this.instanceCache = new Map<string, any>();
    }

    public activate(key: string, activationContext: IActivationContext) {
        if (!this.instanceCache.has(key)) {
            const instance = this.transientActivationStrategy.activate(key, activationContext);
            this.instanceCache.set(key, instance);
        }

        return this.instanceCache.get(key);
    }
}
