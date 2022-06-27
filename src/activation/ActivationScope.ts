import * as Types from "../types";
import { Container } from "../Container";
import { TransientActivationStrategy } from "./TransientActivationStrategy";
import { SingletonActivationStrategy } from "./SingletonActivationStrategy";

export class ActivationScope {
    public name: string;
    private activationStrategies: Map<string, Types.IActivationStrategy>;
    private parent: Container;
    private defaultLifecycle: Types.ValidActivationLifecycle;

    public constructor(container: Container, defaultLifeCycle: Types.ValidActivationLifecycle, name: string = "DEFAULT") {
        this.name = name;
        this.parent = container;
        this.defaultLifecycle = defaultLifeCycle;

        const transientActivationStrategy = new TransientActivationStrategy(container);
        const singletonActivationStrategy = new SingletonActivationStrategy(transientActivationStrategy);

        this.activationStrategies = new Map<string, Types.IActivationStrategy>();
        this.activationStrategies.set(TransientActivationStrategy.shortName, transientActivationStrategy);
        this.activationStrategies.set(SingletonActivationStrategy.shortName, singletonActivationStrategy);
    }

    public activate(key: string, activationContext: Types.IActivationContext) {
        const registrationConfiguration = this.parent.registrations.get(key, activationContext);
        const lifecycle = registrationConfiguration.lifecycle || this.defaultLifecycle;

        

        const selectedActivationStrategy = this.activationStrategies.get(lifecycle);
        const instance = selectedActivationStrategy.activate(key, activationContext);

        return instance;
    }
}
