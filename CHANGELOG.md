# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-01-28 - Milestone M1: Foundation & Skeleton

### Added

#### Frontend (apps/web)
- Next.js 14 application with TypeScript strict mode
- TailwindCSS configuration with full RTL support
- Arabic font integration (Noto Sans Arabic, Noto Kufi Arabic)
- Interactive map component using Leaflet
- Responsive layout (desktop + mobile)
- UI components: Button, Card, Badge, Input
- Header component with search bar
- Events panel with filtering capability
- Event cards with type badges and status indicators
- Region hover and selection interactions

#### Backend (apps/api)
- NestJS 10 application with TypeScript
- Prisma ORM with PostgreSQL schema
- Complete database schema:
  - Events (historical events)
  - Regions (Algeria wilayas)
  - People (historical figures)
  - Sources (citations)
  - Users (with roles)
  - AuditLog (change tracking)
- REST API modules: Events, Regions, Sources, Auth, Users, Audit
- Swagger/OpenAPI documentation at /api/docs
- Validation DTOs with class-validator
- JWT authentication setup

#### Shared Package (packages/shared)
- TypeScript interfaces for all entities
- Zod validation schemas
- Shared constants and enums

#### Data
- Sample dataset with 10 historical events (1830-1954)
- 48 Algeria wilayas with basic GeoJSON
- Source citations from academic references
- Database seed script

#### Documentation
- Product Brief (Arabic)
- Architecture documentation
- Data model specification
- User stories and acceptance criteria
- Project plan with 5 milestones
- Content sourcing methodology
- M1 milestone report

#### Infrastructure
- Monorepo workspace configuration
- Docker Compose for PostgreSQL
- Environment configuration templates

### Technical Stack
- Frontend: Next.js 14, React 18, TypeScript 5.3, TailwindCSS 3.4
- Backend: NestJS 10, Prisma 5, PostgreSQL 15
- Map: Leaflet 1.9
- Validation: Zod, class-validator

---

## Version History

| Version | Date | Milestone | Description |
|---------|------|-----------|-------------|
| 0.1.0 | TBD | M1 | Foundation & Skeleton |
| 0.2.0 | TBD | M2 | Database & Admin |
| 0.3.0 | TBD | M3 | Search & Citations |
| 0.4.0 | TBD | M4 | Testing & Polish |
| 1.0.0 | TBD | M5 | Production Release |
