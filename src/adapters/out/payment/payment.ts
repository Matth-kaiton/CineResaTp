import { PaymentPort } from "../../../application/ports/out/PaymentPort";

class Payment implements PaymentPort {
  async pay(price: number): Promise<boolean> {
    console.log(`[Payment] Paid: ${price}`);
    return true;
  }
}

export default new Payment();
