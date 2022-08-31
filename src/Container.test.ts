import { Container } from "./Container";
import { Inject } from "./Inject";
import { IRegistrationModule } from "./interfaces";

describe("Container", () => {

    let container: Container;
    beforeEach(() => {
        container = new Container();
    });

    describe("get", () => {
        it("should be able to get itself", () => {
            const instances = [];
            instances.push(container.get<Container>(Container));
            instances.push(container.get(Container));
            instances.push(container.get("Container"));
            instances.push(container.get("container"));
            
            for (const instance of instances) {
                expect(instance).toBeInstanceOf(Container);
                expect(instance).toBe(container);
            }
        });

        it("should be able to get a class", () => {
            container.register(TestClass);
            const result = container.get<TestClass>(TestClass);
            
            expect(result).toBeInstanceOf(TestClass);
            expect(result.foo).toBe("bar");
        });

        it("should be able to get a class with a dependency", () => {
            container.register(TestClass);
            container.register(TestClassWithDep);
            container.register(SomeDep);
                    
            const result = container.get<TestClassWithDep>(TestClassWithDep);
            
            expect(result).toBeInstanceOf(TestClassWithDep);
            expect(result.foo.foo).toBe("bar");
        });

        it("should be able to get a class with a factory dependency", () => {
            container.register(SomeDepWhichNeedsAFactory, { using: () => new SomeDepWhichNeedsAFactory("abc") });
                    
            const result = container.get<SomeDepWhichNeedsAFactory>(SomeDepWhichNeedsAFactory);
            
            expect(result).toBeInstanceOf(SomeDepWhichNeedsAFactory);
            expect(result.foo).toBe("abc");
        });
    });

    describe("register", () => {

        it("should be able to register a class", () => {
            container.register(TestClass);

            expect(container.registrations.has(TestClass.name)).toBe(true);
            expect(container.get(TestClass)).toBeInstanceOf(TestClass);
        });

        it("should be able to register a class with a different activation key", () => {
            container.register("Key", TestClass);

            expect(container.registrations.has("Key")).toBe(true);
            expect(container.get("Key")).toBeInstanceOf(TestClass);
        });

        it("should support providing registrations", () => {
            container.register(SomeDepWhichNeedsAFactory, { using: () => new SomeDepWhichNeedsAFactory("abcd") });
                    
            const result = container.get<SomeDepWhichNeedsAFactory>(SomeDepWhichNeedsAFactory);
            
            expect(result).toBeInstanceOf(SomeDepWhichNeedsAFactory);
            expect(result.foo).toBe("abcd");
        });

        it("should support providing values", () => {
            container.register(SomeDepWhichNeedsAFactory, new SomeDepWhichNeedsAFactory("abcdj"));
                    
            const result = container.get<SomeDepWhichNeedsAFactory>(SomeDepWhichNeedsAFactory);
            
            expect(result).toBeInstanceOf(SomeDepWhichNeedsAFactory);
            expect(result.foo).toBe("abcdj");
        });

        it("should support providing factory functions", () => {
            container.register(SomeDepWhichNeedsAFactory, () => new SomeDepWhichNeedsAFactory("abcde"));
                    
            const result = container.get<SomeDepWhichNeedsAFactory>(SomeDepWhichNeedsAFactory);
            
            expect(result).toBeInstanceOf(SomeDepWhichNeedsAFactory);
            expect(result.foo).toBe("abcde");
        });

        it("should error when key provided without value", () => {
            container.register("foo", undefined);
                    
            expect(() => {
                container.get("foo");
            }).toThrow("Registration found for 'foo' but no value was provided");
        });

        it("should load factory functions when they are constructor dependencies of bound interfaces", () => {
            container.register("ISomeInterface", SomeConcreteImplementation);
            container.register("sourcedFromBoundFunction", () => {
                return "bar";
            });

            const item = container.get<ISomeInterface>("ISomeInterface");
            expect(item.sourcedFromBoundFunction).toBe("bar");
        })
    });

    describe("reregister", () => {
        it("should be able to clear registrations", () => {
            container.register("foo", () => "bar");
            container.clearRegistrations("foo");

            expect(() => {
                container.get("foo");
            }).toThrow();
        });

        it("should be able to replace existing registrations", () => {
            container.register("foo", () => "bar");
            container.reregister("foo", () => "baz");

            expect(container.get("foo")).toBe("baz");
        });
    });

    describe("container configuration", () => {
        it("default activation lifecycle is respected when set to singleton", () => {
            const container = new Container({
                defaultActivationLifecycle: "singleton"
            });

            container.register(TestClass);
            
            expect(container.registrations.get(TestClass.name).lifecycle).toBe("singleton");
        });
        
        it("default activation lifecycle is respected when set to transient", () => {
            const container = new Container({
                defaultActivationLifecycle: "transient"
            });

            container.register(TestClass);

            expect(container.registrations.get(TestClass.name).lifecycle).toBe("transient");
        });
    });

    describe("singleton activation scope", () => {
        it("asSingleton forces each get to return same instance", () => {
            container.register(TestClass).asSingleton();

            const get1 = container.get<TestClass>(TestClass);
            const get2 = container.get<TestClass>(TestClass);

            expect(get1 === get2).toBe(true);
        });
    });

    describe("transient activation scope", () => {
        it("asSingleton forces each get to return different instance", () => {
            container.register(TestClass).asTransient();

            const get1 = container.get<TestClass>(TestClass);
            const get2 = container.get<TestClass>(TestClass);

            expect(get1 === get2).toBe(false);
        });
    });

    describe("scoped activation is respected", () => {        
        it("activation predicate not present, works", () => {
            container.register(TestClassWithDep);
            container.register(SomeDep, () => (new SomeDep("baz")));

            const result = container.get<TestClassWithDep>(TestClassWithDep);

            expect(result).toBeInstanceOf(TestClassWithDep);
        });

        it("activation predicate returns no values, exception is thrown", () => {
            container.register(TestClassWithDep);
            container.register(SomeDep, () => (new SomeDep("baz"))).when(() => false);

            expect(() => {
                container.get<TestClassWithDep>(TestClassWithDep);
            }).toThrow(`Failed to activate type: 'SomeDep' while creating 'TestClassWithDep'. Could not find a registration that match registration conditions.`);
        });
        
        it("activation predicate matches one registration, works", () => {
            container.register(TestClassWithDep);
            container.register(SomeDep, () => (new SomeDep("baz"))).when(() => true);

            const result = container.get<TestClassWithDep>(TestClassWithDep);

            expect(result).toBeInstanceOf(TestClassWithDep);
        });

        it("multiple registrations, one matching activation predicate, works", () => {
            container.register(TestClassWithDep);
            container.register(SomeDep, () => (new SomeDep("def"))).when(() => false);
            container.register(SomeDep, () => (new SomeDep("abc"))).when(() => true);

            const result = container.get<TestClassWithDep>(TestClassWithDep);

            expect(result).toBeInstanceOf(TestClassWithDep);
            expect(result.foo.foo).toBe("abc");
        });

        it("multiple registrations, multiple matching activation predicates, throws", () => {
            container.register(TestClassWithDep);
            container.register(SomeDep, () => (new SomeDep("abc"))).when(() => true);
            container.register(SomeDep, () => (new SomeDep("def"))).when(() => true);

            expect(() => {
                container.get<TestClassWithDep>(TestClassWithDep);
            }).toThrow(`Failed to activate type: 'SomeDep' while creating 'TestClassWithDep'. Found multiple registrations that match registration conditions.`);
        });
        
        it("scoped registration, requested for other scope, throws", () => {
            container.register(TestClass).inScope("scope-name");

            expect(() => {
                container.get(TestClass, "other-scope-name");
            }).toThrow(`Failed to activate type: 'TestClass' while creating 'TestClass'. Could not find a registration that match registration conditions.`);
       });

        it("scoped registration, requested for correct scope, returns instance", () => {
            container.register(TestClass).inScope("scope-name");
            
            const result = container.get(TestClass, "scope-name");

            expect(result).toBeInstanceOf(TestClass);
        });

        it("conditional registration, works correctly", () => {
            container.register(WithDependencyOne);
            container.register(WithDependencyTwo);
            container.register(SomeDep, () => (new SomeDep("abc"))).whenInjectedInto(WithDependencyOne);
            container.register(SomeDep, () => (new SomeDep("def"))).whenInjectedInto(WithDependencyTwo);

            const result1 = container.get<WithDependencyOne>(WithDependencyOne);
            const result2 = container.get<WithDependencyTwo>(WithDependencyTwo);

            expect(result1.someDep.foo).toBe("abc");
            expect(result2.someDep.foo).toBe("def");
        });

        it("conditional registration and named scopes, works correctly", () => {
            container.register(WithDependencyOne);
            container.register(WithDependencyTwo);
            container.register(SomeDep, () => (new SomeDep("abc"))).whenInjectedInto(WithDependencyOne);
            container.register(SomeDep, () => (new SomeDep("def"))).whenInjectedInto(WithDependencyTwo);
            container.register(SomeDep, () => (new SomeDep("ghi"))).whenInjectedInto(WithDependencyTwo).inScope("special-scope");

            const result1 = container.get<WithDependencyTwo>(WithDependencyTwo);
            const result2 = container.get<WithDependencyTwo>(WithDependencyTwo, "special-scope");

            expect(result1.someDep.foo).toBe("def");
            expect(result2.someDep.foo).toBe("ghi");
        });

        it("conditional registration and named scopes, respects lifecycle", () => {
            container.register(SomeDep).asSingleton(); // default scope
            container.register(SomeDep).asTransient().inScope("special-scope");

            const result1 = container.get<SomeDep>(SomeDep);
            const result2 = container.get<SomeDep>(SomeDep);
            const result3 = container.get<SomeDep>(SomeDep, "special-scope");
            const result4 = container.get<SomeDep>(SomeDep, "special-scope");

            expect(result1 === result2).toBe(true);
            expect(result2 === result3).toBe(false);
            expect(result3 === result4).toBe(false);
        });
    });
    
    it("dependency modules can be registered", () => {
        container.addModule(new TestModule());
        const result = container.get<TestClass>(TestClass);
        expect(result).toBeInstanceOf(TestClass);
    });
 });

class TestModule implements IRegistrationModule {
    public registerComponents(container: Container): void {
        container.register(TestClass);
    }
}

class TestClass {
    public foo: string;

    constructor() {
        this.foo = "bar";
    }
}

class SomeDep {
    public foo: string;

    constructor(foo: string = "bar") {
        this.foo = foo;
    }
}

class SomeDepWhichNeedsAFactory {
    public foo: string;

    constructor(fooValue: string) {
        this.foo = fooValue;
    }
}

class TestClassWithDep {
    public foo: SomeDep;

    constructor(@Inject("SomeDep") someDep: SomeDep) {
        this.foo = someDep;
    }
}

class WithDependencyOne {
    constructor(@Inject("SomeDep") public someDep: SomeDep) { }
}

class WithDependencyTwo {
    constructor(@Inject("SomeDep") public someDep: SomeDep) { }
}

interface ISomeInterface {
    sourcedFromBoundFunction: string;
}

class SomeConcreteImplementation implements ISomeInterface {
    constructor(
        @Inject("sourcedFromBoundFunction") public sourcedFromBoundFunction: string
    ) {
    }
}