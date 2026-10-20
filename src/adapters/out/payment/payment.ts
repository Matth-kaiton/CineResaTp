import { PaymentPort } from "../../../application/ports/out/PaymentPort";

export default class Payment implements PaymentPort {
  async pay(price: number): Promise<boolean> {
    console.log(`[Payment] Paid: ${price}`);
    return true;
  }
}
