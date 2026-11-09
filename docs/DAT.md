# Document d'architecture technique — CinéResa

> Binôme : Matthias DUMAS, Quentin LUCIEN-REINETTE
>
> Version : 1.0 · Date : 09/11/2026

---

## 1. Contexte et objectifs

CinéResa expose une API HTTP pour réserver et annuler des places de cinéma.

* **Utilisateurs** : Spectateurs.
* **Périmètre** : Consultation des séances, réservation et annulation de places, calcul du tarif, encaissement simulé et envoi du courriel de confirmation.
* **Hors périmètre** : Programmation des séances, gestion du catalogue de films, paiement bancaire réel et placement numéroté en salle.

## 2. Contraintes et exigences

| Élément | Scénario : intégrité des réservations sous forte charge |
| --- | --- |
| Source | 150 spectateurs simultanés |
| Stimulus | Réservent des places pour la même séance |
| Environnement | Production, ouverture des ventes |
| Artefact | [`BookingService`](../src/application/usecases/BookingService.ts) |
| Réponse | Le système valide les réservations dans la limite des places libres, rejette les demandes excédentaires et libère les places si le paiement échoue |
| Mesure | Zéro surréservation constatée, 100 % des requêtes traitées en moins de 500 ms |

## 3. Glossaire

| Terme du métier | Définition | Nom dans le code |
| --- | --- | --- |
| Séance | Projection d'un film dans une salle à un horaire précis avec une capacité et un prix unitaire. | [`Screening`](../src/domain/booking/Screening.ts) |
| Réservation | Achat de places par un spectateur pour une séance donnée. | [`Booking`](../src/domain/booking/Booking.ts) |
| Nombre de places | Quantité de sièges réservés par commande, comprise entre 1 et 6. | [`SeatCounts`](../src/domain/booking/SeatCount.ts) |
| Tarif spectateur | Catégorie tarifaire (`NORMAL` ou `STUDENT` avec 30 % de réduction). | [`UserStatus`](../src/domain/enum/UserStatuts.ts) |
| Politique tarifaire | Règles de calcul du prix total appliquant les remises étudiant et groupe (10 % dès 4 places). | [`PricingPolicy`](../src/domain/booking/PricingPolicy.ts) |
| Montant monétaire | Valeur financière immuable stockée en centimes d'euro. | [`Money`](../src/domain/shared/Money.ts) |
| Statut de réservation | État du cycle de vie d'une réservation (`CONFIRMED` ou `CANCELLED`). | [`BookingStatus`](../src/domain/enum/BookingStatus.ts) |
| Confirmation de réservation | Événement émis après le paiement réussi d'une réservation. | [`BookingConfirmed`](../src/domain/booking/events.ts) |
| Annulation de réservation | Événement émis lors de l'annulation d'une réservation (permise au moins 2 heures avant la séance). | [`BookingCancelled`](../src/domain/booking/events.ts) |
| Courriel | Adresse électronique validée du spectateur servant aux notifications. | [`Email`](../src/domain/shared/Email.ts) |

## 4. Vue logique

### 4.1 Style d'architecture

Architecture hexagonale (ports et adaptateurs) avec DDD tactique. Le domaine ([`Screening`](../src/domain/booking/Screening.ts), [`Booking`](../src/domain/booking/Booking.ts), objets-valeurs) encapsule les règles métier et ne dépend d'aucun module externe. L'application ([`BookingService`](../src/application/usecases/BookingService.ts)) orchestre les cas d'usage via des ports primaires et secondaires. Les adaptateurs d'infrastructure (HTTP, JSON, messagerie, paiement) dépendent de ces ports sans couplage direct avec le domaine.

### 4.2 Diagramme de composants UML

```plantuml
@startuml
skinparam componentStyle uml2

package "Adapters In" {
  [HTTP Router] as HTTP
}

package "Application" {
  [BookingService] as APP
  interface MakeBooking
  interface CancelBooking
  interface ListMyBookings
  interface BookingRepository
  interface ScreeningRepository
  interface PaymentPort
  interface NotifyPort
}

package "Domain" {
  [Domaine Réservation\n(Screening, Booking, Pricing)] as DOM
}

package "Adapters Out" {
  [Booking Repository\n(JSON / In-Memory)] as REPO_BOOKING
  [Screening Repository\n(JSON / In-Memory)] as REPO_SCREENING
  [Payment Adapter] as PAY
  [Mailer Adapter] as MAIL
}

HTTP ..> MakeBooking
HTTP ..> CancelBooking
HTTP ..> ListMyBookings

APP -up- MakeBooking
APP -up- CancelBooking
APP -up- ListMyBookings

APP ..> DOM

APP ..> BookingRepository
APP ..> ScreeningRepository
APP ..> PaymentPort
APP ..> NotifyPort

REPO_BOOKING -up- BookingRepository
REPO_SCREENING -up- ScreeningRepository
PAY -up- PaymentPort
MAIL -up- NotifyPort
@enduml
```

## 5. Vue dynamique : un cas d'erreur

Le diagramme illustre le rejet d'une commande quand la capacité restante est insuffisante, ainsi que le rejet sur incident bancaire.

```plantuml
@startuml
skinparam sequenceMessageAlign center

actor Spectateur
participant "screeningRouter\n(HTTP)" as HTTP
participant "BookingService\n(Application)" as UC
participant "ScreeningService" as SS
participant "ScreeningRepository" as REPO_S
participant "Screening\n(Agrégat)" as AGG
participant "PaymentPort" as PAY
participant "BookingRepository" as REPO_B
participant "NotifyPort" as MAIL

Spectateur -> HTTP : POST /screenings/s1/bookings\n{"email": "user@test.fr", "seats": 3, "tarif": "NORMAL"}
HTTP -> UC : makeBooking("s1", "user@test.fr", 3, "NORMAL")
UC -> SS : getScreeningById("s1")
SS -> REPO_S : getById("s1")
REPO_S --> SS : screening
SS --> UC : screening

UC -> AGG : book({ bookingId, email, seats, tariff, now })

alt places disponibles insuffisantes (remainingSeats < 3)
  AGG --> UC : throw ErrorResponse("Plus assez de places", 409)
  UC --> HTTP : throw ErrorResponse(409)
  HTTP --> Spectateur : 409 Conflict\n{"error": "Plus assez de places"}
else places suffisantes
  AGG --> UC : booking
  UC -> PAY : pay(total)
  alt échec du paiement
    PAY --> UC : false
    UC --> HTTP : throw ErrorResponse("Payment failed", 402)
    HTTP --> Spectateur : 402 Payment Required\n{"error": "Payment failed"}
  else succès du paiement
    PAY --> UC : true
    UC -> REPO_B : save(booking)
    REPO_B --> UC : booking
    UC -> MAIL : bookingConfirmed(booking)
    UC --> HTTP : booking
    HTTP --> Spectateur : 201 Created\n{"id": "b1", ...}
  end
end
@enduml
```

## 6. Décision d'architecture

| ADR | Titre | Statut |
| --- | --- | --- |
| [001](adr/001-booking-dans-screening.md) | Booking dans l'agrégat Screening ou agrégat séparé ? | Accepté |
