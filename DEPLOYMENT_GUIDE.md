# Coolify Deployment Guide

This guide provides all the necessary information to deploy the application successfully on Coolify.

## 📋 Prerequisites

- Coolify account with access to your server
- Domain name (optional, but recommended)
- SSL certificates (optional, but recommended)
- Git repository with the project code

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the application:**
   ```bash
   pnpm run build
   ```

4. **Run deployment script:**
   ```bash
   node scripts/deploy-coolify.mjs
   ```

## 📁 Project Structure

```
├── Dockerfile              # Multi-stage Docker build for production
├── docker-compose.yml      # Coolify-compatible compose file
├── .env.example           # Environment variables template
├── .env                   # Environment variables (create from .env.example)
├── next.config.mjs        # Next.js configuration with standalone output
├── nginx.conf            # Nginx configuration for production
├── scripts/
│   └── deploy-coolify.mjs # Deployment validation script
└── ssl/                  # SSL certificates directory
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Environment
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Your Site Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your site description

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### SSL Certificates

Place your SSL certificates in the `ssl/` directory:

- `cert.pem` - Your SSL certificate
- `key.pem` - Your private key

## 🏗️ Coolify Configuration

### Service Settings

**Application Service:**
- **Repository:** Your Git repository URL
- **Branch:** main/master
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `docker-compose up -d`
- **Environment Variables:** Use values from `.env` file

**Docker Compose Settings:**
- **Compose File:** `docker-compose.yml`
- **Project Name:** `tramites-municipales`
- **Restart Policy:** `unless-stopped`

### Environment Variables in Coolify

Add these environment variables in Coolify:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🛡️ Security Features

### Docker Security
- Non-root user execution (`nextjs:1001`)
- Minimal Alpine Linux base image
- Health checks for service monitoring
- Proper file permissions

### Nginx Security
- HTTPS enforcement
- Security headers (HSTS, CSP, X-Frame-Options)
- Rate limiting for API and login endpoints
- SSL/TLS configuration

### Application Security
- Environment variable validation
- Input sanitization
- CSRF protection
- Rate limiting

## 📊 Monitoring

### Health Checks
- Application: `GET /api/health`
- Docker health check every 30 seconds
- Graceful startup period (40s)

### Logging
- Application logs: `/app/logs/`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`

## 🔄 Database Migrations

The application includes database migration scripts in the `scripts/` directory:

- `01-create-profiles-table.sql` - Create user profiles table
- `02-create-tramites-table.sql` - Create procedures table
- `08-create-dependencias-table.sql` - Create dependencies table
- Additional migration scripts for feature updates

Run migrations manually or integrate with your deployment pipeline.

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
- Check Dockerfile syntax
- Verify environment variables
- Ensure all dependencies are installed

**SSL Certificate Errors:**
- Verify certificate files exist in `ssl/` directory
- Check file permissions
- Ensure certificates are valid and not expired

**Database Connection Issues:**
- Verify Supabase configuration
- Check network connectivity
- Review migration scripts

**Nginx Configuration Errors:**
- Validate `nginx.conf` syntax
- Check SSL certificate paths
- Verify port bindings

### Logs and Debugging

**Application Logs:**
```bash
docker-compose logs app
```

**Nginx Logs:**
```bash
docker-compose logs nginx
```

**Health Check Status:**
```bash
docker-compose ps
```

## 📈 Performance Optimization

### Docker Optimizations
- Multi-stage builds to reduce image size
- Layer caching for faster builds
- Production-optimized dependencies

### Nginx Optimizations
- Gzip compression
- Static file caching
- HTTP/2 support
- Connection pooling

### Application Optimizations
- Next.js static optimization
- Image optimization
- Bundle splitting
- Code splitting

## 🔄 Updates and Maintenance

### Regular Maintenance
- Update dependencies monthly
- Rotate SSL certificates before expiration
- Monitor disk space for logs
- Review security configurations

### Deployment Updates
1. Update code in repository
2. Run deployment script to validate changes
3. Push to Git
4. Coolify will automatically deploy changes
5. Monitor deployment status

## 📞 Support

For issues with this deployment:

1. Check the troubleshooting section
2. Review Coolify documentation
3. Examine application and system logs
4. Verify all configuration files

## 📝 Notes

- Always test deployments in a staging environment first
- Keep backups of your database and configuration
- Monitor application performance after deployment
- Regularly update security configurations