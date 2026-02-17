# Release Checklist - خريطة المقاومات الشعبية الجزائرية

## Pre-Release Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] E2E tests passing (`pnpm test:e2e`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No ESLint warnings (`pnpm lint`)
- [ ] Code coverage above 70%

### Security
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables properly configured
- [ ] JWT secret is strong and unique
- [ ] Database credentials secured
- [ ] CORS settings appropriate for production
- [ ] Security headers enabled (X-Frame-Options, CSP, etc.)
- [ ] SQL injection protection verified
- [ ] XSS protection verified

### Performance
- [ ] Lighthouse performance score ≥ 80
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Bundle size within budget
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Caching headers configured

### Database
- [ ] All migrations applied
- [ ] Seed data loaded successfully
- [ ] Database indexes created
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### Documentation
- [ ] README updated
- [ ] User guide complete (Arabic)
- [ ] Admin guide complete (Arabic)
- [ ] API documentation current
- [ ] Deployment guide available

### Infrastructure
- [ ] Docker images build successfully
- [ ] docker-compose tested locally
- [ ] Environment variables documented
- [ ] SSL certificates configured (production)
- [ ] Domain DNS configured
- [ ] Monitoring set up

## Deployment Steps

### 1. Pre-Deployment
```bash
# Update dependencies
pnpm install

# Run all checks
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e

# Build applications
pnpm build
```

### 2. Database Migration
```bash
# Backup existing database (if upgrading)
pg_dump -U postgres algerian_history > backup.sql

# Apply migrations
cd apps/api
npx prisma migrate deploy

# Run seed (first deployment only)
npx prisma db seed
```

### 3. Deploy with Docker
```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose --profile production up -d

# Check logs
docker-compose logs -f
```

### 4. Post-Deployment Verification
- [ ] Web application accessible
- [ ] API health endpoint responding
- [ ] Database connection working
- [ ] Authentication functioning
- [ ] Map loading correctly
- [ ] Search working
- [ ] Admin panel accessible

## Rollback Procedure

### If issues occur:
```bash
# Stop services
docker-compose down

# Restore previous images
docker-compose pull previous-tag

# Restore database if needed
psql -U postgres algerian_history < backup.sql

# Restart with previous version
docker-compose up -d
```

## Monitoring Checklist

### Set up alerts for:
- [ ] Application errors (5xx responses)
- [ ] Database connection failures
- [ ] High memory usage
- [ ] High CPU usage
- [ ] Disk space low
- [ ] SSL certificate expiry

### Log aggregation:
- [ ] Application logs collected
- [ ] Access logs collected
- [ ] Error logs monitored

## Smoke Test Checklist

### Public Features
- [ ] Home page loads with map
- [ ] Events display on map
- [ ] Search returns results
- [ ] Filters work correctly
- [ ] Timeline view loads
- [ ] Event details display
- [ ] Citations visible

### Admin Features
- [ ] Login works
- [ ] Dashboard displays stats
- [ ] Events list loads
- [ ] Can create new event
- [ ] Can edit event
- [ ] Can delete event
- [ ] Import/Export works

### Mobile
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Menu opens/closes
- [ ] Map zooms correctly

## Version Information

| Component | Version |
|-----------|---------|
| Web App | 1.0.0 |
| API | 1.0.0 |
| Database Schema | v20260129 |
| Node.js | 18.x |
| PostgreSQL | 15.x |

## Contact Information

### On-Call
- Primary: [Name] - [Contact]
- Secondary: [Name] - [Contact]

### Escalation
- Technical Lead: [Name]
- Project Manager: [Name]

---

**Release Date**: _______________
**Release Manager**: _______________
**Sign-off**: _______________
