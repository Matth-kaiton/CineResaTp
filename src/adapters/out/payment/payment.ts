import { PaymentPort } from "../../../application/ports/out/PaymentPort";
import Money from "../../../domain/shared/Money";

class Payment implements PaymentPort {
  async pay(price: Money): Promise<boolean> {
    console.log(`[Payment] Paid: ${price.cents}`);
    return true;
  }
}

export default new Payment();
