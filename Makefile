.PHONY: help build up down logs clean dev prod

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml

help: ## Afficher cette aide
	@echo "NGBilling - Commandes Docker"
	@echo "============================="
	@echo ""
	@echo "Production:"
	@echo "  make build    - Construire les images"
	@echo "  make up       - Démarrer les services"
	@echo "  make down     - Arrêter les services"
	@echo "  make logs     - Voir les logs"
	@echo ""
	@echo "Développement:"
	@echo "  make dev      - Démarrer en mode développement"
	@echo "  make dev-down - Arrêter le mode développement"
	@echo "  make dev-logs - Voir les logs de développement"
	@echo ""
	@echo "Utilitaires:"
	@echo "  make clean    - Nettoyer Docker"
	@echo "  make backup   - Sauvegarder la base de données"
	@echo "  make restore  - Restaurer la base de données"

build: ## Construire les images Docker
	docker-compose -f $(COMPOSE_FILE) build

up: ## Démarrer les services en production
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Arrêter les services
	docker-compose -f $(COMPOSE_FILE) down

logs: ## Voir les logs
	docker-compose -f $(COMPOSE_FILE) logs -f

dev: ## Démarrer en mode développement
	docker-compose -f $(COMPOSE_DEV_FILE) up -d

dev-down: ## Arrêter le mode développement
	docker-compose -f $(COMPOSE_DEV_FILE) down

dev-logs: ## Voir les logs de développement
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

clean: ## Nettoyer Docker
	docker-compose -f $(COMPOSE_FILE) down -v
	docker-compose -f $(COMPOSE_DEV_FILE) down -v
	docker system prune -a -f

backup: ## Sauvegarder la base de données
	docker exec ngbilling-mysql mysqldump -u ngbilling -pngbilling123 ngbilling > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore: ## Restaurer la base de données (utiliser: make restore FILE=backup.sql)
	docker exec -i ngbilling-mysql mysql -u ngbilling -pngbilling123 ngbilling < $(FILE)

restart: ## Redémarrer tous les services
	docker-compose -f $(COMPOSE_FILE) restart

restart-backend: ## Redémarrer le backend
	docker-compose -f $(COMPOSE_FILE) restart backend

restart-frontend: ## Redémarrer le frontend
	docker-compose -f $(COMPOSE_FILE) restart frontend

status: ## Voir le statut des conteneurs
	docker-compose -f $(COMPOSE_FILE) ps

shell-backend: ## Ouvrir un shell dans le conteneur backend
	docker-compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Ouvrir un shell dans le conteneur frontend
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

shell-mysql: ## Ouvrir un shell MySQL
	docker-compose -f $(COMPOSE_FILE) exec mysql mysql -u ngbilling -pngbilling123 ngbilling

check-init: ## Vérifier l'état de l'initialisation
	docker-compose -f $(COMPOSE_FILE) logs backend | grep -E "(✅|❌|⚠️)"

check-init-dev: ## Vérifier l'état de l'initialisation (dev)
	docker-compose -f $(COMPOSE_DEV_FILE) logs backend | grep -E "(✅|❌|⚠️)"

install-frontend: ## Installer une dépendance frontend (utiliser: make install-frontend PKG=package-name)
	docker-compose -f $(COMPOSE_DEV_FILE) exec frontend npm install $(PKG)

install-backend: ## Installer une dépendance backend (utiliser: make install-backend PKG=package-name)
	docker-compose -f $(COMPOSE_DEV_FILE) exec backend npm install $(PKG)

build-prod: ## Construire pour la production
	docker-compose -f $(COMPOSE_FILE) build --no-cache

build-dev: ## Construire pour le développement
	docker-compose -f $(COMPOSE_DEV_FILE) build --no-cache

test: ## Tester l'installation Docker
	./test-docker.sh 