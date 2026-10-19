### GET /screenings ligne 23

json retourné un tableau des scéance a venir

retour json success

```json
[
  {
    "id": "s1",
    "movie": "Dune: Part Three",
    "room": "Salle 1",
    "startsAt": "2026-11-06T17:02:38.990Z",
    "price": 1150,
    "remaining": 120
  }
]
```

### POST /screenings/:id/bookings ligne 49

Reserve une place besoin d'un format de mail valide
que la séance est des place restante et quel n'a pas commencé
envoie également le mail de confirmation

payload attendu

```json
{
  "email": "matthias@ynov.com",
  "seats": 5,
  "tarif": "STUDENT"
}
```

retour json success

```json
{
  "id": "b1792400865419",
  "screeningId": "s1",
  "email": "matthias@ynov.com",
  "seats": 5,
  "tariff": "NORMAL",
  "total": 5175,
  "status": "CONFIRMED",
  "createdAt": "2026-10-19T09:07:45.419Z"
}
```

### DELETE /bookings/:id

permet d'annuler une réservation
temps que l'annulation se fait plus de 2 heure avant la séance
vérifie que la reservation existe et n'est pas déja annulé

retour json success

```json
{
  "id": "b1792400865419",
  "screeningId": "s1",
  "email": "matthias@ynov.com",
  "seats": 5,
  "tariff": "NORMAL",
  "total": 5175,
  "status": "CANCELLED",
  "createdAt": "2026-10-19T09:07:45.419Z",
  "cancelledAt": "2026-10-19T09:10:13.913Z"
}
```

### GET /bookings?email=...

récupère le tableau des reservationn d'un utilisateur via son mail en params
affiche totue les reservation annuler ou active

retour json success

/bookings?email=matthias@ynov.com

```json
[
  {
    "id": "b1792400865419",
    "screeningId": "s1",
    "email": "matthias@ynov.com",
    "seats": 5,
    "tariff": "NORMAL",
    "total": 5175,
    "status": "CANCELLED",
    "createdAt": "2026-10-19T09:07:45.419Z",
    "cancelledAt": "2026-10-19T09:10:13.913Z",
    "movie": "Dune: Part Three",
    "startsAt": "2026-11-06T17:02:38.990Z"
  }
]
```

| ligne     | bloc code                | responsabilité                                                                                                                                                                                                                                                     |
| --------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 23 - 43   | /screenings              | lecture de la bdd recup des séance et calcule les place restante                                                                                                                                                                                                   |
| 49 - 109  | /screenings/:id/bookings | Crée un reservastion pour une scéance vérifie les donné personnele de la reservation le nombre de place disponible ainsi que le nombre de place maximun par reservation, si la séance à déja commencer pas de resercvation également calcule du prix total à payer |
| 114 - 137 | /bookings/:id            | Annule une reservation Vérifie si l'id est valide si déja annuler et si plus de 2 heures avant le début de la scéance                                                                                                                                              |
| 142 - 155 | /bookings                | récupère toute les reservation assosier à l'email donnée return le film si renseigné sinon "?" et la date de début si renségé sinon "null"                                                                                                                         |

### Code Smells

| Nom                        | ligne             | probème                                                                                                                                                                                                                                             |
| -------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All in one                 | fichier server.ts | tous dans un seul fichier dur à maintenir accumulation de dette technique                                                                                                                                                                           |
| calculer des place retante | 30 -32 , 72 - 74  | duplication de code function dans un service pour calculer les place restante recommandé                                                                                                                                                            |
| Lecture ecriture DB        | 12 - 18           | les function d'écriture et de lecture ne son pas dans un service à part recommander pour appeler ensuite dans chaque fichier et ne pas dupliquer le code                                                                                            |
| Id reservation             | 90                | enregistre l'id avec "b" et un timestamps si 2 personne clique sur réservation ene meme temps sur la meme scéance un problème peut survennir plus tard si annulation risque d'annulation de la mauvaise résa commbiné mail + timestamps plus sécure |
| retour sans code http      | 42                | pas de code response 200 dans la d'un GET                                                                                                                                                                                                           |
| Enum manquant              | 94, 96, 129       | les valeur son des string si une erreur de frappe impossible de faire des requete éfficacement utilisatation d'ENUM recommander                                                                                                                     |
