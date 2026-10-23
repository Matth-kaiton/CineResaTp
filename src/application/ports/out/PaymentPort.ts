import Money from "../../../domain/shared/Money";

export interface PaymentPort {
  pay(price: Money): Promise<boolean>;
}
