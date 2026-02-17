# User Stories & Acceptance Criteria

## Epic 1: Interactive Map Exploration

### US-1.1: View Algeria Map with Regions
**As a** visitor
**I want to** see an interactive map of Algeria divided by regions/wilayas
**So that I** can explore historical events geographically

**Acceptance Criteria:**
- [ ] Map displays Algeria with clear regional boundaries
- [ ] RTL layout with map on left/center
- [ ] Map is zoomable and pannable
- [ ] All 48 wilayas are identifiable
- [ ] Map loads within 2 seconds

### US-1.2: Hover Region for Quick Info
**As a** visitor
**I want to** see a tooltip when hovering over a region
**So that I** can quickly see how many events occurred there

**Acceptance Criteria:**
- [ ] Tooltip appears within 200ms of hover
- [ ] Tooltip shows: region name (Arabic), number of events
- [ ] Tooltip shows up to 3 event titles
- [ ] Tooltip disappears when mouse leaves region

### US-1.3: Click Region for Full Details
**As a** visitor
**I want to** click on a region to see all its historical events
**So that I** can explore the region's resistance history in detail

**Acceptance Criteria:**
- [ ] Clicking region highlights it visually
- [ ] Side panel updates with region name and event list
- [ ] Events are sorted by date (oldest first)
- [ ] Each event shows: title, type, date range, brief description
- [ ] Panel is scrollable for many events

---

## Epic 2: Event Details & Timeline

### US-2.1: View Event Details
**As a** researcher
**I want to** click on an event to see its full details
**So that I** can understand the historical context and find sources

**Acceptance Criteria:**
- [ ] Modal/drawer opens with full event information
- [ ] Displays: title, type, dates, description (brief + detailed)
- [ ] Shows leaders/figures with their roles
- [ ] Lists outcomes and impact
- [ ] Shows casualties if available (marked if estimated)
- [ ] Displays all source citations with links

### US-2.2: View Timeline of Events
**As a** visitor
**I want to** see events on a timeline
**So that I** can understand the chronological progression

**Acceptance Criteria:**
- [ ] Timeline view shows events chronologically
- [ ] Events are positioned by start date
- [ ] Duration events show as spans (not just points)
- [ ] Clicking timeline event opens details
- [ ] Timeline can be filtered by region

### US-2.3: View Source Citations
**As a** researcher
**I want to** see proper academic citations for each event
**So that I** can verify information and cite it in my work

**Acceptance Criteria:**
- [ ] Each event shows list of sources
- [ ] Source displays: title, author, year, publisher
- [ ] URL/page reference if available
- [ ] Sources can be copied in citation format

---

## Epic 3: Search & Filtering

### US-3.1: Search by Keyword
**As a** visitor
**I want to** search for events by keyword
**So that I** can find specific revolts, battles, or figures

**Acceptance Criteria:**
- [ ] Search bar prominently placed (top of page)
- [ ] Search works in Arabic
- [ ] Results update as user types (debounced 300ms)
- [ ] Results show matching events with highlighted terms
- [ ] Empty state shows "لا توجد نتائج"

### US-3.2: Filter by Date Range
**As a** researcher
**I want to** filter events by year range
**So that I** can focus on a specific period

**Acceptance Criteria:**
- [ ] Year range slider/inputs (1830-1954)
- [ ] Filter updates map and list in real-time
- [ ] Shows count of matching events
- [ ] Can reset filters easily

### US-3.3: Filter by Event Type
**As a** visitor
**I want to** filter by event type (revolt, battle, uprising, siege)
**So that I** can focus on specific types of resistance

**Acceptance Criteria:**
- [ ] Multi-select filter for event types
- [ ] Types in Arabic: ثورة، انتفاضة، معركة، حصار، مقاومة
- [ ] Filter combines with other filters (AND logic)
- [ ] Visual indication of active filters

### US-3.4: Filter by Region
**As a** visitor
**I want to** filter events by region
**So that I** can study a specific geographic area

**Acceptance Criteria:**
- [ ] Dropdown or map-click to select region
- [ ] Multi-region selection supported
- [ ] Selected regions highlighted on map
- [ ] Clear filter option available

---

## Epic 4: Admin - Content Management

### US-4.1: Admin Login
**As an** admin
**I want to** securely log into the admin panel
**So that I** can manage historical content

**Acceptance Criteria:**
- [ ] Login page with email/password
- [ ] Secure authentication (JWT)
- [ ] Session timeout after inactivity
- [ ] Password reset functionality
- [ ] Failed login attempts logged

### US-4.2: View All Events (Admin Table)
**As an** editor
**I want to** see all events in a table view
**So that I** can manage and edit content efficiently

**Acceptance Criteria:**
- [ ] Paginated table with sortable columns
- [ ] Columns: ID, title, type, region, dates, status
- [ ] Quick search within table
- [ ] Filter by review status
- [ ] Export visible data as CSV

### US-4.3: Create New Event
**As an** editor
**I want to** add new historical events
**So that I** can expand the database

**Acceptance Criteria:**
- [ ] Form with all required fields
- [ ] Required: title, type, region, start_date, description, source
- [ ] Source citation must be filled
- [ ] Draft saved automatically
- [ ] Validation errors in Arabic
- [ ] New events default to "بحاجة لمراجعة" status

### US-4.4: Edit Existing Event
**As an** editor
**I want to** modify event information
**So that I** can correct or enhance records

**Acceptance Criteria:**
- [ ] Edit form pre-populated with existing data
- [ ] Change history tracked
- [ ] Editor can save as draft
- [ ] Only admin can change status to "مؤكد"
- [ ] Confirmation before major changes

### US-4.5: Manage Review Status
**As an** admin
**I want to** approve or flag events for review
**So that I** can ensure data quality

**Acceptance Criteria:**
- [ ] Status options: مؤكد (confirmed), بحاجة لمراجعة (needs review), غير مؤكد (unverified)
- [ ] Only admins can set "مؤكد"
- [ ] Status change requires comment
- [ ] Dashboard shows pending reviews count

### US-4.6: Import/Export Data
**As an** admin
**I want to** import/export event data as CSV/JSON
**So that I** can bulk update or backup content

**Acceptance Criteria:**
- [ ] Export: selected fields, filtered results
- [ ] Export formats: CSV, JSON
- [ ] Import: CSV/JSON with validation
- [ ] Import preview before commit
- [ ] Import errors clearly reported

---

## Epic 5: User Management (Admin)

### US-5.1: Manage Users
**As an** admin
**I want to** create and manage user accounts
**So that I** can control who can edit content

**Acceptance Criteria:**
- [ ] List all users with roles
- [ ] Create new user with role assignment
- [ ] Edit user role (Viewer/Editor/Admin)
- [ ] Deactivate user accounts
- [ ] Audit log of user actions

### US-5.2: Role-Based Access
**As a** system
**I want to** enforce role permissions
**So that** only authorized users can perform sensitive actions

**Acceptance Criteria:**
- [ ] Viewer: read-only access to public data
- [ ] Editor: create/edit drafts, cannot publish
- [ ] Admin: full access including publish and user management
- [ ] Unauthorized actions return 403
- [ ] UI hides unavailable actions

---

## Epic 6: Quality & Accessibility

### US-6.1: Keyboard Navigation
**As a** user with disabilities
**I want to** navigate the app using keyboard
**So that I** can access all features without a mouse

**Acceptance Criteria:**
- [ ] All interactive elements focusable
- [ ] Tab order is logical (RTL considered)
- [ ] Focus indicators visible
- [ ] Escape closes modals
- [ ] Enter/Space activates buttons

### US-6.2: Screen Reader Support
**As a** visually impaired user
**I want to** use the app with a screen reader
**So that I** can access historical information

**Acceptance Criteria:**
- [ ] All images have alt text (Arabic)
- [ ] ARIA labels on interactive elements
- [ ] Heading hierarchy correct
- [ ] Form fields properly labeled
- [ ] Dynamic content announced

### US-6.3: Performance
**As a** user on slow connection
**I want to** the app to load quickly
**So that I** don't waste time waiting

**Acceptance Criteria:**
- [ ] Initial load < 3 seconds (3G)
- [ ] Map tiles lazy-loaded
- [ ] Event details loaded on demand
- [ ] Images optimized and lazy-loaded
- [ ] Lighthouse performance score > 80

---

## Priority Matrix

| Priority | User Story | Milestone |
|----------|------------|-----------|
| P0 (Must) | US-1.1, US-1.2, US-1.3 | M1 |
| P0 (Must) | US-2.1, US-3.1 | M1 |
| P0 (Must) | US-4.1, US-4.2, US-4.3, US-4.4 | M2 |
| P1 (Should) | US-3.2, US-3.3, US-3.4 | M3 |
| P1 (Should) | US-2.2, US-2.3 | M3 |
| P1 (Should) | US-4.5, US-4.6 | M3 |
| P2 (Nice) | US-5.1, US-5.2 | M2 |
| P2 (Nice) | US-6.1, US-6.2, US-6.3 | M4 |

---

*Document Version: 1.0.0*
*Last Updated: 2026-01-28*
