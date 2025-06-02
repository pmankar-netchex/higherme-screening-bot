#!/bin/bash

# Restaurant Recruitment Platform - Docker Build Script
# This script builds and optionally runs the Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BUILD_ONLY=false
REBUILD=false
TAG="restaurant-recruitment-platform:latest"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -b, --build-only    Build the image only, don't run"
    echo "  -r, --rebuild       Rebuild without cache"
    echo "  -t, --tag TAG       Specify image tag (default: restaurant-recruitment-platform:latest)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Build and run the application"
    echo "  $0 --build-only     # Build the image only"
    echo "  $0 --rebuild        # Rebuild without cache"
    echo "  $0 -t myapp:v1.0    # Build with custom tag"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -r|--rebuild)
            REBUILD=true
            shift
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    print_warning "No .env.local or .env file found"
    print_warning "Creating .env.local from .env.example"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning "Please edit .env.local with your actual configuration"
    else
        print_error ".env.example not found. Please create environment configuration manually"
        exit 1
    fi
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data public/uploads/resumes

# Initialize data files if they don't exist
for file in applications.json candidates.json jobs.json screenings.json; do
    if [ ! -f "data/$file" ]; then
        echo '[]' > "data/$file"
        print_status "Created data/$file"
    fi
done

if [ ! -f "data/config.json" ]; then
    echo '{}' > "data/config.json"
    print_status "Created data/config.json"
fi

# Build the Docker image
print_status "Building Docker image: $TAG"

BUILD_ARGS=""
if [ "$REBUILD" = true ]; then
    BUILD_ARGS="--no-cache"
    print_status "Building without cache..."
fi

if docker build $BUILD_ARGS -t "$TAG" .; then
    print_status "Docker image built successfully: $TAG"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# If build-only flag is set, exit here
if [ "$BUILD_ONLY" = true ]; then
    print_status "Build completed. Use 'docker run' or 'docker-compose up' to start the application."
    exit 0
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    print_status "Starting application with docker-compose..."
    
    # Stop any running containers
    docker-compose down &> /dev/null || true
    
    # Start the application
    if docker-compose up -d; then
        print_status "Application started successfully!"
        print_status "Application URL: http://localhost:3000"
        print_status "Health Check: http://localhost:3000/api/health"
        print_status ""
        print_status "To view logs: docker-compose logs -f"
        print_status "To stop: docker-compose down"
    else
        print_error "Failed to start application with docker-compose"
        exit 1
    fi
else
    # Fallback to docker run
    print_status "docker-compose not found, using docker run..."
    
    # Stop any running container
    docker stop restaurant-recruitment-app &> /dev/null || true
    docker rm restaurant-recruitment-app &> /dev/null || true
    
    # Run the container
    if docker run -d \
        --name restaurant-recruitment-app \
        -p 3000:3000 \
        --env-file .env.local \
        -v "$(pwd)/data:/app/data" \
        -v "$(pwd)/public/uploads:/app/public/uploads" \
        "$TAG"; then
        
        print_status "Application started successfully!"
        print_status "Container name: restaurant-recruitment-app"
        print_status "Application URL: http://localhost:3000"
        print_status "Health Check: http://localhost:3000/api/health"
        print_status ""
        print_status "To view logs: docker logs -f restaurant-recruitment-app"
        print_status "To stop: docker stop restaurant-recruitment-app"
    else
        print_error "Failed to start application with docker run"
        exit 1
    fi
fi

# Wait a moment and check health
print_status "Waiting for application to start..."
sleep 10

if curl -f http://localhost:3000/api/health &> /dev/null; then
    print_status "Application is healthy and ready!"
else
    print_warning "Application may still be starting. Check the logs if issues persist."
fi
