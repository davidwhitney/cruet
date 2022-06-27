# cruet

A **minimalist TypeScript Depenedency Injection Container** written as a ES6 Module.

Why cruet? Well, most importantly, it **works anywhere modern JavaScript runs**, is **built in TypeScript** and works in scenarios where other containers fail (like ts-syringe and npm workspaces ;)).

## Contents

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [cruet](#cruet)
  - [Contents](#contents)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Lifecycles](#lifecycles)
  - [Dependency Scopes](#dependency-scopes)
  - [Dependency Modules](#dependency-modules)

<!-- /code_chunk_output -->

## Installation

Install the `cruet` package from `npm`:

```bash
npm install @cruet --save-dev
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

## Dependency Scopes

WIP.

## Dependency Modules

Docs WIP.
