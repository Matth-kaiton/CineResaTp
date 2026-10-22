import { PaymentPort } from "../../../application/ports/out/PaymentPort";

export default class FakePaymentGateway implements PaymentPort {
  async pay(price: any): Promise<boolean> {
    console.log(`[Payment] Paid: ${price}`);
    return true;
  }
}
