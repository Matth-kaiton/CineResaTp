import { PaymentPort } from "../../../application/ports/out/PaymentPort";

export default class FakePaymentGateway implements PaymentPort {
  constructor(
    private readonly succeeds: (price: number) => boolean = () => true,
  ) {}

  async pay(price: any): Promise<boolean> {
    return this.succeeds(price);
  }
}
