import { Container } from "./Container";

export type Constructor = { new (...args: any[]) };
export type FactoryFunction = ((current?: Container) => any);
export type ValidRegistrationValue = IRegistration | object;

export type ValidActivationLifecycle = "transient" | "singleton";

export type IRegistration = ConstructorRegistration | UsingRegistration;

export interface ConstructorRegistration {
    usingConstructor?: Constructor;
    lifecycle?: ValidActivationLifecycle;
}

export interface UsingRegistration {
    using?: FactoryFunction;
    lifecycle?: ValidActivationLifecycle;
}

export interface IRegistrationModule {
    registerComponents(container: Container): void;
}

export interface IActivationStrategy {
    activate(key: string, activationContext: IActivationContext): any;
}

export interface IActivationContext {
    requestedKey: string;
    scope: string;
}