# NGBilling - Système de Facturation

Un système de facturation moderne développé avec React, TypeScript, Tailwind CSS et une API Express.js.

## 🚀 Fonctionnalités

- **Dashboard** - Vue d'ensemble avec statistiques et graphiques
- **Gestion des Clients** - CRUD complet pour la gestion des clients
- **Factures** - Création et gestion des factures
- **Devis** - Génération et suivi des devis
- **Bons de Livraison** - Gestion des livraisons
- **Paiements** - Suivi des paiements et relances
- **Produits** - Catalogue de produits et services
- **Rapports** - Génération de rapports et analyses
- **Paramètres** - Configuration du système
- **Authentification** - Système de connexion sécurisé avec JWT

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling et design
- **Vite** - Build tool et développement
- **React Query** - Gestion d'état et cache des données
- **Axios** - Client HTTP pour les appels API

### Backend
- **Express.js** - Framework Node.js
- **TypeORM** - ORM pour la base de données
- **MySQL** - Base de données
- **JWT** - Authentification sécurisée
- **bcrypt** - Hashage des mots de passe

## 📦 Installation et Configuration

### Prérequis
- Node.js (v16 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

### 1. Configuration de la Base de Données

1. Créez une base de données MySQL :
```sql
CREATE DATABASE ngbilling;
```

2. Configurez les variables d'environnement du backend :
```bash
cd backend
cp .env.example .env
```

3. Modifiez le fichier `.env` avec vos paramètres :
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=ngbilling

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

### 2. Installation et Démarrage du Backend

```bash
cd backend
npm install
npm run dev
```

Le serveur backend sera accessible sur `http://localhost:3001`

### 3. Installation et Démarrage du Frontend

1. Configurez les variables d'environnement :
```bash
cp env.example .env
```

2. Modifiez le fichier `.env` :
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_DEV_MODE=true
```

3. Installez les dépendances et démarrez :
```bash
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 🔐 Authentification

### Création d'un Compte Administrateur

#### Option 1: Script automatique (Recommandé)
```bash
# Depuis le répertoire racine
node create-admin.js
```

#### Option 2: Script backend
```bash
# Depuis le répertoire backend
npm run create-admin
```

#### Option 3: API manuelle
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ngbilling.com",
    "password": "admin123",
    "nom": "Administrateur NGBilling",
    "telephone": "0123456789"
  }'
```

### Connexion

1. Accédez à l'application frontend
2. Utilisez les identifiants par défaut :
   - **Email:** admin@ngbilling.com
   - **Password:** admin123
3. Le token JWT sera automatiquement stocké et utilisé pour les requêtes API

## 🏗️ Structure du Projet

```
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── context/           # Contextes React (Auth, App)
│   ├── hooks/             # Hooks personnalisés (API)
│   ├── pages/             # Pages de l'application
│   ├── types/             # Définitions TypeScript
│   └── utils/             # Utilitaires (API client)
├── backend/               # API Express.js
│   ├── src/
│   │   ├── config/        # Configuration (DB, etc.)
│   │   ├── controllers/   # Contrôleurs API
│   │   ├── middlewares/   # Middlewares (auth, validation)
│   │   ├── models/        # Modèles TypeORM
│   │   └── routes/        # Routes API
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription
- `GET /api/v1/auth/profile` - Profil utilisateur

### Clients
- `GET /api/v1/clients` - Liste des clients
- `POST /api/v1/clients` - Créer un client
- `PUT /api/v1/clients/:id` - Modifier un client
- `DELETE /api/v1/clients/:id` - Supprimer un client

### Produits
- `GET /api/v1/produits` - Liste des produits
- `POST /api/v1/produits` - Créer un produit
- `PUT /api/v1/produits/:id` - Modifier un produit
- `DELETE /api/v1/produits/:id` - Supprimer un produit

### Factures
- `GET /api/v1/factures` - Liste des factures
- `POST /api/v1/factures` - Créer une facture
- `PUT /api/v1/factures/:id` - Modifier une facture
- `DELETE /api/v1/factures/:id` - Supprimer une facture

### Paiements
- `GET /api/v1/paiements` - Liste des paiements
- `POST /api/v1/paiements` - Créer un paiement
- `PUT /api/v1/paiements/:id` - Modifier un paiement
- `DELETE /api/v1/paiements/:id` - Supprimer un paiement

## 🚀 Scripts Disponibles

### Frontend
- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Vérifie le code avec ESLint

### Backend
- `npm run dev` - Lance le serveur de développement avec nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Lance le serveur de production
- `npm run typeorm` - Commandes TypeORM

## 🧪 Tests

### Test de Connexion API

1. Démarrez le backend et le frontend
2. Créez un compte via l'API ou utilisez un compte existant
3. Connectez-vous via l'interface web
4. Vérifiez que les données se chargent depuis l'API

### Test des Endpoints

Vous pouvez tester les endpoints avec curl ou Postman :

```bash
# Test de connexion
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ngbilling.com", "password": "password123"}'

# Test de récupération des clients (avec token)
curl -X GET http://localhost:3001/api/v1/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.