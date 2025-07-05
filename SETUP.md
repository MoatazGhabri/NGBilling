# 🚀 NGBilling - Guide de Configuration Rapide

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

## ⚡ Configuration Rapide

### 1. Configuration de la Base de Données

```bash
# Créez une base de données MySQL
CREATE DATABASE ngbilling;
```

### 2. Configuration du Backend

```bash
cd backend
cp .env.example .env
```

Modifiez le fichier `.env` :
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=ngbilling

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

### 3. Démarrage du Backend

```bash
cd backend
npm install
npm run dev
```

### 4. Création de l'Administrateur

```bash
# Depuis le répertoire racine
node create-admin.js
```

### 5. Configuration du Frontend

```bash
# Depuis le répertoire racine
cp env.example .env
```

Modifiez le fichier `.env` :
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_DEV_MODE=true
```

### 6. Démarrage du Frontend

```bash
npm install
npm run dev
```

## 🔐 Connexion

- **URL:** http://localhost:5173
- **Email:** admin@ngbilling.com
- **Password:** admin123

## 🧪 Test de l'API

```bash
node test-api.js
```

## 📁 Structure des Fichiers

```
NGBilling/
├── backend/           # API Express.js
├── src/              # Frontend React
├── create-admin.js   # Script de création admin
├── test-api.js       # Script de test API
└── SETUP.md          # Ce guide
```

## 🆘 Dépannage

### Problème de Connexion à la Base de Données
- Vérifiez que MySQL est démarré
- Vérifiez les paramètres dans `.env`
- Testez la connexion : `mysql -u username -p`

### Problème de Port
- Backend par défaut : 3001
- Frontend par défaut : 5173
- Vérifiez qu'aucun autre service n'utilise ces ports

### Problème d'Authentification
- Vérifiez que l'admin a été créé : `node create-admin.js`
- Vérifiez les logs du backend pour les erreurs

## 🎉 Félicitations !

Votre application NGBilling est maintenant prête à être utilisée ! 