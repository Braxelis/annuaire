# Backend Annuaire

- Login via **matricule + mot de passe** (JWT)
- **Admin seulement** peut créer des utilisateurs (mot de passe optionnel -> compte inactif tant qu'absent)
- **Logout** via blacklist de tokens
- Recherche par **poste**, **statut** (employé, stagiaire, A.S), **departement**, **service**, **ville** (+ `q`)

## Installation

```bash
cd backend
composer install
mysql -u root -p < sql/ANNUAIRE.sql
mysql -u root -p < sql/MIGRATION_ANNUAIRE.sql
php -S localhost:8000 -t public
```

## Endpoints

- `POST /api/login` — `{ "matricule": "...", "password": "..." }`
- `POST /api/logout` — header `Authorization: Bearer <token>`
- `GET /api/me` — voir son propre profil
- `POST /api/personnel` (**admin only**) — créer un utilisateur (mot de passe facultatif)
- `GET /api/personnel?poste=&statut=&departement=&service=&ville=&q=&limit=&offset=`

Notes:
- Un utilisateur sans `motdepasse` ne peut pas se connecter.
- `isadmin=1` requis dans le JWT pour créer un utilisateur.


