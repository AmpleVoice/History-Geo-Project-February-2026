import { PrismaClient, EventType, ReviewStatus, SourceType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper to load and merge all seed data files
function loadSeedData() {
  const seedDir = path.join(__dirname, '../../../data/seed');

  // Load main events file
  const mainDataPath = path.join(seedDir, 'events.json');
  const mainData = JSON.parse(fs.readFileSync(mainDataPath, 'utf-8'));

  // Load additional events files
  const additionalFiles = ['events-additional.json', 'events-20th-century.json', 'events-expanded.json'];

  for (const file of additionalFiles) {
    const filePath = path.join(seedDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const additionalData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Merge events
        if (additionalData.events) {
          mainData.events = [...mainData.events, ...additionalData.events];
        }
        if (additionalData.additionalEvents) {
          mainData.events = [...mainData.events, ...additionalData.additionalEvents];
        }

        // Merge sources
        if (additionalData.sources) {
          mainData.sources = [...(mainData.sources || []), ...additionalData.sources];
        }
        if (additionalData.additionalSources) {
          mainData.sources = [...(mainData.sources || []), ...additionalData.additionalSources];
        }

        console.log(`✓ Loaded additional data from ${file}`);
      } catch (err) {
        console.warn(`⚠ Could not load ${file}:`, err);
      }
    }
  }

  // Deduplicate by ID
  const seenEventIds = new Set<string>();
  mainData.events = mainData.events.filter((event: any) => {
    if (seenEventIds.has(event.id)) return false;
    seenEventIds.add(event.id);
    return true;
  });

  const seenSourceIds = new Set<string>();
  mainData.sources = (mainData.sources || []).filter((source: any) => {
    if (seenSourceIds.has(source.id)) return false;
    seenSourceIds.add(source.id);
    return true;
  });

  return mainData;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Load and merge all seed data
  const seedData = loadSeedData();
  console.log(`📊 Loaded ${seedData.events.length} events, ${seedData.regions?.length || 0} regions, ${seedData.sources?.length || 0} sources`);

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'مدير النظام',
      role: UserRole.ADMIN,
      active: true,
    },
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      passwordHash: editorPassword,
      name: 'محرر المحتوى',
      role: UserRole.EDITOR,
      active: true,
    },
  });
  console.log(`✓ Editor user created: ${editor.email}`);

  // Create regions
  console.log('Creating regions...');
  for (const region of seedData.regions) {
  // Try to load GeoJSON geometries from the web public data so regions.geometry
  // can be populated in the DB. This makes `/api/regions/geojson` return actual
  // shapes and event_count derived from the DB.
  const geojsonPath = path.join(__dirname, '../../web/public/data/algeria-wilayas.geojson');
  let geomByCode = new Map<string, any>();
  let centroidByCode = new Map<string, { lat: number; lng: number }>();
  if (fs.existsSync(geojsonPath)) {
    try {
      const geojsonRaw = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
      const features = Array.isArray(geojsonRaw.features) ? geojsonRaw.features : [];
      for (const f of features) {
        const code = f?.properties?.code;
        if (!code) continue;
        geomByCode.set(String(code), f.geometry ?? null);

        // compute a simple centroid from first ring
        try {
          const geom = f.geometry;
          let lat = 28.0339, lng = 1.6596;
          if (geom) {
            let ring = null;
            if (geom.type === 'Polygon') ring = geom.coordinates?.[0];
            else if (geom.type === 'MultiPolygon') ring = geom.coordinates?.[0]?.[0];
            if (ring && ring.length) {
              let sumLat = 0, sumLng = 0;
              for (const pt of ring) { sumLng += Number(pt?.[0] ?? 0); sumLat += Number(pt?.[1] ?? 0); }
              lat = sumLat / ring.length;
              lng = sumLng / ring.length;
            }
          }
          centroidByCode.set(String(code), { lat, lng });
        } catch (e) {
          // ignore centroid errors
        }
      }
      console.log(`✓ Loaded ${geomByCode.size} geometries from ${geojsonPath}`);
    } catch (err) {
      console.warn('⚠ Could not parse geojson file:', err);
    }
  } else {
    console.warn(`⚠ GeoJSON file not found at ${geojsonPath}`);
  }

  for (const region of seedData.regions) {
    const geom = geomByCode.get(String(region.code)) ?? null;
    const centroid = centroidByCode.get(String(region.code));
    await prisma.region.upsert({
      where: { code: region.code },
      update: {
        nameAr: region.nameAr,
        geometry: geom,
        centerLat: centroid ? centroid.lat : undefined,
        centerLng: centroid ? centroid.lng : undefined,
      },
      create: {
        code: region.code,
        nameAr: region.nameAr,
        nameEn: region.nameEn || null,
        geometry: geom,
        centerLat: centroid ? centroid.lat : null,
        centerLng: centroid ? centroid.lng : null,
      },
    });
  }
  console.log(`✓ ${seedData.regions.length} regions created`);

  // Create sources
  console.log('Creating sources...');
  const sourceMap = new Map<string, string>();
  for (const source of seedData.sources) {
    const typeMap: Record<string, SourceType> = {
      'كتاب': SourceType.BOOK,
      'مقال': SourceType.ARTICLE,
      'أرشيف': SourceType.ARCHIVE,
      'موسوعة': SourceType.ENCYCLOPEDIA,
      'رسالة': SourceType.THESIS,
      'موقع': SourceType.WEBSITE,
      'وثيقة': SourceType.DOCUMENT,
    };

    const created = await prisma.source.create({
      data: {
        title: source.title,
        author: source.author || null,
        year: source.year || null,
        publisher: source.publisher || null,
        type: typeMap[source.type] || SourceType.BOOK,
        url: source.url || null,
        isbn: source.isbn || null,
        notes: source.notes || null,
      },
    });
    sourceMap.set(source.id, created.id);
  }
  console.log(`✓ ${seedData.sources.length} sources created`);

  // Create people
  console.log('Creating historical figures...');
  const personMap = new Map<string, string>();
  const people = new Set<string>();

  // Extract unique people from events
  for (const event of seedData.events) {
    if (event.people) {
      for (const person of event.people) {
        if (!people.has(person.id)) {
          people.add(person.id);
          const created = await prisma.person.create({
            data: {
              nameAr: person.nameAr,
              nameEn: person.nameEn || null,
              birthYear: person.birthYear || null,
              deathYear: person.deathYear || null,
              bio: person.bio || null,
              role: person.role || null,
            },
          });
          personMap.set(person.id, created.id);
        }
      }
    }
  }
  console.log(`✓ ${people.size} historical figures created`);

  // Create events
  console.log('Creating events...');
  const typeMap: Record<string, EventType> = {
    'ثورة': EventType.REVOLUTION,
    'انتفاضة': EventType.UPRISING,
    'معركة': EventType.BATTLE,
    'حصار': EventType.SIEGE,
    'مقاومة': EventType.RESISTANCE,
    'غزوة': EventType.RAID,
  };

  const statusMap: Record<string, ReviewStatus> = {
    'مؤكد': ReviewStatus.CONFIRMED,
    'بحاجة_لمراجعة': ReviewStatus.NEEDS_REVIEW,
    'غير_مؤكد': ReviewStatus.UNVERIFIED,
    'مسودة': ReviewStatus.DRAFT,
  };

  for (const event of seedData.events) {
    // Find region
    const region = await prisma.region.findUnique({
      where: { code: event.regionCode },
    });

    if (!region) {
      console.warn(`⚠ Region not found for code: ${event.regionCode}`);
      continue;
    }

    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        type: typeMap[event.type] || EventType.RESISTANCE,
        regionId: region.id,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        description: event.description,
        detailedDescription: event.detailedDescription || null,
        coordinates: event.coordinates || null,
        outcome: event.outcome || null,
        casualtiesText: event.casualtiesText || null,
        parties: event.parties || null,
        reviewStatus: statusMap[event.reviewStatus] || ReviewStatus.DRAFT,
        createdById: admin.id,
      },
    });

    // Link sources
    if (event.sources) {
      for (const source of event.sources) {
        const sourceId = sourceMap.get(source.id);
        if (sourceId) {
          await prisma.eventSource.create({
            data: {
              eventId: createdEvent.id,
              sourceId: sourceId,
              pageRange: source.pageRange || null,
            },
          });
        }
      }
    }

    // Link people
    if (event.people) {
      for (const person of event.people) {
        const personId = personMap.get(person.id);
        if (personId) {
          await prisma.eventPerson.create({
            data: {
              eventId: createdEvent.id,
              personId: personId,
              role: person.role || 'مشارك',
            },
          });
        }
      }
    }
  }
  console.log(`✓ ${seedData.events.length} events created`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: 2 (admin@example.com, editor@example.com)`);
  console.log(`   Regions: ${seedData.regions.length}`);
  console.log(`   Events: ${seedData.events.length}`);
  console.log(`   Sources: ${seedData.sources.length}`);
  console.log(`   People: ${people.size}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
}