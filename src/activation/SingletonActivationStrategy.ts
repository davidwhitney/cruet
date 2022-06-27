import { IActivationStrategy } from "../types";
import { TransientActivationStrategy } from "./TransientActivationStrategy";
import { Container } from "../Container";

class SingletonActivationStrategy implements IActivationStrategy {
    private parent: Container;
    private instanceCache: Map<string, any>;
    private transientActivationStrategy: TransientActivationStrategy;

    constructor(parent: Container, transientActivationStrategy: TransientActivationStrategy) {
        this.parent = parent;
        this.transientActivationStrategy = transientActivationStrategy;
    }

    public activate(key: string) {
        if (!this.instanceCache.has(key)) {
            const instance = this.transientActivationStrategy.activate(key);
            this.instanceCache.set(key, instance);
        }

        return this.instanceCache.get(key);
    }
}
