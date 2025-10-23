#!/bin/bash

# BB Fireworks - Helper Scripts
# Quick commands for common development and production tasks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Show usage
show_help() {
    echo ""
    echo "BB Fireworks - Helper Scripts"
    echo "=============================="
    echo ""
    echo "Usage: ./scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development server"
    echo "  prod             Build and start production server"
    echo "  build            Build for production"
    echo "  start            Start production server (must build first)"
    echo "  clean            Clean build cache and node_modules"
    echo "  restart          Kill all servers and restart production"
    echo "  kill             Kill all running Next.js servers"
    echo "  check            Check running processes"
    echo "  test             Run tests (if configured)"
    echo "  lint             Run ESLint"
    echo "  format           Format code with Prettier"
    echo "  db:push          Push Prisma schema to database"
    echo "  db:migrate       Run database migrations"
    echo "  db:studio        Open Prisma Studio"
    echo "  help             Show this help message"
    echo ""
}

# Kill all Next.js processes
kill_servers() {
    print_info "Stopping all Next.js servers..."
    pkill -9 -f "node.*next" 2>/dev/null || true
    sleep 2
    print_success "All servers stopped"
}

# Start development server
start_dev() {
    kill_servers
    print_info "Starting development server..."
    npm run dev
}

# Build for production
build_prod() {
    print_info "Building for production..."
    rm -rf .next
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Start production server
start_prod() {
    print_info "Starting production server..."
    npm start
}

# Build and start production
build_and_start() {
    build_prod
    if [ $? -eq 0 ]; then
        print_info "Starting production server..."
        npm start
    fi
}

# Clean build artifacts
clean() {
    print_info "Cleaning build cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    print_success "Cache cleaned"
}

# Complete clean (including node_modules)
clean_all() {
    print_warning "This will delete node_modules and require reinstall"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning everything..."
        rm -rf .next
        rm -rf node_modules
        print_success "Complete clean done. Run 'npm install' to reinstall dependencies"
    else
        print_info "Cancelled"
    fi
}

# Restart production server
restart_prod() {
    kill_servers
    print_info "Rebuilding..."
    build_prod
    if [ $? -eq 0 ]; then
        print_info "Starting production server..."
        npm start
    fi
}

# Check running processes
check_processes() {
    print_info "Checking running Next.js processes..."
    echo ""
    ps aux | grep "[n]ode.*next" || print_warning "No Next.js processes running"
    echo ""
    print_info "Checking port 3000..."
    lsof -i :3000 || print_success "Port 3000 is free"
}

# Database commands
db_push() {
    print_info "Pushing Prisma schema to database..."
    npm run db:push
}

db_migrate() {
    print_info "Running database migrations..."
    npm run db:migrate
}

db_studio() {
    print_info "Opening Prisma Studio..."
    npx prisma studio
}

# Lint
run_lint() {
    print_info "Running ESLint..."
    npm run lint
}

# Main script logic
case "$1" in
    dev)
        start_dev
        ;;
    prod)
        build_and_start
        ;;
    build)
        build_prod
        ;;
    start)
        start_prod
        ;;
    clean)
        clean
        ;;
    clean:all)
        clean_all
        ;;
    restart)
        restart_prod
        ;;
    kill)
        kill_servers
        ;;
    check)
        check_processes
        ;;
    lint)
        run_lint
        ;;
    db:push)
        db_push
        ;;
    db:migrate)
        db_migrate
        ;;
    db:studio)
        db_studio
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            print_error "No command specified"
        else
            print_error "Unknown command: $1"
        fi
        show_help
        exit 1
        ;;
esac
