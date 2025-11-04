.PHONY: help install setup start-backend sync clean test lint format

# Default target
help:
	@echo "Amazon Delivery Dashboard - Backend"
	@echo ""
	@echo "Available commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make setup          - Setup virtual environment and install dependencies"
	@echo "  make start-backend  - Start the backend server"
	@echo "  make sync           - Run manual data synchronization"
	@echo "  make clean          - Remove cache and temporary files"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linting"
	@echo "  make format         - Format code with black"
	@echo ""

# Setup virtual environment
setup:
	@echo "Setting up virtual environment..."
	python3 -m venv venv
	@echo "Installing dependencies..."
	. venv/bin/activate && pip install --upgrade pip
	. venv/bin/activate && pip install -r requirements.txt
	@echo "✓ Setup complete!"

# Install dependencies
install:
	@echo "Installing dependencies..."
	. venv/bin/activate && pip install -r requirements.txt
	@echo "✓ Dependencies installed!"

# Run the backend server
start-backend:
	@echo "Starting backend server..."
	. venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Run manual data sync
sync:
	@echo "Running manual data synchronization..."
	. venv/bin/activate && python manual_sync.py

# Clean cache and temporary files
clean:
	@echo "Cleaning cache and temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.log" -delete
	@echo "✓ Cleaned!"

# Run tests
test:
	@echo "Running tests..."
	. venv/bin/activate && pytest

# Run linting
lint:
	@echo "Running linting..."
	. venv/bin/activate && flake8 app/

# Format code
format:
	@echo "Formatting code..."
	. venv/bin/activate && black app/
	@echo "✓ Code formatted!"

