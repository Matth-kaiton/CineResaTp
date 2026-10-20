import { describe, it } from "vitest";

// Squelette fourni : transformez chaque it.todo en vrai test.
// Utilisez uniquement des adapters de test : InMemory…Repository, FakePaymentGateway(() => true/false),
// une horloge figée { now: () => NOW }, un générateur d'id { next: () => "b1" } et un notifier « espion ».
describe("BookSeatsService", () => {
  it.todo("réserve des places, calcule le prix (4 places étudiant = 2 520 centimes pour 10 €) et notifie le client");
  it.todo("refuse si la capacité de la salle est dépassée");
  it.todo("refuse une séance déjà commencée (code CONFLICT)");
  it.todo("refuse plus de 6 places (code INVALID)");
  it.todo("refuse un email invalide (code INVALID)");
  it.todo("refuse une séance inconnue (code NOT_FOUND)");
  it.todo("n'enregistre rien et ne notifie pas si le paiement est refusé (code PAYMENT_REFUSED)");
});
