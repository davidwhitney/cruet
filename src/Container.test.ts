import { Container } from "./Container";
import { Inject } from "./Inject";

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
    });

 });



class TestClass {
    public foo: string;

    constructor() {
        this.foo = "bar";
    }
}

class SomeDep {
    public foo: string;

    constructor() {
        this.foo = "bar";
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

