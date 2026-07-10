import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/slug";

// Deterministic PRNG (mulberry32) so re-running the seed produces identical data.
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260707);

function randInt(min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}
function chance(pct: number) {
  return rng() < pct;
}

// ---------------------------------------------------------------------------
// New Areas
// ---------------------------------------------------------------------------

const NEW_LOCALITIES_UNDER: Record<string, string[]> = {
  ahmedabad: ["Paldi", "Naranpura", "Thaltej", "Chandkheda", "Ghatlodia"],
  tirunelveli: ["Melapalayam", "Vannarpettai", "S.S. Colony"],
  coimbatore: ["RS Puram", "Gandhipuram", "Peelamedu"],
};

const NEW_CITY = { name: "Coimbatore", slug: "coimbatore", parentSlug: "tamil-nadu" };

// ---------------------------------------------------------------------------
// New Categories
// ---------------------------------------------------------------------------

const NEW_CATEGORIES = [
  { name: "Bakeries & Sweets", slug: "bakeries-sweets", icon: "Cake" },
  { name: "Gyms & Fitness Centers", slug: "gyms-fitness", icon: "Dumbbell" },
  { name: "Tutoring & Coaching", slug: "tutoring-coaching", icon: "GraduationCap" },
  { name: "Pet Care", slug: "pet-care", icon: "PawPrint" },
  { name: "Photography Studios", slug: "photography-studios", icon: "Camera" },
  { name: "Car & Bike Services", slug: "car-bike-services", icon: "Car" },
];

// ---------------------------------------------------------------------------
// New Services, scoped per category slug
// ---------------------------------------------------------------------------

const NEW_SERVICES_BY_CATEGORY: Record<string, { name: string; slug: string }[]> = {
  "bakeries-sweets": [
    { name: "Custom Cakes", slug: "custom-cakes" },
    { name: "Sweets Box Ordering", slug: "sweets-box-ordering" },
    { name: "Bulk Catering", slug: "bulk-catering" },
  ],
  "gyms-fitness": [
    { name: "Personal Training", slug: "personal-training" },
    { name: "Zumba Classes", slug: "zumba-classes" },
    { name: "Weight Loss Program", slug: "weight-loss-program" },
  ],
  "tutoring-coaching": [
    { name: "Group Tuition", slug: "group-tuition" },
    { name: "One-on-One Coaching", slug: "one-on-one-coaching" },
    { name: "Test Prep", slug: "test-prep" },
  ],
  "pet-care": [
    { name: "Pet Grooming", slug: "pet-grooming" },
    { name: "Veterinary Checkup", slug: "veterinary-checkup" },
    { name: "Pet Boarding", slug: "pet-boarding" },
  ],
  "photography-studios": [
    { name: "Wedding Photography", slug: "wedding-photography" },
    { name: "Passport Photos", slug: "passport-photos-studio" },
    { name: "Event Coverage", slug: "event-coverage" },
  ],
  "car-bike-services": [
    { name: "Car Wash", slug: "car-wash" },
    { name: "Bike Servicing", slug: "bike-servicing" },
    { name: "Puncture Repair", slug: "puncture-repair" },
  ],
};

// ---------------------------------------------------------------------------
// Business name / description templates per category slug
// ---------------------------------------------------------------------------

const NAME_PREFIXES = [
  "Shree Ganesh",
  "Sunrise",
  "Royal",
  "New India",
  "Sai",
  "Krishna",
  "Om",
  "City",
  "Green Valley",
  "Star",
  "Golden",
  "Prime",
  "Sri Balaji",
  "Divine",
  "Elite",
];

const CATEGORY_NOUNS: Record<string, string[]> = {
  dentists: ["Dental Care", "Dental Clinic", "Smile Studio"],
  hospitals: ["Multispeciality Hospital", "Care Hospital", "Medical Center"],
  restaurants: ["Family Restaurant", "Kitchen", "Bhavan Restaurant"],
  "medical-shops": ["Pharmacy", "Medical Store", "Chemist"],
  hotels: ["Residency", "Inn", "Lodge"],
  salons: ["Salon & Spa", "Unisex Salon", "Beauty Studio"],
  temples: ["Temple", "Mandir"],
  "xerox-printing-shops": ["Xerox & Stationery", "Print Center", "Copy Shop"],
  "grocery-stores": ["Super Market", "General Store", "Grocery Mart"],
  "retail-shops": ["Retail Store", "Fashion Store", "Shopping Center"],
  "educational-institutions": ["Academy", "Learning Center", "Institute"],
  "home-services": ["Home Services", "Repair Services", "Fix-It Solutions"],
  transport: ["Roadways", "Travels", "Cab Services"],
  "bakeries-sweets": ["Bakery", "Sweets & Snacks", "Cake Shop"],
  "gyms-fitness": ["Fitness Studio", "Gym", "Wellness Center"],
  "tutoring-coaching": ["Tutorials", "Coaching Classes", "Learning Point"],
  "pet-care": ["Pet Clinic", "Pet Care Center", "Pet Shop"],
  "photography-studios": ["Photo Studio", "Photography Studio", "Digital Studio"],
  "car-bike-services": ["Auto Care", "Car & Bike Service Center", "Garage"],
};

const SHORT_DESCRIPTIONS: Record<string, string[]> = {
  dentists: ["Trusted dental care for the whole family.", "Modern dental treatments at affordable prices."],
  hospitals: ["24/7 emergency and multispeciality care.", "Compassionate healthcare for every patient."],
  restaurants: ["Delicious food made with love.", "A cozy place for family dining."],
  "medical-shops": ["Your neighbourhood pharmacy.", "All your medicines, delivered fast."],
  hotels: ["Comfortable stays, warm hospitality.", "A home away from home."],
  salons: ["Look your best, every day.", "Expert stylists, premium products."],
  temples: ["A place of peace and devotion.", "Daily prayers and festival celebrations."],
  "xerox-printing-shops": ["Fast and affordable printing services.", "Xerox, lamination and more, done right."],
  "grocery-stores": ["Fresh groceries at your doorstep.", "Everyday essentials, everyday low prices."],
  "retail-shops": ["Latest trends, best prices.", "Shop the season's best styles."],
  "educational-institutions": ["Shaping bright futures since day one.", "Quality education for every student."],
  "home-services": ["Reliable home repairs, done right.", "Skilled technicians at your service."],
  transport: ["Safe and reliable travel.", "Comfortable rides, on time, every time."],
  "bakeries-sweets": ["Freshly baked, made daily.", "Sweet treats for every occasion."],
  "gyms-fitness": ["Train smart, feel great.", "Your fitness journey starts here."],
  "tutoring-coaching": ["Personalized learning for every student.", "Helping students achieve their best."],
  "pet-care": ["Caring for your furry friends.", "Complete pet care under one roof."],
  "photography-studios": ["Capturing your special moments.", "Professional photography for every occasion."],
  "car-bike-services": ["Quick and reliable vehicle servicing.", "Keeping your ride in top shape."],
};

function fallbackNoun() {
  return pick(["Store", "Services", "Center", "Shop"]);
}
function fallbackDescription() {
  return pick(["A trusted local business serving the community.", "Quality service you can rely on."]);
}

function businessName(categorySlug: string) {
  const noun = pick(CATEGORY_NOUNS[categorySlug] ?? [fallbackNoun()]);
  return `${pick(NAME_PREFIXES)} ${noun}`;
}

function businessDescriptions(categorySlug: string) {
  const pool = SHORT_DESCRIPTIONS[categorySlug] ?? [fallbackDescription()];
  const short = pick(pool);
  return {
    short,
    full: `${short} We pride ourselves on quality, reliability, and friendly service for every customer who walks through our doors.`,
  };
}

function randomPhone() {
  return `+91 9${randInt(100000000, 999999999)}`;
}

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function generateHours(is247: boolean) {
  return DAY_ORDER.map((day) => {
    if (is247) {
      return { dayOfWeek: day, openTime: "00:00", closeTime: "23:59", isClosed: false };
    }
    const isClosed = day === "sunday" && chance(0.3);
    return {
      dayOfWeek: day,
      openTime: isClosed ? null : pick(["09:00", "09:30", "10:00", "10:30"]),
      closeTime: isClosed ? null : pick(["19:00", "19:30", "20:00", "20:30", "21:00"]),
      isClosed,
    };
  });
}

async function main() {
  console.log("Seeding additional MeraArea sample data...");

  // --- Areas -----------------------------------------------------------
  const tamilNadu = await prisma.area.findFirstOrThrow({ where: { slug: NEW_CITY.parentSlug } });
  const coimbatoreImage = `https://picsum.photos/seed/area-${NEW_CITY.slug}/800/600`;
  const coimbatore = await prisma.area.upsert({
    where: { slug: NEW_CITY.slug },
    update: { imageUrl: coimbatoreImage },
    create: {
      name: NEW_CITY.name,
      slug: NEW_CITY.slug,
      type: "city",
      parentId: tamilNadu.id,
      state: "Tamil Nadu",
      city: NEW_CITY.name,
      imageUrl: coimbatoreImage,
      status: "published",
    },
  });

  const parentBySlug: Record<string, { id: string; city: string | null }> = {
    ahmedabad: await prisma.area.findFirstOrThrow({ where: { slug: "ahmedabad" } }),
    tirunelveli: await prisma.area.findFirstOrThrow({ where: { slug: "tirunelveli" } }),
    coimbatore,
  };

  const newAreaIds: string[] = [];
  for (const [parentSlug, localities] of Object.entries(NEW_LOCALITIES_UNDER)) {
    const parent = parentBySlug[parentSlug];
    for (const localityName of localities) {
      const slug = slugify(localityName);
      const imageUrl = `https://picsum.photos/seed/area-${slug}/800/600`;
      const area = await prisma.area.upsert({
        where: { slug },
        update: { imageUrl },
        create: {
          name: localityName,
          slug,
          type: "locality",
          parentId: parent.id,
          city: parent.city,
          imageUrl,
          status: "published",
        },
      });
      newAreaIds.push(area.id);
    }
  }
  newAreaIds.push(coimbatore.id);
  console.log(`Areas ready: ${newAreaIds.length} new areas (+ Coimbatore city).`);

  // --- Categories --------------------------------------------------------
  const existingCategories = await prisma.category.findMany({
    where: { status: "published" },
    select: { id: true, slug: true },
  });
  for (const [i, cat] of NEW_CATEGORIES.entries()) {
    const imageUrl = `https://picsum.photos/seed/category-${cat.slug}/800/600`;
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { imageUrl },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        imageUrl,
        displayOrder: 100 + i,
        status: "published",
      },
    });
  }
  const allCategories = await prisma.category.findMany({
    where: { status: "published" },
    select: { id: true, slug: true },
  });
  console.log(`Categories ready: ${allCategories.length} total (${existingCategories.length} pre-existing).`);

  // --- Services ------------------------------------------------------------
  const serviceIdsByCategory: Record<string, string[]> = {};
  for (const [categorySlug, services] of Object.entries(NEW_SERVICES_BY_CATEGORY)) {
    const ids: string[] = [];
    for (const svc of services) {
      const created = await prisma.service.upsert({
        where: { slug: svc.slug },
        update: {},
        create: { name: svc.name, slug: svc.slug, status: "active" },
      });
      ids.push(created.id);
    }
    serviceIdsByCategory[categorySlug] = ids;
  }
  // Map existing services to their most relevant category by keyword, best-effort.
  const existingServices = await prisma.service.findMany({
    where: { status: "active", slug: { notIn: Object.values(NEW_SERVICES_BY_CATEGORY).flat().map((s) => s.slug) } },
    select: { id: true, slug: true },
  });
  const EXISTING_SERVICE_CATEGORY: Record<string, string> = {
    "root-canal": "dentists",
    "dental-implant": "dentists",
    "teeth-cleaning": "dentists",
    braces: "dentists",
    "general-checkup": "hospitals",
    "blood-test": "hospitals",
    "home-delivery": "medical-shops",
    "online-consultation": "hospitals",
    xerox: "xerox-printing-shops",
    lamination: "xerox-printing-shops",
    "spiral-binding": "xerox-printing-shops",
    "passport-photo": "xerox-printing-shops",
    haircut: "salons",
    facial: "salons",
    "bridal-makeup": "salons",
    "hair-spa": "salons",
    "ac-repair": "home-services",
    plumbing: "home-services",
    electrician: "home-services",
    "home-cleaning": "home-services",
  };
  for (const svc of existingServices) {
    const categorySlug = EXISTING_SERVICE_CATEGORY[svc.slug];
    if (!categorySlug) continue;
    serviceIdsByCategory[categorySlug] = [...(serviceIdsByCategory[categorySlug] ?? []), svc.id];
  }

  // --- Businesses ----------------------------------------------------------
  const categoryBySlug = new Map(allCategories.map((c) => [c.slug, c] as const));
  const usedSlugs = new Set<string>();
  let created = 0;

  for (const areaId of newAreaIds) {
    const categoriesForArea = pickN(allCategories, randInt(4, 7));
    for (const category of categoriesForArea) {
      const businessesForCategory = randInt(1, 3);
      for (let i = 0; i < businessesForCategory; i++) {
        const name = businessName(category.slug);
        let slug = slugify(name);
        while (usedSlugs.has(`${areaId}:${slug}`)) {
          slug = `${slug}-${randInt(2, 99)}`;
        }
        usedSlugs.add(`${areaId}:${slug}`);

        const { short, full } = businessDescriptions(category.slug);
        const is247 = category.slug === "hospitals" && chance(0.3);
        const isVerified = chance(0.18);
        const featuredHomepage = chance(0.12);
        const featuredAreaPage = chance(0.18);
        const serviceIds = pickN(
          serviceIdsByCategory[category.slug] ?? [],
          Math.min(randInt(2, 4), (serviceIdsByCategory[category.slug] ?? []).length)
        );

        await prisma.business.upsert({
          where: { areaId_slug: { areaId, slug } },
          update: {},
          create: {
            name,
            slug,
            areaId,
            categoryId: category.id,
            status: "published",
            shortDescription: short,
            fullDescription: full,
            phone: randomPhone(),
            whatsapp: randomPhone(),
            address: `${randInt(1, 200)}, Main Road`,
            isVerified,
            featuredHomepage,
            featuredAreaPage,
            images: {
              create: Array.from({ length: randInt(3, 5) }, (_, idx) => ({
                url: `https://picsum.photos/seed/${slug}-${idx}/800/600`,
                displayOrder: idx,
                isCover: idx === 0,
              })),
            },
            hours: { create: generateHours(is247) },
            services: { create: serviceIds.map((serviceId) => ({ serviceId })) },
          },
        });
        created++;
      }
    }
  }

  console.log(`Businesses created/updated: ${created}`);
  console.log("Seed complete.");
  void categoryBySlug;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
