import { UserStatus } from "../enum/UserStatuts";
import Money from "../shared/Money";
import SeatCounts from "./SeatCount";

export default class PricingPolicy {
  static readonly STUDENT_DISCOUNT = 0.3;
  static readonly GROUP_DISCOUNT = 0.1;

  static calculatePrice(
    unitPrice: Money,
    seats: SeatCounts,
    tarif: UserStatus,
  ): Money {
    let totalPrice = unitPrice.times(seats.value);
    if (tarif === UserStatus.STUDENT) {
      totalPrice = totalPrice.discount(PricingPolicy.STUDENT_DISCOUNT);
    }
    if (seats.value >= 4) {
      totalPrice = totalPrice.discount(PricingPolicy.GROUP_DISCOUNT);
    }
    return totalPrice;
  }
}
