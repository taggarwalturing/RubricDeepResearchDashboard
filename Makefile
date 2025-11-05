.PHONY: help install setup start-backend start-frontend run-backend run-frontend run-all stop clean sync test lint format

# Default target
help:
	@echo "Amazon Delivery Dashboard"
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup           - Setup both frontend and backend"
	@echo "  make install         - Install dependencies for both"
	@echo ""
	@echo "Running:"
	@echo "  make start-backend   - Start backend server"
	@echo "  make start-frontend  - Start frontend dev server"
	@echo "  make run-all         - Start both frontend and backend"
	@echo "  make stop            - Stop all running processes"
	@echo ""
	@echo "Data Management:"
	@echo "  make sync            - Run manual data synchronization"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean           - Clean all build artifacts"
	@echo "  make test            - Run all tests"
	@echo "  make lint            - Run linting on both"
	@echo "  make format          - Format code for both"
	@echo ""
	@echo "Individual Components:"
	@echo "  cd backend && make help   - Backend commands"
	@echo "  cd frontend && make help  - Frontend commands"
	@echo ""

# Setup both frontend and backend
setup:
	@echo "═══════════════════════════════════════"
	@echo "Setting up Backend..."
	@echo "═══════════════════════════════════════"
	cd backend && $(MAKE) setup
	@echo ""
	@echo "═══════════════════════════════════════"
	@echo "Setting up Frontend..."
	@echo "═══════════════════════════════════════"
	cd frontend && $(MAKE) install
	@echo ""
	@echo "✓ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Configure backend/.env file"
	@echo "  2. Setup PostgreSQL database"
	@echo "  3. Run: make run-all"

# Install dependencies for both
install:
	@echo "Installing backend dependencies..."
	cd backend && $(MAKE) install
	@echo ""
	@echo "Installing frontend dependencies..."
	cd frontend && $(MAKE) install
	@echo ""
	@echo "✓ All dependencies installed!"

# Run backend server
start-backend:
	@echo "Starting backend server..."
	cd backend && $(MAKE) start-backend

# Alias for start-backend
run-backend: start-backend

# Run frontend dev server
start-frontend:
	@echo "Starting frontend dev server..."
	cd frontend && $(MAKE) start-frontend

# Alias for start-frontend
run-frontend: start-frontend

# Run both frontend and backend
run-all:
	@echo "Starting both frontend and backend..."
	@echo ""
	@echo "Backend will run on: http://localhost:5000"
	@echo "Frontend will run on: http://localhost:2000"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@echo ""
	@$(MAKE) -j2 start-backend start-frontend

# Stop all running processes
stop:
	@echo "Stopping all processes..."
	@pkill -f "uvicorn app.main:app" || true
	@pkill -f "vite" || true
	@echo "✓ All processes stopped!"

# Run manual data sync
sync:
	@echo "Running manual data synchronization..."
	cd backend && $(MAKE) sync

# Clean all build artifacts
clean:
	@echo "Cleaning backend..."
	cd backend && $(MAKE) clean
	@echo ""
	@echo "Cleaning frontend..."
	cd frontend && $(MAKE) clean
	@echo ""
	@echo "✓ All cleaned!"

# Run all tests
test:
	@echo "Running backend tests..."
	cd backend && $(MAKE) test || true
	@echo ""
	@echo "Running frontend tests..."
	cd frontend && $(MAKE) test || true

# Run linting on both
lint:
	@echo "Linting backend..."
	cd backend && $(MAKE) lint || true
	@echo ""
	@echo "Linting frontend..."
	cd frontend && $(MAKE) lint || true

# Format code for both
format:
	@echo "Formatting backend..."
	cd backend && $(MAKE) format
	@echo ""
	@echo "Formatting frontend..."
	cd frontend && $(MAKE) format

