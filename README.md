# cruet

A **minimalist TypeScript Dependency Injection Container** written as a ES6 Module.

Why cruet? Well, most importantly, it **works anywhere modern JavaScript runs**, is **built in TypeScript** and works in scenarios where other containers fail (like ts-syringe and npm workspaces ;)).

**Targets Node 16+**.

## Contents

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Contents](#contents)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Lifecycles](#lifecycles)
- [Conditional Injection](#conditional-injection)
  - [whenInjectedInto](#wheninjectedinto)
  - [inScope](#inscope)
  - [when](#when)
- [Registration Modules](#registration-modules)
- [Credits](#credits)

<!-- /code_chunk_output -->

## Installation

Install the `cruet` package from `npm`:

```bash
npm install cruet --save-dev
```

Set the `experimentalDecorators` flag to `true` in your `tsconfig.json` file.

```json
{
    "compilerOptions": {
        ...
        "experimentalDecorators": true
    }
}
```

You can import cruet as an ES Module:

```ts
import { Container } from "cruet";
```

Type definitions are provided.

## Basic Usage

First, you need to create a container instance.

```ts
import { Container } from "cruet";

const container = new Container();
```

Then, you can register your dependencies.

```ts
 // Register a class
container.register(TestClass);

// Register a class with a custom activation key
container.register("Key", TestClass);

// Register a class with a factory function
// Optionally, you can use the container during your factory function
container.register(SomeDepWhichNeedsAFactory, () => new SomeDepWhichNeedsAFactory("abc"));
container.register(SomeDepWhichNeedsAFactory, (current: Container) => new SomeDepWhichNeedsAFactory("abc"));

// Register an instance for a class
container.register(SomeDepWhichNeedsAFactory, new SomeDepWhichNeedsAFactory("abc"));

// Register a class with an explicit instance of IRegistration
container.register(SomeDepWhichNeedsAFactory, { using: () => new SomeDepWhichNeedsAFactory("abc") });

// Register a dependency by key
container.register("foo", () => "bar");

// Re-Register a depedency (replaces, rather than adds additional registrations)
container.reregister("foo", () => "baz");

// Clear registrations
container.clearRegistrations("foo");
```

Parameters that exist in constructors must be annotated so that the container understands them.
To do this, you need to use the `@Inject` decorator.

```ts
import { Inject } from "cruet";

class TestClassWithDep {
    public foo: SomeDep;

    constructor(@Inject("SomeDep") someDep: SomeDep) {
        this.foo = someDep;
    }
}
```

By convention, use the `class name` when your dependencies are a `class`, and the `parameter name` when the dependencies are functions or values.

Once, annotated, you can resolve your dependencies from the container:

```ts
const container = new Container();
container.register(TestClass);

let result = container.get<TestClass>(TestClass);

// You can call get using a variety of different options
// with different degrees of type inference
result = container.get(TestClass);
result = container.get("TestClass");
result = container.get<TestClass>("TestClass");

expect(result).toBeInstanceOf(TestClass);
```

Your dependency graph will be resolved by the container, and the dependencies will be constructor injected.

## Lifecycles

We support both `singleton` and `transient` life cycles.
All activations are `transient` by default, but you can switch this default when you create your `Container` instance.

```ts
const container = new Container({
    defaultActivationLifecycle: "singleton" // or "transient"
})
```

You can also set the life cycle of a dependency manually.

```ts
// During the registration, you can also set the lifetime of the dependency
container.register(TestClass).asSingleton();
container.register(TestClass).asTransient();
```

This overrides the global default of the container.

**Beware** if you injects a transient object into a singleton, the singleton instance will be cached at runtime including any of it's created dependencies, regardless of how they were configured. The root object you request from the container will ultimately control the lifecycle of it's entire heirarchy downwards.

Transient objects injected into objects marked as singletons will always become singletons in their respective scopes.

## Conditional Injection

You can add dependency filters to your registrations. These filters can be combined and chained to more tightly control dependency creation.

### whenInjectedInto

whenInjectedInto allows you to control which implementation gets injected based on the dependency root.

```ts
container.register(WithDependencyOne);
container.register(WithDependencyTwo);
container.register(SomeDep, () => (new SomeDep("abc"))).whenInjectedInto(WithDependencyOne);
container.register(SomeDep, () => (new SomeDep("def"))).whenInjectedInto(WithDependencyTwo);

const result1 = container.get<WithDependencyOne>(WithDependencyOne); // SomeDep("abc")
const result2 = container.get<WithDependencyTwo>(WithDependencyTwo); // SomeDep("def")
```

### inScope

inScope allows you to control which implementation gets injected based on a named dependency scope.

```ts
container.register(SomeDep).asSingleton(); // default scope
container.register(SomeDep).asTransient().inScope("special-scope");

const result1 = container.get<SomeDep>(SomeDep);
const result2 = container.get<SomeDep>(SomeDep);
const result3 = container.get<SomeDep>(SomeDep, "special-scope");
const result4 = container.get<SomeDep>(SomeDep, "special-scope");

expect(result1 === result2).toBe(true);  // true because they are registered as singletons
expect(result2 === result3).toBe(false); // false because they're requested from different scopes 
expect(result3 === result4).toBe(false); // false because the dependency in this scope is marked as transient
```

### when

when allows you to control which implementation gets injected based on a condition.

```ts
container.register(SomeDep).asTransient().when(() => true); // Put whatever you like that returns a bool here.
```

## Registration Modules

Registration modules allow you to capture your registrations in a class - this is useful when you want to ship some registrations in a package with some dependencies in a shared project.

You can define a Registration Module like this:

```ts
class TestModule implements IRegistrationModule {
    public registerComponents(container: Container): void {
        container.register(TestClass);
    }
}
```

Then register it with your container:

```ts
container.addModule(new TestModule());
const result = container.get<TestClass>(TestClass);
```

## Credits

cruet is &copy; David Whitney 2022.
