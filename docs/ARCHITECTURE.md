# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Next.js Frontend                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │   Map    │  │  Search  │  │  Admin   │  │  Auth    │    │    │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │              Shared Components (RTL)                 │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API SERVER                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    NestJS Backend                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Events  │  │  Regions │  │   Auth   │  │  Import/ │    │    │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Export  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │              Prisma ORM + Validation                 │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    PostgreSQL                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Events  │  │  Regions │  │  Sources │  │  Users   │    │    │
│  │  │          │  │          │  │          │  │          │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │    │
│  │  │  People  │  │   Tags   │  │  Audit   │                   │    │
│  │  │          │  │          │  │   Log    │                   │    │
│  │  └──────────┘  └──────────┘  └──────────┘                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend (apps/web)
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with SSR/SSG | 14.x |
| TypeScript | Type safety | 5.x |
| TailwindCSS | Utility-first CSS | 3.x |
| Leaflet | Interactive maps | 1.9.x |
| React Query | Data fetching & caching | 5.x |
| Zustand | Client state management | 4.x |
| React Hook Form | Form handling | 7.x |
| Zod | Schema validation | 3.x |

### Backend (apps/api)
| Technology | Purpose | Version |
|------------|---------|---------|
| NestJS | Backend framework | 10.x |
| TypeScript | Type safety | 5.x |
| Prisma | ORM | 5.x |
| PostgreSQL | Database | 15.x |
| Passport | Authentication | 0.6.x |
| class-validator | DTO validation | 0.14.x |
| Swagger | API documentation | 7.x |

### Shared (packages/shared)
| Technology | Purpose |
|------------|---------|
| TypeScript | Shared types |
| Zod | Validation schemas |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing |
| Playwright | E2E testing |
| Supertest | API integration testing |

## Module Responsibilities

### Frontend Modules

#### Map Module (`/apps/web/src/features/map`)
- Render interactive Algeria map with Leaflet
- Load and display GeoJSON region boundaries
- Handle hover/click interactions
- Manage map state (zoom, center, selected region)
- Display event markers (optional view)

#### Search Module (`/apps/web/src/features/search`)
- Search input with Arabic text support
- Filter panel (date range, type, region)
- Results display and highlighting
- URL state synchronization
- Empty/loading states

#### Event Module (`/apps/web/src/features/events`)
- Event list in side panel
- Event detail modal/drawer
- Timeline view component
- Source citation display
- Event card components

#### Admin Module (`/apps/web/src/features/admin`)
- Event table with pagination
- Event create/edit forms
- Import/export functionality
- User management (admin only)
- Review workflow UI

#### Auth Module (`/apps/web/src/features/auth`)
- Login/logout pages
- Session management
- Protected route wrapper
- Role-based UI rendering

### Backend Modules

#### Events Module (`/apps/api/src/events`)
- CRUD operations for events
- Complex filtering and search
- Pagination and sorting
- Review status management
- Related entities (people, sources)

#### Regions Module (`/apps/api/src/regions`)
- Region listing
- Region-event relationships
- GeoJSON serving (optional)

#### Auth Module (`/apps/api/src/auth`)
- JWT token generation/validation
- User authentication
- Password hashing
- Session management

#### Users Module (`/apps/api/src/users`)
- User CRUD (admin only)
- Role management
- User profile

#### Import/Export Module (`/apps/api/src/import-export`)
- CSV parsing and generation
- JSON import/export
- Data validation on import
- Batch operations

#### Audit Module (`/apps/api/src/audit`)
- Log all data changes
- Query audit history
- Export audit logs

## Data Flow

### Public User Flow
```
User → Map Interaction → API Query → Database → Response → UI Update
     → Search/Filter   →          →          →          →
```

### Admin Edit Flow
```
Admin → Edit Form → Validation → API Request → Auth Check →
     → Audit Log → Database Write → Response → UI Update
```

### Import Flow
```
Admin → Upload File → Parse → Validate Each Row →
     → Preview → Confirm → Batch Insert → Audit → Response
```

## API Endpoints

### Public Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/events | List events (with filters) |
| GET | /api/events/:id | Get event details |
| GET | /api/regions | List all regions |
| GET | /api/regions/:id | Get region with events |
| GET | /api/search | Search events |

### Protected Endpoints (Editor+)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/events | Create event (draft) |
| PATCH | /api/events/:id | Update event |
| POST | /api/events/:id/sources | Add source |

### Admin Endpoints
| Method | Path | Description |
|--------|------|-------------|
| DELETE | /api/events/:id | Delete event |
| PATCH | /api/events/:id/status | Update review status |
| GET | /api/users | List users |
| POST | /api/users | Create user |
| POST | /api/import | Import data |
| GET | /api/export | Export data |
| GET | /api/audit | View audit log |

## Security Considerations

### Authentication
- JWT with short expiry (1 hour)
- Refresh token rotation
- Secure cookie storage
- Rate limiting on login

### Authorization
- RBAC with 3 roles: Viewer, Editor, Admin
- Permission checks at API level
- UI hides unauthorized actions (defense in depth)

### Data Validation
- Input validation on all endpoints
- SQL injection prevention (Prisma)
- XSS prevention (React escaping + CSP)
- CSRF protection

### Audit
- All mutations logged
- User ID, timestamp, before/after state
- Admin can view audit history

## Performance Optimizations

### Frontend
- Static generation for public pages
- Image optimization (next/image)
- Code splitting by route
- Map tile lazy loading
- React Query caching

### Backend
- Database indexes on search fields
- Pagination for all list endpoints
- Response compression
- Connection pooling

### Database
- Proper indexing strategy
- Full-text search for Arabic (pg_trgm or ts_vector)
- Query optimization

## Deployment Considerations

### Development
```bash
# Start all services
docker-compose up -d  # PostgreSQL
npm run dev           # Frontend + Backend
```

### Production
- Frontend: Vercel or static hosting
- Backend: Docker container (Railway, Fly.io, etc.)
- Database: Managed PostgreSQL

---

*Document Version: 1.0.0*
*Last Updated: 2026-01-28*
