import {
  PrismaClient,
  EventType,
  ReviewStatus,
  SourceType,
  UserRole,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function loadSeedData() {
  const seedDir = path.join(__dirname, "../../../data/seed");
  const mainDataPath = path.join(seedDir, "events.json");
  const seedData = JSON.parse(fs.readFileSync(mainDataPath, "utf-8"));
  console.log(
    `✔ Loaded ${seedData.events.length} events, ${seedData.regions.length} regions, ${seedData.sources.length} sources`,
  );
  return seedData;
}

async function main() {
  console.log("🌱 Starting database seed...");

  const seedData = loadSeedData();

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      name: "مدير النظام",
      role: UserRole.ADMIN,
      active: true,
    },
  });

  const editorPassword = await bcrypt.hash("editor123", 10);
  await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      email: "editor@example.com",
      passwordHash: editorPassword,
      name: "محرر المحتوى",
      role: UserRole.EDITOR,
      active: true,
    },
  });
  console.log("✔ Users created");

  // ── GeoJSON geometries (loaded ONCE, outside region loop) ──────────────────
  const geojsonPath = path.join(
    __dirname,
    "../../web/public/data/algeria-wilayas.geojson",
  );
  const geomByCode = new Map<string, any>();
  const centroidByCode = new Map<string, { lat: number; lng: number }>();

  if (fs.existsSync(geojsonPath)) {
    try {
      const geojsonRaw = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"));
      const features = Array.isArray(geojsonRaw.features)
        ? geojsonRaw.features
        : [];
      for (const f of features) {
        const code = f?.properties?.code;
        if (!code) continue;
        geomByCode.set(String(code), f.geometry ?? null);
        try {
          const geom = f.geometry;
          let lat = 28.0339,
            lng = 1.6596;
          if (geom) {
            let ring: number[][] | null = null;
            if (geom.type === "Polygon") ring = geom.coordinates?.[0];
            else if (geom.type === "MultiPolygon")
              ring = geom.coordinates?.[0]?.[0];
            if (ring && ring.length) {
              let sumLat = 0,
                sumLng = 0;
              for (const pt of ring) {
                sumLng += Number(pt?.[0] ?? 0);
                sumLat += Number(pt?.[1] ?? 0);
              }
              lat = sumLat / ring.length;
              lng = sumLng / ring.length;
            }
          }
          centroidByCode.set(String(code), { lat, lng });
        } catch (_) {
          /* ignore centroid errors */
        }
      }
      console.log(`✔ Loaded ${geomByCode.size} geometries from GeoJSON`);
    } catch (err) {
      console.warn("⚠ Could not parse GeoJSON file:", err);
    }
  } else {
    console.warn(`⚠ GeoJSON file not found at ${geojsonPath}`);
  }

  // ── Regions ────────────────────────────────────────────────────────────────
  console.log("Creating regions...");
  for (const region of seedData.regions) {
    const geom = geomByCode.get(String(region.code)) ?? null;
    const centroid = centroidByCode.get(String(region.code));
    await prisma.region.upsert({
      where: { code: region.code },
      update: {
        nameAr: region.nameAr,
        geometry: geom,
        centerLat: centroid?.lat ?? undefined,
        centerLng: centroid?.lng ?? undefined,
      },
      create: {
        code: region.code,
        nameAr: region.nameAr,
        nameEn: region.nameEn ?? null,
        geometry: geom,
        centerLat: centroid?.lat ?? null,
        centerLng: centroid?.lng ?? null,
      },
    });
  }
  console.log(`✔ ${seedData.regions.length} regions created`);

  // ── Sources ────────────────────────────────────────────────────────────────
  console.log("Creating sources...");
  const typeMap: Record<string, SourceType> = {
    كتاب: SourceType.BOOK,
    مقال: SourceType.ARTICLE,
    أرشيف: SourceType.ARCHIVE,
    موسوعة: SourceType.ENCYCLOPEDIA,
    رسالة: SourceType.THESIS,
    موقع: SourceType.WEBSITE,
    وثيقة: SourceType.DOCUMENT,
  };

  const sourceMap = new Map<string, string>();
  for (const source of seedData.sources) {
    const created = await prisma.source.create({
      data: {
        title: source.title,
        author: source.author ?? null,
        year: source.year ?? null,
        publisher: source.publisher ?? null,
        type: typeMap[source.type] ?? SourceType.BOOK,
        url: source.url ?? null,
        isbn: source.isbn || null,
        notes: source.notes || null,
      },
    });
    sourceMap.set(source.id, created.id);
  }
  console.log(`✔ ${seedData.sources.length} sources created`);

  // ── People (extracted from events, deduplicated) ───────────────────────────
  console.log("Creating historical figures...");
  const personMap = new Map<string, string>();
  const seenPersonIds = new Set<string>();

  for (const event of seedData.events) {
    if (!event.people) continue;
    for (const person of event.people) {
      if (seenPersonIds.has(person.id)) continue;
      seenPersonIds.add(person.id);
      const created = await prisma.person.create({
        data: {
          nameAr: person.nameAr,
          nameEn: person.nameEn ?? null,
          birthYear: person.birthYear ?? null,
          deathYear: person.deathYear ?? null,
          bio: person.bio ?? null,
          role: person.role ?? null,
        },
      });
      personMap.set(person.id, created.id);
    }
  }
  console.log(`✔ ${seenPersonIds.size} historical figures created`);

  // ── Events ─────────────────────────────────────────────────────────────────
  console.log("Creating events...");
  const eventTypeMap: Record<string, EventType> = {
    ثورة: EventType.REVOLUTION,
    انتفاضة: EventType.UPRISING,
    معركة: EventType.BATTLE,
    حصار: EventType.SIEGE,
    مقاومة: EventType.RESISTANCE,
    غزوة: EventType.RAID,
  };

  const statusMap: Record<string, ReviewStatus> = {
    مؤكد: ReviewStatus.CONFIRMED,
    بحاجة_لمراجعة: ReviewStatus.NEEDS_REVIEW,
    غير_مؤكد: ReviewStatus.UNVERIFIED,
    مسودة: ReviewStatus.DRAFT,
  };

  let eventsCreated = 0;
  let eventsSkipped = 0;

  for (const event of seedData.events) {
    const region = await prisma.region.findUnique({
      where: { code: event.regionCode },
    });
    if (!region) {
      console.warn(
        `⚠ Region not found for code: ${event.regionCode} (event: ${event.id})`,
      );
      eventsSkipped++;
      continue;
    }

    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        type: eventTypeMap[event.type] ?? EventType.RESISTANCE,
        regionId: region.id,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        description: event.description ?? "",
        detailedDescription: event.detailedDescription ?? null,
        coordinates: event.coordinates ?? null,
        outcome: event.outcome ?? null,
        casualtiesText: event.casualtiesText ?? null,
        casualtiesEstimated: event.casualtiesEstimated ?? null,
        parties: event.parties ?? null,
        reviewStatus: statusMap[event.reviewStatus] ?? ReviewStatus.DRAFT,
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
              sourceId,
              pageRange: source.pageRange || null,
            },
          });
        } else {
          console.warn(
            `  ⚠ Source ${source.id} not found for event ${event.id}`,
          );
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
              personId,
              role: person.role ?? "مشارك",
            },
          });
        }
      }
    }

    eventsCreated++;
  }

  console.log(`✔ ${eventsCreated} events created, ${eventsSkipped} skipped`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Users:   2 (admin@example.com / editor@example.com)`);
  console.log(`   Regions: ${seedData.regions.length}`);
  console.log(`   Sources: ${seedData.sources.length}`);
  console.log(`   People:  ${seenPersonIds.size}`);
  console.log(`   Events:  ${eventsCreated}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
