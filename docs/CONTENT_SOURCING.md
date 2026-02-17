# Content Sourcing Methodology
# منهجية توثيق المصادر

## Overview | نظرة عامة

This document outlines the methodology for sourcing, verifying, and maintaining historical content in the Algerian Popular Revolutions Map application.

يوضح هذا المستند منهجية الحصول على المحتوى التاريخي والتحقق منه وصيانته في تطبيق خريطة المقاومات الشعبية الجزائرية.

## Source Categories | فئات المصادر

### Primary Sources (مصادر أولية)
1. **National Archives** | الأرشيف الوطني الجزائري
2. **French Colonial Archives** | الأرشيف الاستعماري الفرنسي
3. **Contemporary Documents** | وثائق معاصرة للأحداث
4. **Oral History Records** | تسجيلات التاريخ الشفهي

### Secondary Sources (مصادر ثانوية)
1. **Academic Books** | كتب أكاديمية
   - Peer-reviewed historical works
   - University publications
   - تأليفات أكاديمية محكّمة

2. **Journal Articles** | مقالات علمية
   - Historical journals
   - University research papers
   - مجلات التاريخ المحكّمة

3. **Encyclopedias** | موسوعات
   - Encyclopedia of Islam
   - Algerian historical encyclopedias
   - الموسوعة الجزائرية

### Authoritative Authors | مؤلفون معتمدون

| Author | Expertise | Works |
|--------|-----------|-------|
| أبو القاسم سعد الله | التاريخ الثقافي الجزائري | تاريخ الجزائر الثقافي |
| محفوظ قداش | مقاومة القرن 19 | ثورة 1871 |
| يحيى بوعزيز | المقاومة الشعبية | موسوعة المقاومة |
| عبد الرحمن الجيلالي | التاريخ العام | تاريخ الجزائر العام |
| Charles-Robert Ageron | Colonial Algeria | Histoire de l'Algérie contemporaine |

## Verification Process | عملية التحقق

### Level 1: Initial Entry
```
Status: مسودة (Draft)
Requirements:
- At least 1 source
- Basic event details
- Author attribution
```

### Level 2: Review Required
```
Status: بحاجة_لمراجعة (Needs Review)
Requirements:
- Cross-referenced with 1+ source
- Details verified against sources
- Reviewed by editor
```

### Level 3: Confirmed
```
Status: مؤكد (Confirmed)
Requirements:
- Minimum 2 independent sources
- Academic or archival source preferred
- Admin approval
- No contradictory information
```

### Level 4: Unverified
```
Status: غير_مؤكد (Unverified)
Applied when:
- Sources conflict
- No academic source available
- Information is contested
- Oral tradition only
```

## Citation Format | صيغة الاقتباس

### Books (كتب)
```
{
  "type": "كتاب",
  "author": "المؤلف",
  "title": "عنوان الكتاب",
  "publisher": "الناشر",
  "year": سنة النشر,
  "pageRange": "ص XX-XX"
}
```

### Articles (مقالات)
```
{
  "type": "مقال",
  "author": "المؤلف",
  "title": "عنوان المقال",
  "journal": "اسم المجلة",
  "volume": "المجلد",
  "year": سنة النشر,
  "pages": "الصفحات"
}
```

### Archives (أرشيف)
```
{
  "type": "أرشيف",
  "title": "عنوان الوثيقة",
  "archive": "اسم الأرشيف",
  "reference": "رقم الوثيقة",
  "date": "تاريخ الوثيقة"
}
```

## Quality Checklist | قائمة فحص الجودة

### For Each Event
- [ ] Title accurate and in formal Arabic
- [ ] Date range verified (minimum start date)
- [ ] Region correctly identified
- [ ] At least one source with page reference
- [ ] Description factual, not interpretive
- [ ] Casualties marked as estimated if not certain
- [ ] Key figures verified
- [ ] Outcome documented

### For Each Source
- [ ] Author name verified
- [ ] Publication year confirmed
- [ ] Publisher name correct
- [ ] ISBN/ISSN if available
- [ ] Page numbers specific

## Handling Uncertainty | التعامل مع عدم اليقين

### When Information Conflicts
1. Document all versions
2. Note the conflict in metadata
3. Mark as "غير_مؤكد"
4. Add review comment explaining discrepancy

### When Information is Incomplete
1. Document what is known
2. Mark uncertain fields explicitly
3. Use "غير معروف" for missing dates
4. Add note about what needs research

### Oral History
1. Document source (who, when recorded)
2. Mark as requiring corroboration
3. Note if widely accepted tradition
4. Cannot be sole source for "مؤكد" status

## Data Entry Guidelines | إرشادات إدخال البيانات

### Arabic Language Standards
- Use Modern Standard Arabic (فصحى)
- Avoid dialectal terms unless quoting
- Use standard Arabic numerals (1, 2, 3)
- Follow Arabic grammatical conventions

### Date Conventions
- Format: YYYY-MM-DD (ISO 8601)
- For uncertain dates, use first of month/year
- Mark estimated dates in notes
- Use Gregorian calendar

### Geographic Names
- Use current wilaya names
- Note historical region names in description
- Coordinates should be approximate center of action
- Polygon data for area-wide events (future)

## Review Workflow | سير عمل المراجعة

```
Draft → Editor Review → Source Check → Admin Approval → Published
مسودة → مراجعة محرر → فحص المصادر → موافقة المدير → منشور
```

### Editor Responsibilities
1. Verify source citations
2. Check Arabic language quality
3. Validate date ranges
4. Ensure consistency with existing entries

### Admin Responsibilities
1. Final accuracy check
2. Approve status changes to "مؤكد"
3. Resolve conflicting information
4. Maintain source database

## Recommended Sources | مصادر موصى بها

### Essential References
1. تاريخ الجزائر الثقافي - أبو القاسم سعد الله
2. تاريخ الجزائر العام - عبد الرحمن الجيلالي
3. المقاومة الجزائرية في القرن 19 - يحيى بوعزيز
4. Histoire de l'Algérie contemporaine - Charles-Robert Ageron

### Online Resources
- الأرشيف الوطني الجزائري (archives.gov.dz)
- Gallica (BnF) - French colonial documents
- JSTOR - Academic articles

---

*Document Version: 1.0.0*
*Last Updated: 2026-01-28*
