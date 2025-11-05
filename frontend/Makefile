.PHONY: help install start-frontend run build clean dev lint format test stop

# Default target
help:
	@echo "Amazon Delivery Dashboard - Frontend"
	@echo ""
	@echo "Available commands:"
	@echo "  make install         - Install dependencies"
	@echo "  make start-frontend  - Start development server"
	@echo "  make dev             - Start development server (alias)"
	@echo "  make run             - Start development server (alias)"
	@echo "  make stop            - Stop frontend server (kill port 2000)"
	@echo "  make build           - Build for production"
	@echo "  make preview         - Preview production build"
	@echo "  make clean           - Remove build artifacts and dependencies"
	@echo "  make lint            - Run linting"
	@echo "  make format          - Format code"
	@echo "  make test            - Run tests"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "✓ Dependencies installed!"

# Start development server
start-frontend:
	@echo "Starting frontend development server..."
	@lsof -ti:2000 | xargs kill -9 2>/dev/null || true
	npm run dev

# Aliases for start-frontend
dev: start-frontend
run: start-frontend

# Stop frontend server
stop:
	@echo "Stopping frontend server on port 2000..."
	@lsof -ti:2000 | xargs kill -9 2>/dev/null || true
	@echo "✓ Frontend server stopped!"

# Build for production
build:
	@echo "Building for production..."
	npm run build
	@echo "✓ Build complete!"

# Preview production build
preview:
	@echo "Starting preview server..."
	npm run preview

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf node_modules
	rm -rf dist
	rm -f package-lock.json
	@echo "✓ Cleaned!"

# Run linting
lint:
	@echo "Running linting..."
	npm run lint

# Format code
format:
	@echo "Formatting code..."
	npm run format || echo "No format script configured"
	@echo "✓ Code formatted!"

# Run tests
test:
	@echo "Running tests..."
	npm run test || echo "No tests configured"

