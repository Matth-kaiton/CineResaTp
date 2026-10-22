import { UserStatus } from "../domain/enum/UserStatuts";

export function pay(price: number): boolean {
  // paiement : appel au prestataire (simulé)
  const paid = Math.random() > 0.05;
  return paid;
}

export function refund(amount: number) {
  // remboursement : appel au prestataire (simulé)
}

const STUDENT_DISCOUNT = 0.7;
const GROUP_DISCOUNT = 0.9;

export function calculatePrice(
  unitPrice: number,
  seats: number,
  tarif: UserStatus,
): number {
  let totalPrice = unitPrice * seats;
  if (tarif === UserStatus.STUDENT) {
    totalPrice = Math.round(totalPrice * STUDENT_DISCOUNT);
  }
  if (seats >= 4) {
    totalPrice = Math.round(totalPrice * GROUP_DISCOUNT);
  }
  return totalPrice;
}
