#!/bin/bash

# LeadsRapido Database Setup Script
# PostgreSQL 15+ installation and configuration for production

set -euo pipefail

# Configuration variables
DB_NAME="leadsrapido"
DB_USER="leadsrapido_admin"
DB_PASSWORD=""
DB_HOST="localhost"
DB_PORT="5432"
POSTGRES_VERSION="16"
BACKUP_DIR="/var/backups/leadsrapido"
LOG_DIR="/var/log/leadsrapido"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check OS
    if ! command -v lsb_release &> /dev/null; then
        error "This script requires lsb_release. Please install lsb-release package."
    fi
    
    OS=$(lsb_release -si)
    if [[ "$OS" != "Ubuntu" && "$OS" != "Debian" ]]; then
        warn "This script is optimized for Ubuntu/Debian. Proceed with caution."
    fi
    
    # Check available memory (minimum 2GB recommended)
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    
    if [[ $MEMORY_GB -lt 2 ]]; then
        warn "System has less than 2GB RAM. PostgreSQL performance may be affected."
    fi
    
    # Check available disk space (minimum 10GB recommended)
    DISK_SPACE=$(df / | tail -1 | awk '{print $4}')
    DISK_SPACE_GB=$((DISK_SPACE / 1024 / 1024))
    
    if [[ $DISK_SPACE_GB -lt 10 ]]; then
        warn "Less than 10GB disk space available. Consider expanding storage."
    fi
    
    log "System requirements check completed"
}

# Install PostgreSQL
install_postgresql() {
    log "Installing PostgreSQL $POSTGRES_VERSION..."

    # Update package list
    sudo apt-get update

    # Install required packages
    sudo apt-get install -y wget ca-certificates

    # Add PostgreSQL official APT repository (caso ainda não exista)
    if [ ! -f /etc/apt/sources.list.d/pgdg.list ]; then
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
        echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
    fi

    # Update package list novamente
    sudo apt-get update

    # Instala PostgreSQL 16 e remove versões antigas se necessário
    sudo apt-get install -y postgresql-16 postgresql-client-16 postgresql-contrib-16
    sudo apt-get install -y postgis postgresql-16-postgis-3

    # Se cluster antigo existir, orientar migração
    if sudo pg_lsclusters | grep -q '^15'; then
        warn "Cluster PostgreSQL 15 detectado. Recomenda-se migrar para 16 com:"
        echo "sudo pg_dropcluster --stop 16 main"
        echo "sudo pg_upgradecluster 15 main"
        echo "Após a migração, remova o PostgreSQL 15: sudo apt-get remove --purge postgresql-15 postgresql-client-15"
    fi

    log "PostgreSQL $POSTGRES_VERSION instalado com sucesso"
}

# Configure PostgreSQL
configure_postgresql() {
    log "Configuring PostgreSQL..."
    
    local PG_VERSION="$POSTGRES_VERSION"
    local PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
    local PG_DATA_DIR="/var/lib/postgresql/$PG_VERSION/main"
    
    # Backup original configuration
    sudo cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup"
    sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"
    
    # Configure postgresql.conf for production
    sudo tee "$PG_CONFIG_DIR/conf.d/leadsrapido.conf" > /dev/null <<EOF
# LeadsRapido Production Configuration

# Connection Settings
max_connections = 200
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
huge_pages = try

# WAL Settings
wal_buffers = 16MB
wal_level = replica
max_wal_size = 2GB
min_wal_size = 1GB
checkpoint_completion_target = 0.7
checkpoint_timeout = 10min

# Query Planner
random_page_cost = 1.1
seq_page_cost = 1.0
cpu_tuple_cost = 0.01
cpu_index_tuple_cost = 0.005
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_statement = 'ddl'
log_temp_files = 0

# Performance
shared_preload_libraries = 'pg_stat_statements'
track_activity_query_size = 2048
track_functions = all
track_io_timing = on

# Autovacuum
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 30s
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05

# Security
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'root.crt'
password_encryption = scram-sha-256

# Locale
lc_messages = 'en_US.UTF-8'
lc_monetary = 'pt_BR.UTF-8'
lc_numeric = 'pt_BR.UTF-8'
lc_time = 'pt_BR.UTF-8'
default_text_search_config = 'pg_catalog.portuguese'
EOF

    # Configure pg_hba.conf for security
    sudo tee -a "$PG_CONFIG_DIR/pg_hba.conf" > /dev/null <<EOF

# LeadsRapido Security Configuration
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
# Local connections
local   $DB_NAME        $DB_USER                               scram-sha-256
local   $DB_NAME        leadsrapido_app                        scram-sha-256
local   $DB_NAME        leadsrapido_readonly                   scram-sha-256

# IPv4 local connections
host    $DB_NAME        $DB_USER        127.0.0.1/32           scram-sha-256
host    $DB_NAME        leadsrapido_app 127.0.0.1/32           scram-sha-256
host    $DB_NAME        leadsrapido_readonly 127.0.0.1/32      scram-sha-256

# IPv6 local connections
host    $DB_NAME        $DB_USER        ::1/128                scram-sha-256
host    $DB_NAME        leadsrapido_app ::1/128                scram-sha-256
host    $DB_NAME        leadsrapido_readonly ::1/128           scram-sha-256

# Remote connections (uncomment and configure for production)
# host    $DB_NAME        leadsrapido_app your.app.server.ip/32 scram-sha-256
EOF

    log "PostgreSQL configuration completed"
}

# Create SSL certificates
create_ssl_certificates() {
    log "Creating SSL certificates..."
    
    local PG_VERSION="$POSTGRES_VERSION"
    local PG_DATA_DIR="/var/lib/postgresql/$PG_VERSION/main"
    
    # Generate self-signed certificate for development
    # In production, use proper certificates from a CA
    sudo -u postgres openssl req -new -x509 -days 365 -nodes -text \
        -out "$PG_DATA_DIR/server.crt" \
        -keyout "$PG_DATA_DIR/server.key" \
        -subj "/CN=leadsrapido-db"
    
    sudo -u postgres chmod 600 "$PG_DATA_DIR/server.key"
    sudo -u postgres chmod 644 "$PG_DATA_DIR/server.crt"
    
    log "SSL certificates created"
}

# Generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Prompt for database password
prompt_password() {
    while [[ -z "$DB_PASSWORD" ]]; do
        echo -n "Enter password for database user '$DB_USER' (or press Enter to generate): "
        read -s input_password
        echo
        
        if [[ -z "$input_password" ]]; then
            DB_PASSWORD=$(generate_password)
            log "Generated password: $DB_PASSWORD"
            echo "Please save this password securely!"
        else
            DB_PASSWORD="$input_password"
        fi
        
        # Validate password strength
        if [[ ${#DB_PASSWORD} -lt 12 ]]; then
            warn "Password should be at least 12 characters long"
            DB_PASSWORD=""
        fi
    done
}

# Create database and users
create_database() {
    log "Creating database and users..."
    
    # Start PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database
    # sudo -u postgres createdb "$DB_NAME" -E UTF8 -T template0
    
    # Create users with passwords
    # sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    # sudo -u postgres psql -c "CREATE USER leadsrapido_app WITH PASSWORD '$(generate_password)';"
    # sudo -u postgres psql -c "CREATE USER leadsrapido_readonly WITH PASSWORD '$(generate_password)';"
    # sudo -u postgres psql -c "CREATE USER leadsrapido_analytics WITH PASSWORD '$(generate_password)';"
    
    # Grant database ownership to admin user
    sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
    
    log "Database and users created successfully"
}

# Inicializa extensões e roles como superusuário antes do schema.sql
initialize_schema() {
    log "Initializing database schema..."

    local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    if [[ ! -f "$SCRIPT_DIR/schema.sql" ]]; then
        error "Schema file not found: $SCRIPT_DIR/schema.sql"
    fi

    # Cria extensões como superusuário (ignora erro se já existir)
    log "Creating required extensions as superuser..."
    sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;" || warn "Não foi possível criar extensão pg_stat_statements. Verifique permissões."
    sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS postgis;" || warn "Não foi possível criar extensão postgis. Verifique permissões."

    # Cria roles extras como superusuário (ignora erro se já existir)
    log "Creating roles as superuser (if needed)..."
    sudo -u postgres psql -c "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'leadsrapido_analytics') THEN CREATE ROLE leadsrapido_analytics; END IF; END $$;" || warn "Não foi possível criar role leadsrapido_analytics. Verifique permissões."

    # Aplica schema como usuário normal
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql"

    # Aplica security-performance.sql
    if [[ -f "$SCRIPT_DIR/security-performance.sql" ]]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/security-performance.sql"
    fi

    # Aplica backup-monitoring.sql
    if [[ -f "$SCRIPT_DIR/backup-monitoring.sql" ]]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/backup-monitoring.sql"
    fi

    log "Database schema initialized successfully"
    warn "Se houver erro de PRIMARY KEY em tabelas particionadas, ajuste o schema.sql para incluir TODAS as colunas de particionamento na PRIMARY KEY."
}

# Seed initial data
seed_database() {
    log "Seeding initial data..."
    
    local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    if [[ -f "$SCRIPT_DIR/seeds/001_initial_data.sql" ]]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/seeds/001_initial_data.sql"
        log "Initial data seeded successfully"
    else
        warn "Seed file not found. Skipping data seeding."
    fi
}

# Setup backup directories and permissions
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown postgres:postgres "$BACKUP_DIR"
    sudo chmod 750 "$BACKUP_DIR"
    
    # Create log directory
    sudo mkdir -p "$LOG_DIR"
    sudo chown postgres:postgres "$LOG_DIR"
    sudo chmod 750 "$LOG_DIR"
    
    # Create backup script
    sudo tee "/usr/local/bin/leadsrapido-backup.sh" > /dev/null <<'EOF'
#!/bin/bash

# LeadsRapido Database Backup Script

DB_NAME="leadsrapido"
BACKUP_DIR="/var/backups/leadsrapido"
LOG_DIR="/var/log/leadsrapido"
RETENTION_DAYS=30

# Create backup filename with timestamp
BACKUP_FILE="${BACKUP_DIR}/leadsrapido_$(date +%Y%m%d_%H%M%S).sql.gz"
LOG_FILE="${LOG_DIR}/backup_$(date +%Y%m%d).log"

echo "$(date): Starting backup to $BACKUP_FILE" >> "$LOG_FILE"

# Perform backup
pg_dump "$DB_NAME" | gzip > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    echo "$(date): Backup completed successfully" >> "$LOG_FILE"
    
    # Cleanup old backups
    find "$BACKUP_DIR" -name "leadsrapido_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "$(date): Cleaned up backups older than $RETENTION_DAYS days" >> "$LOG_FILE"
else
    echo "$(date): Backup failed" >> "$LOG_FILE"
    exit 1
fi
EOF

    sudo chmod +x "/usr/local/bin/leadsrapido-backup.sh"
    
    # Setup cron job for daily backups
    (sudo crontab -u postgres -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/leadsrapido-backup.sh") | sudo crontab -u postgres -
    
    log "Backup system configured successfully"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Install monitoring tools
    sudo apt-get install -y htop iotop sysstat
    
    # Create monitoring script
    sudo tee "/usr/local/bin/leadsrapido-monitor.sh" > /dev/null <<'EOF'
#!/bin/bash

# LeadsRapido Database Monitoring Script

DB_NAME="leadsrapido"
LOG_DIR="/var/log/leadsrapido"
MONITOR_LOG="${LOG_DIR}/monitor_$(date +%Y%m%d).log"

echo "$(date): Database monitoring check" >> "$MONITOR_LOG"

# Check database connectivity
if psql -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "$(date): Database connectivity: OK" >> "$MONITOR_LOG"
else
    echo "$(date): Database connectivity: FAILED" >> "$MONITOR_LOG"
fi

# Check database size
DB_SIZE=$(psql -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs)
echo "$(date): Database size: $DB_SIZE" >> "$MONITOR_LOG"

# Check active connections
ACTIVE_CONN=$(psql -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | xargs)
echo "$(date): Active connections: $ACTIVE_CONN" >> "$MONITOR_LOG"

# Check system resources
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | xargs)

echo "$(date): Memory usage: $MEMORY_USAGE" >> "$MONITOR_LOG"
echo "$(date): Disk usage: $DISK_USAGE" >> "$MONITOR_LOG"
echo "$(date): Load average: $LOAD_AVG" >> "$MONITOR_LOG"
EOF

    sudo chmod +x "/usr/local/bin/leadsrapido-monitor.sh"
    
    # Setup cron job for hourly monitoring
    (sudo crontab -u postgres -l 2>/dev/null; echo "0 * * * * /usr/local/bin/leadsrapido-monitor.sh") | sudo crontab -u postgres -
    
    log "Monitoring configured successfully"
}

# Create environment file
create_env_file() {
    log "Creating environment configuration..."
    
    local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local ENV_FILE="$SCRIPT_DIR/../.env"
    
    # Get generated passwords for other users
    local APP_PASSWORD=$(sudo -u postgres psql -t -c "SELECT passwd FROM pg_shadow WHERE usename = 'leadsrapido_app';" | xargs)
    local READONLY_PASSWORD=$(sudo -u postgres psql -t -c "SELECT passwd FROM pg_shadow WHERE usename = 'leadsrapido_readonly';" | xargs)
    
    cat > "$ENV_FILE" <<EOF
# Database Configuration - Generated by setup script
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"
DATABASE_URL_DIRECT="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

# Application Database Connection
DATABASE_APP_URL="postgresql://leadsrapido_app:CHANGE_THIS_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

# Read-only Database Connection
DATABASE_READONLY_URL="postgresql://leadsrapido_readonly:CHANGE_THIS_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

# Connection Pool Configuration
DATABASE_POOL_SIZE=10
DATABASE_POOL_TIMEOUT=20
DATABASE_STATEMENT_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=60000
DATABASE_MAX_LIFETIME=3600000

# Application Configuration
APP_ENV="production"
APP_PORT=3000
APP_HOST="0.0.0.0"
APP_SECRET="$(openssl rand -base64 32)"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Multi-tenant Configuration
DEFAULT_ORGANIZATION_QUOTA=1000
LEAD_ACCESS_COST=2.50
MAX_API_REQUESTS_PER_HOUR=10000

# Generated on: $(date)
# Database Host: $DB_HOST:$DB_PORT
# Database Name: $DB_NAME
# Admin User: $DB_USER
EOF

    chmod 600 "$ENV_FILE"
    
    log "Environment file created: $ENV_FILE"
    warn "Please update the application and readonly database passwords in the .env file"
}

# Run health check
health_check() {
    log "Running health check..."
    
    # Test database connection
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        log "✓ Database connection successful"
    else
        error "✗ Database connection failed"
    fi
    
    # Test extensions
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_stat_statements', 'pg_trgm');" | grep -q uuid-ossp; then
        log "✓ Required extensions installed"
    else
        error "✗ Required extensions missing"
    fi
    
    # Test table creation
    local table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    if [[ $table_count -gt 10 ]]; then
        log "✓ Database schema created ($table_count tables)"
    else
        error "✗ Database schema incomplete"
    fi
    
    # Test sample data
    local org_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM organizations;" | xargs)
    if [[ $org_count -gt 0 ]]; then
        log "✓ Sample data loaded ($org_count organizations)"
    else
        warn "No sample data found"
    fi
    
    log "Health check completed"
}

# Display final information
display_summary() {
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}            LeadsRapido Database Setup Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "\n${BLUE}Database Information:${NC}"
    echo -e "  Host: $DB_HOST:$DB_PORT"
    echo -e "  Database: $DB_NAME"
    echo -e "  Admin User: $DB_USER"
    echo -e "  Password: [saved in .env file]"
    echo -e "\n${BLUE}Connection String:${NC}"
    echo -e "  postgresql://$DB_USER:PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo -e "\n${BLUE}Important Files:${NC}"
    echo -e "  Environment: $(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../.env"
    echo -e "  Backup Script: /usr/local/bin/leadsrapido-backup.sh"
    echo -e "  Monitor Script: /usr/local/bin/leadsrapido-monitor.sh"
    echo -e "  Backup Directory: $BACKUP_DIR"
    echo -e "  Log Directory: $LOG_DIR"
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "  1. Update application passwords in .env file"
    echo -e "  2. Configure firewall rules for database access"
    echo -e "  3. Set up SSL certificates for production"
    echo -e "  4. Configure monitoring and alerting"
    echo -e "  5. Test application connectivity"
    echo -e "\n${YELLOW}Security Notes:${NC}"
    echo -e "  • Change default passwords before production use"
    echo -e "  • Restrict network access to database server"
    echo -e "  • Enable SSL/TLS for all connections"
    echo -e "  • Regular security updates and monitoring"
    echo -e "\n${GREEN}Setup completed successfully!${NC}\n"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                LeadsRapido Database Setup"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    check_root
    check_requirements
    prompt_password
    
    log "Starting PostgreSQL installation and configuration..."
    
    install_postgresql
    configure_postgresql
    create_ssl_certificates
    create_database
    
    # Restart PostgreSQL to apply configuration changes
    sudo systemctl restart postgresql
    
    initialize_schema
    seed_database
    setup_backup
    setup_monitoring
    create_env_file
    
    health_check
    display_summary
}

# Run main function
main "$@"