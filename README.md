# CinéResa — version legacy

API de réservation de places de cinéma, volontairement écrite « à l'ancienne » : tout est dans `src/server.ts`.

```bash
npm install
npm run seed   # régénère data/db.json avec des séances dans les prochains jours
npm start      # http://localhost:3000
```

| Méthode | Route | Body |
|---|---|---|
| GET | `/screenings` | — |
| POST | `/screenings/:id/bookings` | `{ "email": "a@b.fr", "seats": 2, "tariff": "NORMAL" }` (`"STUDENT"` pour le tarif étudiant) |
| DELETE | `/bookings/:id` | — |
| GET | `/bookings?email=a@b.fr` | — |

Les prix sont en centimes. Le paiement est simulé et échoue aléatoirement 1 fois sur 20.
