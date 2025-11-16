# Deployment Guide

This guide covers deploying the Task Platform to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Database Configuration](#database-configuration)
6. [Environment Setup](#environment-setup)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- Node.js 18+
- npm or yarn
- MongoDB 5.0+
- Redis 6.0+ (optional, for caching)
- Docker & Docker Compose (for containerized deployment)
- Git
- GitHub or GitLab account (for CI/CD)

### System Requirements
- Minimum 2GB RAM
- 20GB free disk space
- Stable internet connection
- Port 80, 443 (production) or 3000, 5000 (development)

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd project-root
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if using Node.js bundler)
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Start MongoDB

```bash
# Using Docker
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=changeme123 \
  mongo:6.0

# Or using local MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### 5. Start Redis (Optional)

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 6. Run Backend

```bash
cd backend
npm start
```

Backend will be available at `http://localhost:5000`

### 7. Run Frontend

Serve frontend files (using Live Server or similar)

Frontend will be available at `http://localhost:3000`

## Docker Deployment

### 1. Build Docker Image

```bash
# From project root
docker build -t task-platform:latest .
```

### 2. Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`

### 3. Customize Docker Compose

Edit `docker-compose.yml` to configure:
- MongoDB credentials
- Redis settings
- Environment variables
- Port mappings
- Volume mounts

## Production Deployment

### Option 1: AWS EC2

#### 1. Launch EC2 Instance

```bash
# Recommended: Ubuntu 22.04 LTS, t3.medium or larger
# Security Group: Allow ports 80, 443, 22
# Key Pair: Create and download
```

#### 2. Connect and Setup

```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 3. Clone Repository

```bash
git clone <repository-url> ~/task-platform
cd ~/task-platform/backend
npm install --production
```

#### 4. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with production values
```

#### 5. Start Application

```bash
pm2 start server.js --name "task-platform"
pm2 startup
pm2 save
```

#### 6. Configure Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/task-platform
```

Add the following configuration:

```nginx
upstream api {
    server localhost:5000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /home/ubuntu/task-platform/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable configuration:

```bash
sudo ln -s /etc/nginx/sites-available/task-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Heroku

#### 1. Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

#### 2. Create App

```bash
heroku create your-app-name
```

#### 3. Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set MONGODB_URI=your-mongodb-uri
# Set other variables...
```

#### 4. Add MongoDB Atlas

```bash
heroku addons:create mongolab:sandbox
```

#### 5. Deploy

```bash
git push heroku main
```

### Option 3: DigitalOcean App Platform

#### 1. Create App

- Go to DigitalOcean Dashboard
- Click "Create" → "Apps"
- Connect GitHub repository

#### 2. Configure Build

- Set build command: `cd backend && npm install`
- Set run command: `cd backend && npm start`

#### 3. Add Database

- Add managed MongoDB or PostgreSQL
- Configure environment variables

#### 4. Deploy

- Select branch to deploy
- Click "Create App"

## Database Configuration

### MongoDB Setup

#### Local Setup

```bash
# Create database
mongo
> use task-platform
> db.createUser({user: "admin", pwd: "password", roles: ["dbOwner"]})
```

#### MongoDB Atlas (Cloud)

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and cluster
3. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/task-platform?retryWrites=true&w=majority
   ```
4. Add IP to whitelist
5. Set `MONGODB_URI` in `.env`

### Database Migrations

```bash
# Run migrations (if using migration tool)
npm run migrate

# Seed initial data
npm run seed
```

### Backup Strategy

```bash
# Backup MongoDB locally
mongodump --uri "mongodb://admin:password@localhost:27017/task-platform" --out ./backup

# Restore from backup
mongorestore --uri "mongodb://admin:password@localhost:27017/task-platform" ./backup/task-platform
```

## Environment Setup

### Critical Variables

Set these variables in production:

```env
NODE_ENV=production
JWT_SECRET=<generate-a-random-32-character-string>
MONGODB_URI=<your-mongodb-connection-string>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
SMTP_PASSWORD=<your-email-password-or-app-password>
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Security Variables

```env
HELMET_ENABLED=true
CSRF_PROTECTION=true
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=15
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run

# Enable auto-renewal
sudo systemctl enable certbot.timer
```

### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Application Logging

```bash
# View PM2 logs
pm2 logs task-platform

# Set log rotation
pm2 install pm2-logrotate
```

### System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor with PM2
pm2 monitor
```

### Application Performance Monitoring (APM)

```bash
# Install New Relic (optional)
npm install newrelic
# Add to top of server.js: require('newrelic');

# Or DataDog
npm install dd-trace
```

### Log Aggregation

Consider using:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- CloudWatch (AWS)

## Backup & Recovery

### Automated Backups

```bash
# Create backup script (backup.sh)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/task-platform_$TIMESTAMP"

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri "mongodb://admin:password@localhost:27017/task-platform" \
  --out "$BACKUP_DIR/mongodb"

# Backup application files
tar -czf "$BACKUP_DIR/app.tar.gz" /path/to/app

# Upload to S3
aws s3 cp "$BACKUP_DIR" s3://your-backup-bucket/$TIMESTAMP/ --recursive

# Keep only last 30 days
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

### Cron Schedule

```bash
# Add to crontab
crontab -e

# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Procedure

```bash
# Stop application
pm2 stop task-platform

# Restore MongoDB
mongorestore --uri "mongodb://admin:password@localhost:27017/task-platform" \
  /path/to/backup/mongodb

# Restore files
cd /path/to/app
tar -xzf /path/to/backup/app.tar.gz

# Start application
pm2 start task-platform
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs task-platform

# Check if port is in use
lsof -i :5000

# Kill process on port
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### MongoDB Connection Issues

```bash
# Test connection
mongo "mongodb://admin:password@localhost:27017/task-platform"

# Check MongoDB status
sudo systemctl status mongod

# Check network connectivity
ping mongodb-server.com
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart task-platform

# Enable memory limit
pm2 start server.js --max-memory-restart 500M
```

### Email Not Sending

- Verify SMTP credentials
- Check firewall for port 587
- Verify email provider settings
- Test with SMTP diagnostic tool:
  ```bash
  npm install -g smtp-tester
  smtp-tester -h smtp.gmail.com -p 587 -u email -pw password
  ```

### Database Performance Issues

```bash
# Enable MongoDB profiling
mongo
> db.setProfilingLevel(1, { slowms: 100 })
> db.system.profile.find().pretty()

# Create indexes
> db.users.createIndex({ email: 1 })
> db.tasks.createIndex({ status: 1, priority: -1 })
```

### CORS Issues

- Verify `CORS_ORIGIN` in `.env`
- Check nginx proxy configuration
- Ensure headers are set correctly in backend

## Performance Optimization

### Frontend

- Minimize and gzip CSS/JS
- Use CDN for static assets
- Implement lazy loading
- Enable browser caching

### Backend

- Use connection pooling
- Implement database indexing
- Cache frequently accessed data
- Use pagination for large datasets

### Infrastructure

- Use load balancer (AWS ELB, Nginx)
- Scale horizontally with multiple instances
- Use CDN (CloudFlare, Akamai)
- Enable caching layer (Redis, Memcached)

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Database backups scheduled
- [ ] Monitoring and alerting set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Admin account created
- [ ] Email notifications working
- [ ] Payment gateway configured
- [ ] Logging system configured
- [ ] Health checks monitored
- [ ] Auto-restart on failure configured
- [ ] Database connection pooling enabled
- [ ] Cache layer configured (Redis)

## Support

For issues or questions:
1. Check the logs: `pm2 logs task-platform`
2. Review error tracking dashboard
3. Check system status: `pm2 status`
4. Consult troubleshooting section above
