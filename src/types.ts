import { Container } from "./Container";

export type Constructor = { new (...args: any[]) };
export type FactoryFunction = ((c: Container) => any);

export interface Registration {
    usingConstructor?: Constructor,
    using?: any | (() => any),
}

export interface IRegistrationModule {
    registerComponents(container: Container): void;
}
