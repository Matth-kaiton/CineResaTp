# ADR-001 : Booking dans l'agrégat Screening ou agrégat séparé

Statut : accepté - 09/11/2026

## Contexte

La réservation de places exige le respect d'un invariant strict : le cumul des places réservées ne doit jamais excéder la capacité de la salle. Le système doit maintenir cette règle sous accès concurrents.

## Options envisagées

1. **Option 1 : `Booking` comme entité interne de l'agrégat `Screening`**
   `Screening` constitue la racine d'agrégat. Il contient ses réservations et valide la disponibilité des places lors de chaque commande.
2. **Option 2 : `Booking` et `Screening` en agrégats distincts**
   Chaque entité possède sa racine et son dépôt. Un service applicatif contrôle le nombre de places avant d'enregistrer la réservation.

## Décision

Option 1 retenue : `Booking` réside dans l'agrégat dont `Screening` forme la racine.

La racine `Screening` protège l'invariant de non-surréservation au cœur du domaine.

## Conséquences

```text
+ Cohérence immédiate : l'agrégat interdit tout dépassement de capacité sans mécanisme externe.
+ Encapsulation métier : le calcul des places libres et les règles d'annulation restent isolés dans le domaine.
- Concurrence : les réservations simultanées ciblent le même agrégat et nécessitent une gestion des conflits à l'écriture.
- Chargement mémoire : reconstituer une séance impose de charger toutes ses réservations confirmées.
```
