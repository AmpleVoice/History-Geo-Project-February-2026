# خريطة المقاومات الشعبية الجزائرية (1830-1954)
# Algerian Popular Revolutions Interactive Map

تطبيق ويب تفاعلي يوثق الثورات والانتفاضات والمقاومات الشعبية الجزائرية ضد الاستعمار الفرنسي.

An interactive web application documenting Algerian popular revolts and resistances against French colonialism (1830-1954).

## 🗺️ Features | المميزات

- **Interactive Map** | خريطة تفاعلية: Explore events by region/wilaya
- **Arabic RTL** | واجهة عربية: Full Arabic interface with RTL support
- **Search & Filter** | بحث وتصفية: Search by keywords, filter by date, type, region
- **Historical Citations** | توثيق المصادر: Every event backed by academic sources
- **Admin Panel** | لوحة الإدارة: CRUD operations with role-based access

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Map | Leaflet + GeoJSON |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth + JWT |

## 📁 Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # Shared types & validation
├── docs/             # Documentation
├── data/
│   ├── geojson/      # Map boundaries
│   └── seed/         # Seed data
└── scripts/          # Utility scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd algerian-history-map

# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start PostgreSQL (Docker)
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development servers
npm run dev
```

### Access
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## 📚 Documentation

### User Guides | أدلة المستخدم
- [دليل المستخدم (عربي)](docs/user-guide-ar.md)
- [دليل لوحة الإدارة (عربي)](docs/admin-guide-ar.md)

### Technical Documentation
- [Product Brief (Arabic)](docs/PRODUCT_BRIEF_AR.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [User Stories](docs/USER_STORIES.md)
- [Project Plan](docs/PROJECT_PLAN.md)
- [Content Sourcing](docs/CONTENT_SOURCING.md)

### Milestone Reports
- [M1: Skeleton App](docs/milestones/M1-skeleton-app.md)
- [M2: Database & Admin](docs/milestones/M2-database-admin.md)
- [M3: Search, Filter & Timeline](docs/milestones/M3-search-filter-timeline.md)
- [M4: Testing & Performance](docs/milestones/M4-testing-accessibility-performance.md)
- [M5: Final Polish & Release](docs/milestones/M5-final-polish-release.md)

### Deployment
- [Release Checklist](docs/RELEASE_CHECKLIST.md)

## 🔐 Roles & Permissions

| Role | Permissions |
|------|-------------|
| Viewer (قارئ) | Read-only access |
| Editor (محرر) | Create/edit drafts |
| Admin (مدير) | Full access + user management |

## 📊 Data Quality

- Every event requires at least one verified source
- Unverified information marked as "غير مؤكد"
- All changes tracked in audit log

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🤝 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📜 License

MIT License - see [LICENSE](LICENSE)

---

<div dir="rtl">

## عن المشروع

هذا المشروع يهدف إلى الحفاظ على الذاكرة التاريخية للمقاومة الشعبية الجزائرية وتوفير مرجع رقمي موثق للباحثين والمهتمين.

</div>
