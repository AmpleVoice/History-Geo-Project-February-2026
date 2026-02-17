# Project Plan: Algerian Popular Revolutions Map

## Agent Team & Responsibilities

### 1. Project Manager Agent (PM) - COORDINATOR
**Role:** Overall project coordination, scope management, quality gates
**Responsibilities:**
- Maintain project plan and milestones
- Coordinate between agents
- Make architectural decisions
- Enforce standards and quality gates
- Risk management

### 2. History Research Agent (HR)
**Role:** Historical content specialist
**Responsibilities:**
- Design historical data taxonomy
- Research and compile event data
- Ensure Arabic language quality
- Validate historical accuracy
- Manage source citations
- Flag uncertain information

### 3. UI/UX Designer Agent (UX)
**Role:** Interface design and user experience
**Responsibilities:**
- Design RTL-first layouts
- Create component specifications
- Define interaction patterns
- Ensure accessibility compliance
- Typography and Arabic readability

### 4. Frontend Developer Agent (FE)
**Role:** Web application development
**Responsibilities:**
- Implement Next.js application
- Build map integration (Leaflet)
- Create reusable components
- Implement search and filters
- Build admin interface

### 5. Backend Developer Agent (BE)
**Role:** API and database development
**Responsibilities:**
- Design and implement NestJS API
- Create Prisma schema and migrations
- Implement authentication/RBAC
- Build import/export features
- Create seed scripts

### 6. Test Engineer Agent (QA)
**Role:** Quality assurance and testing
**Responsibilities:**
- Define test strategy
- Write unit tests
- Create E2E test scenarios
- Performance testing
- Accessibility testing

### 7. Documentation Manager Agent (DOC)
**Role:** Documentation and content quality
**Responsibilities:**
- Maintain technical documentation
- Create admin/user guides
- Ensure Arabic content consistency
- Review source citation format
- API documentation

---

## Milestone Plan

### M1: Foundation & Skeleton (Core Setup)
**Goal:** Working app skeleton with map and static data

**Deliverables:**
- [ ] Project scaffolding (Next.js + NestJS + Prisma)
- [ ] RTL layout with TailwindCSS
- [ ] Interactive Algeria map (Leaflet + GeoJSON)
- [ ] Basic side panel (region name, static event list)
- [ ] Sample dataset (5-10 events, hardcoded)
- [ ] Basic routing and navigation

**Acceptance Criteria:**
- App runs locally without errors
- Map displays Algeria with clickable regions
- Clicking region shows its name in side panel
- Arabic text renders correctly (RTL)
- Mobile responsive layout works

**Agents:** FE (lead), UX, PM

---

### M2: Database & Admin Foundation
**Goal:** Persistent data storage with basic CRUD

**Deliverables:**
- [ ] PostgreSQL + Prisma schema implementation
- [ ] Database migrations
- [ ] REST API (events, regions CRUD)
- [ ] Authentication (JWT + NextAuth)
- [ ] RBAC implementation (3 roles)
- [ ] Admin table view
- [ ] Admin create/edit forms
- [ ] Seed script with 20+ events

**Acceptance Criteria:**
- Database persists across restarts
- API responds with JSON
- Login/logout works
- Roles enforced (editor can't publish)
- Admin can CRUD events
- Audit log records changes

**Agents:** BE (lead), FE, HR, PM

---

### M3: Search, Filters & Citations
**Goal:** Full search functionality and data integrity

**Deliverables:**
- [ ] Search bar with Arabic support
- [ ] Filter by: date range, type, region
- [ ] Timeline view component
- [ ] Event detail modal with sources
- [ ] Citation display format
- [ ] Review status workflow
- [ ] Import/Export (CSV/JSON)
- [ ] 50+ historical events dataset

**Acceptance Criteria:**
- Search finds Arabic text correctly
- Filters combine (AND logic)
- Timeline shows events chronologically
- Every event has at least 1 source
- Import validates data before commit
- Export produces valid CSV/JSON

**Agents:** FE, BE, HR (lead), QA

---

### M4: Testing & Polish
**Goal:** Production-ready quality

**Deliverables:**
- [ ] Unit tests (10+ tests)
- [ ] API integration tests (5+ tests)
- [ ] E2E tests (3+ flows)
- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] Security review
- [ ] Error handling improvements
- [ ] Loading states and empty states

**Acceptance Criteria:**
- All tests pass
- Lighthouse accessibility > 90
- Lighthouse performance > 80
- No critical security issues
- Keyboard navigation works
- Screen reader compatible

**Agents:** QA (lead), FE, BE, PM

---

### M5: Documentation & Release
**Goal:** Deployment-ready package

**Deliverables:**
- [ ] README with setup instructions
- [ ] Architecture documentation (finalized)
- [ ] API documentation (OpenAPI)
- [ ] Admin user guide
- [ ] Content sourcing methodology
- [ ] Contribution guide
- [ ] Final seed data (80+ events)
- [ ] Docker configuration
- [ ] Release checklist completed

**Acceptance Criteria:**
- New developer can set up in < 30 minutes
- All docs accurate and complete
- API spec matches implementation
- Docker build succeeds
- Demo data tells coherent story

**Agents:** DOC (lead), HR, PM, all

---

## Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R1 | GeoJSON for Algeria regions not available | Low | High | Use OSM data or simplified boundaries |
| R2 | Arabic full-text search complexity | Medium | Medium | Use pg_trgm extension, fallback to LIKE |
| R3 | Historical source availability | Medium | High | Start with well-documented events only |
| R4 | RTL layout bugs | Medium | Medium | Test early and often, use established RTL patterns |
| R5 | Map performance with many events | Low | Medium | Clustering, lazy loading, pagination |
| R6 | Authentication security | Low | High | Use proven libraries, follow OWASP |

---

## Definition of Done

### Code
- [ ] TypeScript strict mode passes
- [ ] Linting passes (no errors)
- [ ] Unit tests for new logic
- [ ] Code reviewed

### Features
- [ ] Acceptance criteria met
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile responsive
- [ ] Arabic text correct
- [ ] Accessible (keyboard + screen reader basics)

### Documentation
- [ ] Code comments where needed
- [ ] API endpoints documented
- [ ] README updated if needed

---

## Daily Checkpoint Template

```markdown
## Checkpoint [DATE]

### Completed Today
- [x] Task 1
- [x] Task 2

### In Progress
- [ ] Task 3 (blocked by: X)

### Blockers
- Issue description

### Tomorrow's Focus
- Priority 1
- Priority 2

### Notes/Decisions
- Decision made about X
```

---

## Communication Protocol

1. **Agent Handoffs**: Clear interface definitions before starting
2. **Blockers**: Escalate immediately to PM
3. **Code Standards**: TypeScript strict, ESLint, Prettier
4. **Git**: Feature branches, meaningful commits
5. **Arabic Content**: Review by HR agent before merge

---

*Document Version: 1.0.0*
*Last Updated: 2026-01-28*
