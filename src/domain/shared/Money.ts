import ErrorResponse from "../errorResponse";

export default class Money {
  constructor(readonly cents: number) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new ErrorResponse(
        "Le prix ne peut etre qu'un nombre valide et possitif",
        406,
      );
    }
  }

  times(value: number): Money {
    return new Money(this.cents * value);
  }

  static euros(n: number) {
    return new Money(Math.round(n * 100));
  }

  static cents(n: number) {
    return new Money(n);
  }

  discount(rate: number) {
    return new Money(Math.round(this.cents * (1 - rate)));
  }
  equals(o: Money) {
    return this.cents === o.cents;
  }

  toString() {
    return `${(this.cents / 100).toFixed(2)}`;
  }
}
