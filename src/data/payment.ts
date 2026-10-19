export function pay(price: number): boolean {
  // paiement : appel au prestataire (simulé)
  const paid = Math.random() > 0.05;
  return paid;
}

export function refund(amount: number) {
    // remboursement : appel au prestataire (simulé)
}
