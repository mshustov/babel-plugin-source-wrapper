export interface SomeInterface {
  property: string;
}

export class SomeClass<T> {
  public someMethod() {

  }
}

export const some = new SomeClass<SomeInterface>();
