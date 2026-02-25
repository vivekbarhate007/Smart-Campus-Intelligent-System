.PHONY: up down seed test logs backend frontend install

# Start all services with Docker Compose
up:
	docker-compose up -d
	@echo "Services started. Frontend: http://localhost:3000, Backend: http://localhost:8001"

# Stop all services
down:
	docker-compose down

# Seed the database with synthetic data
seed:
	cd backend && python seed_data.py

# Run all tests
test: test-backend test-frontend

test-backend:
	cd backend && pytest tests/ -v

test-frontend:
	cd frontend && yarn test

# View logs
logs:
	docker-compose logs -f

# Install dependencies
install: install-backend install-frontend

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && yarn install

# Development servers
backend:
	cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8001

frontend:
	cd frontend && yarn start

# Clean up
clean:
	docker-compose down -v
	rm -rf frontend/node_modules
	rm -rf backend/__pycache__
	rm -rf backend/.pytest_cache

# Database operations
db-shell:
	mongosh test_database

db-backup:
	mongodump --db campus_analytics --out ./backup

db-restore:
	mongorestore --db campus_analytics ./backup/campus_analytics
