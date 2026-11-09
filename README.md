# CinéResa

API HTTP de réservation de places de cinéma conçue selon une architecture hexagonale et les motifs tactiques du Domain-Driven Design (DDD).

> Réalisé par Matthias DUMAS et Quentin LUCIEN-REINETTE.

## Prérequis

* Node.js 20+
* npm

## Installation et démarrage

```bash
npm install

# Initialiser les données de test (data/db.json)
npm run seed

# Démarrer en mémoire
npm start

# Démarrer avec persistance JSON
npm run start:json

# Mode développement (rechargement à chaud)
npm run dev
```

Serveur accessible sur `http://localhost:3000`.

## Commandes

* `npm test` : Lance la suite de tests Vitest.
* `npm run typecheck` : Vérifie les types TypeScript.
* `npm run seed` : Régénère le jeu d'essai `data/db.json`.

## Points d'entrée de l'API

| Méthode | Route | Corps de requête | Description |
|---|---|---|---|
| `GET` | `/screenings` | — | Liste les séances à venir et leurs places disponibles |
| `POST` | `/screenings/:id/bookings` | `{"email": "client@test.fr", "seats": 2, "tarif": "NORMAL"}` | Réserve des places (`STUDENT` pour le tarif étudiant) |
| `DELETE` | `/bookings/:id` | — | Annule une réservation (au plus tard 2 h avant la séance) |
| `GET` | `/bookings?email=client@test.fr` | — | Liste les réservations associées à une adresse courriel |

## Règles métier

* **Capacité** : Rejet immédiat de toute demande excédant les places restantes.
* **Volume par réservation** : Entre 1 et 6 places par commande.
* **Tarifs** :
  * `NORMAL` : Tarif plein.
  * `STUDENT` : Remise de 30 %.
  * **Groupe** : Remise de 10 % dès 4 places réservées (cumulable).
* **Montants** : Valeurs calculées et stockées en centimes d'euro.
* **Annulation** : Interdite moins de 2 heures avant le début de la séance.
* **Paiement** : Simulation avec échec aléatoire de 5 % (1 tentative sur 20).

## Architecture

Le projet isole le cœur métier de l'infrastructure :

* **Domaine** (`src/domain/`) : Racine d'agrégat `Screening`, entité `Booking`, objets-valeurs (`Money`, `Email`, `SeatCounts`), événements et calculs tarifaires (`PricingPolicy`).
* **Application** (`src/application/`) : Cas d'usage (`BookingService`, `ScreeningService`) et contrats des ports primaires et secondaires.
* **Adaptateurs** (`src/adapters/`) : Routeurs HTTP Express, dépôts mémoire/JSON, simulation de passerelle bancaire et notification par courriel.

Consultez le [Document d'Architecture Technique](docs/DAT_modele.md) et l'[ADR-001](docs/adr/001-booking-dans-screening.md) pour les justifications d'architecture.
