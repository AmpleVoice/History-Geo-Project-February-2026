# Data Model Documentation

## Entity Relationship Diagram (Text)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     REGION      │     │      EVENT      │     │     SOURCE      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │◄────│ region_id (FK)  │     │ id (PK)         │
│ name_ar         │     │ id (PK)         │────►│ title           │
│ name_en         │     │ title           │     │ author          │
│ code            │     │ type            │     │ year            │
│ geometry        │     │ start_date      │     │ publisher       │
│ center_lat      │     │ end_date        │     │ url             │
│ center_lng      │     │ description     │     │ page_ref        │
│ parent_id       │     │ detailed_desc   │     │ created_at      │
└─────────────────┘     │ coordinates     │     └─────────────────┘
                        │ outcome         │              ▲
┌─────────────────┐     │ casualties      │              │
│     PERSON      │     │ review_status   │     ┌────────┴────────┐
├─────────────────┤     │ created_by (FK) │     │  EVENT_SOURCE   │
│ id (PK)         │     │ updated_by (FK) │     ├─────────────────┤
│ name_ar         │◄────│ created_at      │────►│ event_id (FK)   │
│ name_en         │     │ updated_at      │     │ source_id (FK)  │
│ birth_year      │     └─────────────────┘     │ notes           │
│ death_year      │              │              │ page_range      │
│ bio             │              │              └─────────────────┘
│ role            │              │
└─────────────────┘              │
        ▲                        │
        │               ┌────────┴────────┐
┌───────┴─────────┐     │  EVENT_PERSON   │
│                 │     ├─────────────────┤
│                 │◄────│ event_id (FK)   │
│                 │     │ person_id (FK)  │
│                 │     │ role            │
│                 │     └─────────────────┘
│                 │
└─────────────────┘     ┌─────────────────┐
                        │      USER       │
┌─────────────────┐     ├─────────────────┤
│      TAG        │     │ id (PK)         │
├─────────────────┤     │ email           │
│ id (PK)         │     │ password_hash   │
│ name_ar         │     │ name            │
│ name_en         │     │ role            │
│ category        │     │ active          │
└─────────────────┘     │ created_at      │
        ▲               └─────────────────┘
        │                        │
┌───────┴─────────┐              │
│   EVENT_TAG     │     ┌────────┴────────┐
├─────────────────┤     │   AUDIT_LOG     │
│ event_id (FK)   │     ├─────────────────┤
│ tag_id (FK)     │     │ id (PK)         │
└─────────────────┘     │ user_id (FK)    │
                        │ entity_type     │
                        │ entity_id       │
                        │ action          │
                        │ old_data        │
                        │ new_data        │
                        │ timestamp       │
                        └─────────────────┘
```

## Detailed Schema Definitions

### Region (المنطقة/الولاية)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| name_ar | VARCHAR(255) | No | Arabic name (الجزائر، وهران، إلخ) |
| name_en | VARCHAR(255) | Yes | English name |
| code | VARCHAR(10) | No | Standard code (01, 02, etc.) |
| geometry | JSONB | Yes | GeoJSON polygon |
| center_lat | DECIMAL(10,7) | Yes | Center latitude |
| center_lng | DECIMAL(10,7) | Yes | Center longitude |
| parent_id | UUID | Yes | FK to parent region |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (code)
- INDEX (name_ar)

---

### Event (الحدث)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| title | VARCHAR(500) | No | عنوان الحدث بالعربية |
| type | ENUM | No | نوع الحدث |
| region_id | UUID | No | FK to Region |
| start_date | DATE | No | تاريخ البداية |
| end_date | DATE | Yes | تاريخ النهاية |
| description | TEXT | No | وصف مختصر |
| detailed_description | TEXT | Yes | وصف تفصيلي |
| coordinates | JSONB | Yes | {lat, lng} or polygon |
| outcome | TEXT | Yes | النتائج والأثر |
| casualties_text | VARCHAR(500) | Yes | الخسائر (نص) |
| casualties_estimated | INTEGER | Yes | الخسائر (رقم تقديري) |
| parties | JSONB | Yes | الأطراف المشاركة |
| review_status | ENUM | No | حالة المراجعة |
| created_by | UUID | No | FK to User |
| updated_by | UUID | Yes | FK to User |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

**Event Types (أنواع الأحداث):**
```sql
CREATE TYPE event_type AS ENUM (
  'ثورة',      -- Revolution
  'انتفاضة',   -- Uprising
  'معركة',     -- Battle
  'حصار',      -- Siege
  'مقاومة',    -- Resistance
  'غزوة'       -- Raid
);
```

**Review Status (حالة المراجعة):**
```sql
CREATE TYPE review_status AS ENUM (
  'مؤكد',          -- Confirmed
  'بحاجة_لمراجعة', -- Needs Review
  'غير_مؤكد',      -- Unverified
  'مسودة'          -- Draft
);
```

**Indexes:**
- PRIMARY KEY (id)
- INDEX (region_id)
- INDEX (type)
- INDEX (start_date)
- INDEX (review_status)
- FULLTEXT INDEX (title, description) -- for Arabic search

---

### Person (شخصية)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| name_ar | VARCHAR(255) | No | الاسم بالعربية |
| name_en | VARCHAR(255) | Yes | الاسم بالإنجليزية |
| birth_year | INTEGER | Yes | سنة الميلاد |
| death_year | INTEGER | Yes | سنة الوفاة |
| bio | TEXT | Yes | السيرة الذاتية |
| role | VARCHAR(255) | Yes | الدور العام (قائد، شيخ، إلخ) |
| image_url | VARCHAR(500) | Yes | رابط الصورة |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (name_ar)

---

### EventPerson (علاقة الحدث-الشخصية)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| event_id | UUID | No | FK to Event |
| person_id | UUID | No | FK to Person |
| role | VARCHAR(255) | No | دوره في الحدث (قائد، مشارك) |
| notes | TEXT | Yes | ملاحظات |

**Indexes:**
- PRIMARY KEY (event_id, person_id)
- INDEX (person_id)

---

### Source (المصدر)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| title | VARCHAR(500) | No | عنوان المصدر |
| author | VARCHAR(255) | Yes | المؤلف |
| year | INTEGER | Yes | سنة النشر |
| publisher | VARCHAR(255) | Yes | الناشر |
| type | ENUM | No | نوع المصدر |
| url | VARCHAR(1000) | Yes | رابط إلكتروني |
| isbn | VARCHAR(20) | Yes | ISBN |
| notes | TEXT | Yes | ملاحظات |
| created_at | TIMESTAMP | No | Creation timestamp |

**Source Types:**
```sql
CREATE TYPE source_type AS ENUM (
  'كتاب',      -- Book
  'مقال',      -- Article
  'أرشيف',     -- Archive
  'موسوعة',    -- Encyclopedia
  'رسالة',     -- Thesis
  'موقع',      -- Website
  'وثيقة'      -- Document
);
```

**Indexes:**
- PRIMARY KEY (id)
- INDEX (title)
- INDEX (author)

---

### EventSource (علاقة الحدث-المصدر)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| event_id | UUID | No | FK to Event |
| source_id | UUID | No | FK to Source |
| page_range | VARCHAR(50) | Yes | نطاق الصفحات |
| quote | TEXT | Yes | اقتباس |
| notes | TEXT | Yes | ملاحظات |

**Indexes:**
- PRIMARY KEY (event_id, source_id)
- INDEX (source_id)

---

### Tag (الوسم)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| name_ar | VARCHAR(100) | No | الاسم بالعربية |
| name_en | VARCHAR(100) | Yes | الاسم بالإنجليزية |
| category | VARCHAR(100) | Yes | الفئة |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (name_ar)

---

### EventTag (علاقة الحدث-الوسم)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| event_id | UUID | No | FK to Event |
| tag_id | UUID | No | FK to Tag |

**Indexes:**
- PRIMARY KEY (event_id, tag_id)

---

### User (المستخدم)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| email | VARCHAR(255) | No | البريد الإلكتروني |
| password_hash | VARCHAR(255) | No | كلمة المرور المشفرة |
| name | VARCHAR(255) | No | الاسم |
| role | ENUM | No | الدور |
| active | BOOLEAN | No | نشط |
| last_login | TIMESTAMP | Yes | آخر تسجيل دخول |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

**User Roles:**
```sql
CREATE TYPE user_role AS ENUM (
  'viewer',  -- قارئ
  'editor',  -- محرر
  'admin'    -- مدير
);
```

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (email)

---

### AuditLog (سجل التدقيق)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| user_id | UUID | No | FK to User |
| entity_type | VARCHAR(50) | No | نوع الكيان |
| entity_id | UUID | No | معرف الكيان |
| action | ENUM | No | نوع العملية |
| old_data | JSONB | Yes | البيانات القديمة |
| new_data | JSONB | Yes | البيانات الجديدة |
| ip_address | VARCHAR(45) | Yes | عنوان IP |
| timestamp | TIMESTAMP | No | وقت العملية |

**Audit Actions:**
```sql
CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'status_change'
);
```

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (entity_type, entity_id)
- INDEX (timestamp)

---

## Sample Data Structure

### Event Example (JSON)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "ثورة الأمير عبد القادر",
  "type": "ثورة",
  "region": {
    "id": "...",
    "name_ar": "معسكر"
  },
  "start_date": "1832-11-22",
  "end_date": "1847-12-23",
  "description": "مقاومة مسلحة قادها الأمير عبد القادر ضد الاحتلال الفرنسي",
  "detailed_description": "...",
  "outcome": "استسلام الأمير عبد القادر بعد مقاومة دامت 15 عاماً",
  "parties": {
    "resistance": ["قبائل الغرب الجزائري", "حاشم", "بني عامر"],
    "colonial": ["الجيش الفرنسي"]
  },
  "review_status": "مؤكد",
  "people": [
    {
      "id": "...",
      "name_ar": "الأمير عبد القادر بن محيي الدين",
      "role": "قائد"
    }
  ],
  "sources": [
    {
      "id": "...",
      "title": "تاريخ الجزائر الثقافي",
      "author": "أبو القاسم سعد الله",
      "year": 1998,
      "page_range": "ج3، ص 245-280"
    }
  ]
}
```

---

## Validation Rules

### Event Validation
1. `title` - Required, 5-500 characters
2. `type` - Required, must be valid enum
3. `start_date` - Required, must be between 1830-1954
4. `end_date` - Optional, must be >= start_date if provided
5. `description` - Required, 20-1000 characters
6. `sources` - At least one source required for `مؤكد` status
7. `review_status` - Defaults to `مسودة`

### Source Validation
1. `title` - Required, 3-500 characters
2. `type` - Required, must be valid enum
3. At least one of: `author`, `url`, `publisher`

### Person Validation
1. `name_ar` - Required, 2-255 characters
2. `birth_year` - Optional, must be < death_year if both provided

---

*Document Version: 1.0.0*
*Last Updated: 2026-01-28*
