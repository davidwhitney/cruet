import { Container } from "./Container";

export type Constructor = { new (...args: any[]) };
export type FactoryFunction = ((current?: Container) => any);
export type ValidRegistrationValue = IRegistration | object;

export type IRegistration = ConstructorRegistration | UsingRegistration;

export interface ConstructorRegistration {
    usingConstructor: Constructor,
}

export interface UsingRegistration {
    using: FactoryFunction
}

export interface IRegistrationModule {
    registerComponents(container: Container): void;
}

export interface IActivationStrategy {
    activate(key: string): any;
}
