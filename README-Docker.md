# NGBilling - Docker Setup

Ce projet utilise Docker pour containeriser l'application complète avec le frontend React, le backend Express.js et la base de données MySQL.

## 🚀 Démarrage rapide

### Production
```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Tester l'installation
make test
```

### 🔐 Compte Admin par défaut
L'administrateur est créé automatiquement lors du premier démarrage :
- **Email** : admin@ngbilling.com
- **Mot de passe** : admin123

⚠️ **Important** : Changez le mot de passe après la première connexion !

### Développement
```bash
# Construire et démarrer en mode développement
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter les services
docker-compose -f docker-compose.dev.yml down

# Tester l'installation (dev)
make test
```

## 📁 Structure des fichiers Docker

```
NGBilling-main/
├── Dockerfile                 # Frontend production
├── Dockerfile.dev            # Frontend development
├── docker-compose.yml        # Production setup
├── docker-compose.dev.yml    # Development setup
├── nginx.conf               # Nginx configuration
├── .dockerignore            # Files to exclude
├── backend/
│   ├── Dockerfile           # Backend production
│   ├── Dockerfile.dev       # Backend development
│   └── .dockerignore        # Backend specific exclusions
└── frontend/
    └── ...                  # React app files
```

## 🔧 Configuration

### Variables d'environnement

#### Backend
- `NODE_ENV`: production/development
- `DB_HOST`: mysql
- `DB_PORT`: 3306
- `DB_USERNAME`: ngbilling
- `DB_PASSWORD`: ngbilling123
- `DB_DATABASE`: ngbilling
- `JWT_SECRET`: your-super-secret-jwt-key-change-in-production
- `PORT`: 3001

#### Frontend
- `VITE_API_URL`: http://localhost:3001/api/v1

#### MySQL
- `MYSQL_ROOT_PASSWORD`: rootpassword
- `MYSQL_DATABASE`: ngbilling
- `MYSQL_USER`: ngbilling
- `MYSQL_PASSWORD`: ngbilling123

## 🌐 Accès aux services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Nginx Proxy**: http://localhost:80
- **MySQL**: localhost:3306

## 🛠️ Commandes utiles

### Gestion des conteneurs
```bash
# Voir les conteneurs en cours
docker ps

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Redémarrer un service
docker-compose restart backend

# Reconstruire un service
docker-compose build backend
docker-compose up -d backend
```

### Base de données
```bash
# Accéder à MySQL
docker exec -it ngbilling-mysql mysql -u ngbilling -p

# Sauvegarder la base de données
docker exec ngbilling-mysql mysqldump -u ngbilling -p ngbilling > backup.sql

# Restaurer la base de données
docker exec -i ngbilling-mysql mysql -u ngbilling -p ngbilling < backup.sql
```

### Développement
```bash
# Mode développement avec hot reload
docker-compose -f docker-compose.dev.yml up -d

# Installer de nouvelles dépendances
docker-compose -f docker-compose.dev.yml exec frontend npm install package-name
docker-compose -f docker-compose.dev.yml exec backend npm install package-name

# Exécuter des commandes dans les conteneurs
docker-compose -f docker-compose.dev.yml exec frontend npm run build
docker-compose -f docker-compose.dev.yml exec backend npm run test
```

## 🔒 Sécurité

### Production
1. Changez tous les mots de passe par défaut
2. Utilisez des secrets Docker pour les variables sensibles
3. Activez HTTPS avec des certificats SSL
4. Configurez un firewall
5. Utilisez des images Docker officielles et à jour

### Variables d'environnement sécurisées
```bash
# Créer un fichier .env pour la production
cp .env.example .env
# Éditer .env avec vos vraies valeurs
```

## 📊 Monitoring

### Health checks
- **Nginx**: http://localhost/health
- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:3000

### Initialisation automatique
Le système effectue automatiquement :
1. ✅ Connexion à la base de données MySQL
2. ✅ Exécution des migrations TypeORM
3. ✅ Création de l'utilisateur admin par défaut
4. ✅ Démarrage de l'API backend
5. ✅ Démarrage du frontend React

### Logs
```bash
# Tous les logs
docker-compose logs

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
```

## 🚨 Dépannage

### Problèmes courants

1. **Ports déjà utilisés**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3001
   ```

2. **Base de données ne démarre pas**
   ```bash
   # Vérifier les logs MySQL
   docker-compose logs mysql
   
   # Redémarrer MySQL
   docker-compose restart mysql
   ```

3. **Frontend ne peut pas se connecter au backend**
   - Vérifier que `VITE_API_URL` est correct
   - Vérifier que le backend démarre avant le frontend

4. **Permissions sur les volumes**
   ```bash
   # Corriger les permissions
   sudo chown -R $USER:$USER ./backend/uploads
   ```

### Nettoyage
```bash
# Supprimer tous les conteneurs et volumes
docker-compose down -v

# Supprimer les images
docker rmi $(docker images -q ngbilling-*)

# Nettoyer Docker
docker system prune -a
```

## 🔄 Mise à jour

```bash
# Arrêter les services
docker-compose down

# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 📝 Notes importantes

- Les données MySQL sont persistées dans le volume `mysql_data`
- Les uploads sont stockés dans `./backend/uploads`
- Le mode développement utilise des volumes pour le hot reload
- Nginx sert de reverse proxy et gère le CORS
- Tous les services redémarrent automatiquement sauf en cas d'erreur fatale 