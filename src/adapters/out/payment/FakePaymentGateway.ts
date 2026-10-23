import { PaymentPort } from "../../../application/ports/out/PaymentPort";
import Money from "../../../domain/shared/Money";

export default class FakePaymentGateway implements PaymentPort {
  constructor(
    private readonly succeeds: (price: Money) => boolean = () => true,
  ) {}

  async pay(price: Money): Promise<boolean> {
    return this.succeeds(price);
  }
}
