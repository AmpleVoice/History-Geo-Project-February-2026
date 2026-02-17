# M4: Testing, Accessibility & Performance

**Status:** ✅ Completed
**Duration:** Milestone 4 of 5

## Overview

This milestone focused on establishing a robust testing infrastructure, ensuring WCAG 2.1 AA accessibility compliance, and optimizing application performance with Core Web Vitals targets.

## Deliverables

### 1. Testing Infrastructure

#### Unit Testing (Jest + React Testing Library)
- **Configuration files:**
  - `apps/web/jest.config.js` - Jest configuration with Next.js support
  - `apps/web/jest.setup.js` - Test setup with mocks for Next.js, localStorage, ResizeObserver
  - `apps/web/src/__tests__/utils/test-utils.tsx` - Custom render utilities with providers

#### Unit Tests Created
| Component | File | Coverage |
|-----------|------|----------|
| Button | `Button.test.tsx` | Variants, sizes, loading, disabled, ref forwarding |
| SearchBar | `SearchBar.test.tsx` | Debouncing, clear, RTL direction, ARIA |
| FilterPanel | `FilterPanel.test.tsx` | Inline/dropdown variants, filter changes, reset |
| EventCard | `EventCard.test.tsx` | Rendering, click handling, keyboard navigation |
| Citation | `Citation.test.tsx` | Full/compact/inline variants, copy to clipboard |
| Timeline | `Timeline.test.tsx` | VerticalTimeline with groupBy modes, selection |

#### Integration Tests
- `apps/web/src/__tests__/lib/api/hooks.test.tsx`
  - useEvents, useEvent, useSearchEvents
  - useCreateEvent, useUpdateEvent, useDeleteEvent
  - useRegions, useSources
  - Mocked API client with success/error scenarios

### 2. E2E Testing (Playwright)

#### Configuration
- `apps/web/playwright.config.ts` - Multi-browser testing (Chromium, Firefox, WebKit)

#### E2E Test Suites
| Suite | File | Scenarios |
|-------|------|-----------|
| Home Page | `home.spec.ts` | Header, map, search, filters, mobile menu |
| Timeline | `timeline.spec.ts` | View modes, search, filters, navigation |
| Admin | `admin.spec.ts` | Authentication, dashboard, events management, forms |
| Accessibility | `accessibility.spec.ts` | WCAG compliance, keyboard navigation, screen reader |

### 3. Accessibility Testing

#### axe-core Integration
- Automated WCAG 2.1 AA compliance testing
- Tests for all main pages (home, timeline, login)

#### Accessibility Test Coverage
- **WCAG Compliance:** wcag2a, wcag2aa, wcag21a, wcag21aa
- **Keyboard Navigation:** Tab navigation, Enter activation, Escape handling
- **Focus Management:** Modal focus trapping, search input clearing
- **Screen Reader:** Heading hierarchy, image alt text, button labels, form labels
- **Color Contrast:** Automated contrast ratio checking
- **RTL Support:** Direction and text alignment verification

### 4. Performance Optimization

#### Next.js Configuration (`next.config.js`)
```javascript
// Optimizations applied:
- SWC minification (swcMinify: true)
- Console removal in production
- Optimized package imports (lucide-react, @tanstack/react-query)
- Modularized imports for tree-shaking
- Standalone output for smaller bundles
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Static asset caching (31536000s immutable)
```

#### Skeleton Loading Components
- `apps/web/src/components/ui/Skeleton.tsx`
  - Base `Skeleton` component with variants (text, circular, rectangular)
  - Animation options (pulse, wave, none)
  - `SkeletonText` - Multi-line text placeholder
  - `SkeletonCard` - Generic card placeholder
  - `SkeletonEventCard` - Event-specific placeholder
  - `SkeletonTable` - Table placeholder with configurable rows/cols

#### Route Loading States
| Route | Loading File |
|-------|--------------|
| Home | `app/loading.tsx` |
| Timeline | `app/timeline/loading.tsx` |
| Login | `app/(auth)/login/loading.tsx` |
| Admin Dashboard | `app/admin/loading.tsx` |
| Admin Events | `app/admin/events/loading.tsx` |
| New Event | `app/admin/events/new/loading.tsx` |
| Edit Event | `app/admin/events/[id]/loading.tsx` |

#### Lighthouse CI Configuration
- `apps/web/lighthouserc.js`
- Performance budget: ≥80% score
- Accessibility: ≥90% score (error threshold)
- Best Practices: ≥90% score
- SEO: ≥90% score
- Core Web Vitals targets:
  - FCP: ≤2000ms
  - LCP: ≤2500ms
  - CLS: ≤0.1
  - TBT: ≤300ms
- Resource budgets for JS, CSS, images, total size

### 5. NPM Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "analyze": "ANALYZE=true next build",
  "lighthouse": "lhci autorun",
  "lighthouse:collect": "lhci collect"
}
```

## Dependencies Added

### devDependencies
```json
{
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.2.0",
  "@testing-library/user-event": "^14.5.2",
  "@playwright/test": "^1.41.0",
  "axe-core": "^4.8.4",
  "@axe-core/playwright": "^4.8.4",
  "webpack-bundle-analyzer": "^4.10.1",
  "@lhci/cli": "^0.13.0"
}
```

## Files Created

### Testing Infrastructure
- `apps/web/jest.config.js`
- `apps/web/jest.setup.js`
- `apps/web/playwright.config.ts`
- `apps/web/src/__tests__/utils/test-utils.tsx`

### Unit Tests
- `apps/web/src/__tests__/components/ui/Button.test.tsx`
- `apps/web/src/__tests__/components/search/SearchBar.test.tsx`
- `apps/web/src/__tests__/components/filters/FilterPanel.test.tsx`
- `apps/web/src/__tests__/components/events/EventCard.test.tsx`
- `apps/web/src/__tests__/components/citations/Citation.test.tsx`
- `apps/web/src/__tests__/components/timeline/Timeline.test.tsx`
- `apps/web/src/__tests__/lib/api/hooks.test.tsx`

### E2E Tests
- `apps/web/e2e/home.spec.ts`
- `apps/web/e2e/timeline.spec.ts`
- `apps/web/e2e/admin.spec.ts`
- `apps/web/e2e/accessibility.spec.ts`

### UI Components
- `apps/web/src/components/ui/Skeleton.tsx`

### Loading States
- `apps/web/src/app/loading.tsx`
- `apps/web/src/app/timeline/loading.tsx`
- `apps/web/src/app/(auth)/login/loading.tsx`
- `apps/web/src/app/admin/loading.tsx`
- `apps/web/src/app/admin/events/loading.tsx`
- `apps/web/src/app/admin/events/new/loading.tsx`
- `apps/web/src/app/admin/events/[id]/loading.tsx`

### Configuration
- `apps/web/lighthouserc.js`

## Files Modified
- `apps/web/package.json` - Added scripts and dependencies
- `apps/web/next.config.js` - Performance optimizations
- `apps/web/src/components/ui/index.ts` - Added Skeleton exports

## Usage

### Running Tests
```bash
# Unit tests
npm run test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui  # Interactive mode
```

### Performance Analysis
```bash
# Bundle analysis
npm run analyze

# Lighthouse audit
npm run build
npm run lighthouse
```

## Next Steps (M5)

The final milestone focuses on:
- Final polish and bug fixes
- User documentation
- Seed data for initial deployment
- Release checklist and deployment preparation
