import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { brands } from "./schema/brands";
import { categories } from "./schema/categories";
import { vehicleImages } from "./schema/vehicle-images";
import { vehicleModels } from "./schema/vehicle-models";
import { vehicles } from "./schema/vehicles";

const UA = "VelocityShowroom/1.0 (local catalog seed; educational use)";

type CarSeed = {
  id: string;
  slug: string;
  brand: { id: string; name: string; slug: string };
  model: { id: string; name: string; slug: string };
  categoryId: string;
  name: string;
  year: number;
  price: number;
  mileageKm?: number;
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  transmission: "automatic" | "manual";
  condition: "new" | "used";
  availability: "available" | "reserved" | "sold" | "coming_soon";
  location: string;
  description: string;
  isFeatured: boolean;
  files: string[];
};

const CARS: CarSeed[] = [
  {
    id: "veh-rr-ghost",
    slug: "rolls-royce-ghost",
    brand: { id: "rolls-royce", name: "Rolls-Royce", slug: "rolls-royce" },
    model: { id: "rr-ghost", name: "Ghost", slug: "ghost" },
    categoryId: "luxury",
    name: "Ghost",
    year: 2022,
    price: 72_000_000,
    mileageKm: 6400,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "A long, quiet sedan with a presence that arrives before the car does. Photography from Wikimedia Commons.",
    isFeatured: true,
    files: [
      "2022 Rolls-Royce Ghost rear.jpg",
      "2015 Rolls-Royce Ghost (664S Series II MY15) sedan (21446867083).jpg",
    ],
  },
  {
    id: "veh-bentley-gt",
    slug: "bentley-continental-gt",
    brand: { id: "bentley", name: "Bentley", slug: "bentley" },
    model: { id: "bentley-continental-gt", name: "Continental GT", slug: "continental-gt" },
    categoryId: "coupe",
    name: "Continental GT",
    year: 2018,
    price: 28_500_000,
    mileageKm: 18400,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Delhi",
    description:
      "A grand touring coupe with a wide stance and a cabin meant for distance.",
    isFeatured: false,
    files: [
      "Bentley Continental GT V8 S, Techno-Classica 2018, Essen (IMG 9623).jpg",
    ],
  },
  {
    id: "veh-aston-db11",
    slug: "aston-martin-db11",
    brand: { id: "aston-martin", name: "Aston Martin", slug: "aston-martin" },
    model: { id: "aston-db11", name: "DB11", slug: "db11" },
    categoryId: "coupe",
    name: "DB11",
    year: 2019,
    price: 26_800_000,
    mileageKm: 15200,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "A sculpted GT with a long hood and a cabin that still feels intimate.",
    isFeatured: false,
    files: ["Aston Martin DB11 V8.jpg", "2017 Aston Martin DB11 V12.jpg"],
  },
  {
    id: "veh-mclaren-720s",
    slug: "mclaren-720s",
    brand: { id: "mclaren", name: "McLaren", slug: "mclaren" },
    model: { id: "mclaren-720s", name: "720S", slug: "720s" },
    categoryId: "sports",
    name: "720S",
    year: 2017,
    price: 41_200_000,
    mileageKm: 9800,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Bengaluru",
    description:
      "A dihedral-door supercar with a low canopy and a body that reads as one surface.",
    isFeatured: true,
    files: ["2017 McLaren 720S.jpg"],
  },
  {
    id: "veh-range-rover",
    slug: "range-rover-autobiography",
    brand: { id: "land-rover", name: "Land Rover", slug: "land-rover" },
    model: { id: "range-rover", name: "Range Rover", slug: "range-rover" },
    categoryId: "suv",
    name: "Range Rover Autobiography",
    year: 2023,
    price: 32_400_000,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "new",
    availability: "available",
    location: "Delhi",
    description:
      "A commanding SUV with a calm cabin and a silhouette that reads well from every approach.",
    isFeatured: false,
    files: [
      "Range Rover P530 Autobiography LWB (L460) IMG 6646.jpg",
      "2022 Range Rover.jpg",
    ],
  },
  {
    id: "veh-tesla-s",
    slug: "tesla-model-s",
    brand: { id: "tesla", name: "Tesla", slug: "tesla" },
    model: { id: "tesla-model-s", name: "Model S", slug: "model-s" },
    categoryId: "electric",
    name: "Model S",
    year: 2016,
    price: 8_900_000,
    mileageKm: 31200,
    fuelType: "electric",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Bengaluru",
    description:
      "A low electric sedan with a quiet cabin and a line that stays simple in motion.",
    isFeatured: false,
    files: ["2016 Tesla Model S 75 Front.jpg", "2016 Tesla Model S 75 Rear.jpg"],
  },
  {
    id: "veh-lexus-lc",
    slug: "lexus-lc-500",
    brand: { id: "lexus", name: "Lexus", slug: "lexus" },
    model: { id: "lexus-lc-500", name: "LC 500", slug: "lc-500" },
    categoryId: "coupe",
    name: "LC 500",
    year: 2021,
    price: 22_600_000,
    mileageKm: 11400,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "A grand touring coupe with a spindle grille kept in service of proportion, not ornament.",
    isFeatured: false,
    files: ["Lexus LC 500.jpg", "2018 Lexus LC 500.jpg"],
  },
  {
    id: "veh-maserati-mc20",
    slug: "maserati-mc20",
    brand: { id: "maserati", name: "Maserati", slug: "maserati" },
    model: { id: "maserati-mc20", name: "MC20", slug: "mc20" },
    categoryId: "sports",
    name: "MC20",
    year: 2022,
    price: 37_400_000,
    mileageKm: 5200,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "A mid-engine form with a butterfly-door stance and a cabin focused on the driver.",
    isFeatured: false,
    files: ["Maserati MC20.jpg", "2021 Maserati MC20.jpg"],
  },
  {
    id: "veh-bmw-m4",
    slug: "bmw-m4-competition",
    brand: { id: "bmw", name: "BMW", slug: "bmw" },
    model: { id: "bmw-m4", name: "M4", slug: "m4" },
    categoryId: "coupe",
    name: "M4 Competition",
    year: 2023,
    price: 15_200_000,
    mileageKm: 8200,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "A taut coupe with a low stance and a cabin focused on the driver. Surfaces stay quiet; the presence does not.",
    isFeatured: true,
    files: ["BMW M4 Competition G82.jpg", "2021 BMW M4 Competition.jpg"],
  },
  {
    id: "veh-bmw-m3",
    slug: "bmw-m3-competition",
    brand: { id: "bmw", name: "BMW", slug: "bmw" },
    model: { id: "bmw-m3", name: "M3", slug: "m3" },
    categoryId: "sedan",
    name: "M3 Competition",
    year: 2024,
    price: 16_800_000,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "new",
    availability: "available",
    location: "Mumbai",
    description:
      "Four doors, one attitude. The M3 Competition is composed for the road without losing its edge.",
    isFeatured: false,
    files: ["BMW M3 Competition G80.jpg", "2021 BMW M3 Competition.jpg"],
  },
  {
    id: "veh-bmw-x5",
    slug: "bmw-x5-xdrive40i",
    brand: { id: "bmw", name: "BMW", slug: "bmw" },
    model: { id: "bmw-x5", name: "X5", slug: "x5" },
    categoryId: "suv",
    name: "X5 xDrive40i",
    year: 2023,
    price: 11_400_000,
    mileageKm: 14600,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Delhi",
    description:
      "A commanding SUV with a calm cabin and a silhouette that reads well from every approach.",
    isFeatured: false,
    files: ["BMW X5 G05.jpg", "2019 BMW X5.jpg"],
  },
  {
    id: "veh-porsche-911",
    slug: "porsche-911-carrera-s",
    brand: { id: "porsche", name: "Porsche", slug: "porsche" },
    model: { id: "porsche-911", name: "911", slug: "911" },
    categoryId: "sports",
    name: "911 Carrera S",
    year: 2024,
    price: 22_400_000,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "new",
    availability: "available",
    location: "Mumbai",
    description:
      "The enduring sports silhouette. Immediate, precise, and unmistakably Porsche.",
    isFeatured: true,
    files: ["Porsche 911 Carrera S 992.jpg", "2020 Porsche 911 Carrera S.jpg"],
  },
  {
    id: "veh-porsche-taycan",
    slug: "porsche-taycan",
    brand: { id: "porsche", name: "Porsche", slug: "porsche" },
    model: { id: "porsche-taycan", name: "Taycan", slug: "taycan" },
    categoryId: "electric",
    name: "Taycan",
    year: 2023,
    price: 18_900_000,
    mileageKm: 6100,
    fuelType: "electric",
    transmission: "automatic",
    condition: "used",
    availability: "reserved",
    location: "Bengaluru",
    description:
      "Electric, but still a Porsche. Low, wide, and quiet in a way that feels considered rather than empty.",
    isFeatured: false,
    files: ["Porsche Taycan Turbo S.jpg", "2020 Porsche Taycan.jpg"],
  },
  {
    id: "veh-porsche-cayenne",
    slug: "porsche-cayenne",
    brand: { id: "porsche", name: "Porsche", slug: "porsche" },
    model: { id: "porsche-cayenne", name: "Cayenne", slug: "cayenne" },
    categoryId: "suv",
    name: "Cayenne",
    year: 2022,
    price: 14_600_000,
    mileageKm: 18800,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Delhi",
    description:
      "An SUV that still sits like a sports car. Proportion first, utility without visual noise.",
    isFeatured: false,
    files: ["Porsche Cayenne.jpg", "2018 Porsche Cayenne.jpg"],
  },
  {
    id: "veh-mercedes-g",
    slug: "mercedes-g-400d",
    brand: { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes-benz" },
    model: { id: "mercedes-g-class", name: "G-Class", slug: "g-class" },
    categoryId: "luxury",
    name: "G 400d",
    year: 2023,
    price: 28_500_000,
    mileageKm: 9200,
    fuelType: "diesel",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "An icon of presence. Vertical, architectural, and unapologetically itself.",
    isFeatured: true,
    files: ["Mercedes-Benz G 400 d.jpg", "Mercedes-Benz G-Class.jpg"],
  },
  {
    id: "veh-mercedes-amg-gt",
    slug: "mercedes-amg-gt",
    brand: { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes-benz" },
    model: { id: "mercedes-amg-gt", name: "AMG GT", slug: "amg-gt" },
    categoryId: "sports",
    name: "AMG GT",
    year: 2022,
    price: 24_800_000,
    mileageKm: 11200,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Hyderabad",
    description:
      "A long hood, a low cabin, and a stance that belongs on a circuit as much as a boulevard.",
    isFeatured: false,
    files: ["Mercedes-AMG GT.jpg", "Mercedes-AMG GT C.jpg"],
  },
  {
    id: "veh-mercedes-c",
    slug: "mercedes-c-300",
    brand: { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes-benz" },
    model: { id: "mercedes-c-class", name: "C-Class", slug: "c-class" },
    categoryId: "sedan",
    name: "C 300",
    year: 2024,
    price: 6_400_000,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "new",
    availability: "coming_soon",
    location: "Pune",
    description:
      "A refined sedan with a quiet cabin and a line that stays elegant in motion.",
    isFeatured: false,
    files: ["Mercedes-Benz C 300.jpg", "2022 Mercedes-Benz C-Class.jpg"],
  },
  {
    id: "veh-audi-rs-etron",
    slug: "audi-rs-e-tron-gt",
    brand: { id: "audi", name: "Audi", slug: "audi" },
    model: { id: "audi-rs-etron-gt", name: "RS e-tron GT", slug: "rs-e-tron-gt" },
    categoryId: "electric",
    name: "RS e-tron GT",
    year: 2023,
    price: 21_400_000,
    mileageKm: 7400,
    fuelType: "electric",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Bengaluru",
    description:
      "Gran turismo proportion with an electric drivetrain. Low light, long surface, little ornament.",
    isFeatured: false,
    files: ["Audi RS e-tron GT.jpg", "2021 Audi e-tron GT.jpg"],
  },
  {
    id: "veh-audi-q8",
    slug: "audi-q8",
    brand: { id: "audi", name: "Audi", slug: "audi" },
    model: { id: "audi-q8", name: "Q8", slug: "q8" },
    categoryId: "suv",
    name: "Q8",
    year: 2022,
    price: 12_100_000,
    mileageKm: 22100,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Delhi",
    description:
      "A coupe-roofed SUV with a wide stance and a cabin that favours material over clutter.",
    isFeatured: false,
    files: ["Audi Q8.jpg", "2018 Audi Q8.jpg"],
  },
  {
    id: "veh-audi-a6",
    slug: "audi-a6",
    brand: { id: "audi", name: "Audi", slug: "audi" },
    model: { id: "audi-a6", name: "A6", slug: "a6" },
    categoryId: "sedan",
    name: "A6",
    year: 2024,
    price: 7_200_000,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "new",
    availability: "available",
    location: "Chennai",
    description:
      "A composed luxury sedan. Clean lines, a quiet interior, and a presence that does not shout.",
    isFeatured: false,
    files: ["Audi A6 C8.jpg", "2019 Audi A6.jpg"],
  },
  {
    id: "veh-huracan",
    slug: "lamborghini-huracan-evo",
    brand: { id: "lamborghini", name: "Lamborghini", slug: "lamborghini" },
    model: { id: "lambo-huracan", name: "Huracán", slug: "huracan" },
    categoryId: "sports",
    name: "Huracán EVO",
    year: 2022,
    price: 42_000_000,
    mileageKm: 4100,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Mumbai",
    description:
      "A wedge of colour and geometry. Dramatic at rest, sharper in motion.",
    isFeatured: false,
    files: ["Lamborghini Huracán EVO.jpg", "Lamborghini Huracan Evo.jpg"],
  },
  {
    id: "veh-urus",
    slug: "lamborghini-urus",
    brand: { id: "lamborghini", name: "Lamborghini", slug: "lamborghini" },
    model: { id: "lambo-urus", name: "Urus", slug: "urus" },
    categoryId: "suv",
    name: "Urus",
    year: 2023,
    price: 39_500_000,
    mileageKm: 8700,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "available",
    location: "Delhi",
    description:
      "Super-SUV presence with a cabin that still feels like a sports car’s cockpit.",
    isFeatured: false,
    files: ["Lamborghini Urus.jpg", "2018 Lamborghini Urus.jpg"],
  },
  {
    id: "veh-roma",
    slug: "ferrari-roma",
    brand: { id: "ferrari", name: "Ferrari", slug: "ferrari" },
    model: { id: "ferrari-roma", name: "Roma", slug: "roma" },
    categoryId: "coupe",
    name: "Roma",
    year: 2023,
    price: 37_600_000,
    mileageKm: 5300,
    fuelType: "petrol",
    transmission: "automatic",
    condition: "used",
    availability: "sold",
    location: "Mumbai",
    description:
      "A grand touring coupe with a sculpted body and a cabin meant for distance as much as arrival.",
    isFeatured: false,
    files: ["Ferrari Roma.jpg", "2020 Ferrari Roma.jpg"],
  },
  {
    id: "veh-296",
    slug: "ferrari-296-gtb",
    brand: { id: "ferrari", name: "Ferrari", slug: "ferrari" },
    model: { id: "ferrari-296", name: "296", slug: "296" },
    categoryId: "sports",
    name: "296 GTB",
    year: 2024,
    price: 54_000_000,
    fuelType: "hybrid",
    transmission: "automatic",
    condition: "new",
    availability: "available",
    location: "Mumbai",
    description:
      "A compact mid-engine form with hybrid assistance kept in service of the drive, not the brochure.",
    isFeatured: false,
    files: ["Ferrari 296 GTB.jpg", "2022 Ferrari 296 GTB.jpg"],
  },
];

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function wait(ms: number) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function wikiJson(url: string) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": UA } });
    if (response.status === 429) {
      await wait(4000 * (attempt + 1));
      continue;
    }
    if (!response.ok) {
      throw new Error(`Wikimedia ${response.status} for ${url}`);
    }
    return response.json() as Promise<Record<string, unknown>>;
  }
  throw new Error(`Wikimedia rate-limited for ${url}`);
}

function filePathUrl(filename: string) {
  const name = filename.replace(/^File:/, "");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1600`;
}

async function resolveFileUrl(filename: string) {
  const directPath = filePathUrl(filename);
  const probe = await fetch(directPath, {
    method: "HEAD",
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  if (probe.ok) return directPath;

  const title = filename.startsWith("File:") ? filename : `File:${filename}`;
  const direct = new URL("https://commons.wikimedia.org/w/api.php");
  direct.searchParams.set("action", "query");
  direct.searchParams.set("titles", title);
  direct.searchParams.set("prop", "imageinfo");
  direct.searchParams.set("iiprop", "url");
  direct.searchParams.set("iiurlwidth", "1600");
  direct.searchParams.set("format", "json");
  const data = (await wikiJson(direct.toString())) as {
    query?: { pages?: Record<string, { missing?: string; imageinfo?: Array<{ thumburl?: string; url?: string }> }> };
  };
  const page = Object.values(data.query?.pages ?? {})[0];
  if (page && !page.missing && page.imageinfo?.[0]) {
    return page.imageinfo[0].thumburl ?? page.imageinfo[0].url ?? null;
  }

  const search = new URL("https://commons.wikimedia.org/w/api.php");
  search.searchParams.set("action", "query");
  search.searchParams.set("list", "search");
  search.searchParams.set("srsearch", filename.replace(/\.jpg$/i, ""));
  search.searchParams.set("srnamespace", "6");
  search.searchParams.set("srlimit", "5");
  search.searchParams.set("format", "json");
  const found = (await wikiJson(search.toString())) as {
    query?: { search?: Array<{ title: string }> };
  };
  const match = found.query?.search?.[0]?.title;
  if (!match) return null;

  const fallback = new URL("https://commons.wikimedia.org/w/api.php");
  fallback.searchParams.set("action", "query");
  fallback.searchParams.set("titles", match);
  fallback.searchParams.set("prop", "imageinfo");
  fallback.searchParams.set("iiprop", "url");
  fallback.searchParams.set("iiurlwidth", "1600");
  fallback.searchParams.set("format", "json");
  const again = (await wikiJson(fallback.toString())) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }> };
  };
  const info = Object.values(again.query?.pages ?? {})[0]?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function download(url: string, dest: string) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
}

async function seed() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");

  const pool = mysql.createPool({ uri: url });
  const db = drizzle(pool);

  try {
    const remaining = new Set(
      (process.env.ONLY_CARS ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    );
    const brandOrder = 10;
    for (const [index, car] of CARS.entries()) {
      if (remaining.size > 0 && !remaining.has(car.id)) continue;
      await db
        .insert(brands)
        .values({
          id: car.brand.id,
          name: car.brand.name,
          slug: car.brand.slug,
          isActive: true,
          sortOrder: brandOrder + index,
        })
        .onDuplicateKeyUpdate({
          set: { name: car.brand.name, slug: car.brand.slug, isActive: true },
        });

      await db
        .insert(vehicleModels)
        .values({
          id: car.model.id,
          brandId: car.brand.id,
          name: car.model.name,
          slug: car.model.slug,
          isActive: true,
          sortOrder: index,
        })
        .onDuplicateKeyUpdate({
          set: {
            brandId: car.brand.id,
            name: car.model.name,
            slug: car.model.slug,
            isActive: true,
          },
        });

      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, car.categoryId));
      if (!category) {
        throw new Error(`Missing category ${car.categoryId}. Run npm run db:seed first.`);
      }

      const dir = resolve(process.cwd(), "public/uploads/vehicles", car.id);
      await mkdir(dir, { recursive: true });

      const saved: Array<{ id: string; url: string; alt: string }> = [];
      for (const [imageIndex, file] of car.files.entries()) {
        await wait(1500);
        try {
          const remote = await resolveFileUrl(file);
          if (!remote) {
            console.warn(`No Wikimedia file for ${car.name}: ${file}`);
            continue;
          }
          const filename = `${String(imageIndex + 1).padStart(2, "0")}.jpg`;
          await download(remote, resolve(dir, filename));
          saved.push({
            id: `img-${car.id}-${imageIndex + 1}`,
            url: `/uploads/vehicles/${car.id}/${filename}`,
            alt: `${car.brand.name} ${car.name}, view ${imageIndex + 1}`,
          });
        } catch (error) {
          console.warn(
            `Skipped ${car.name} image ${file}: ${error instanceof Error ? error.message : error}`,
          );
        }
      }

      if (saved.length === 0) {
        throw new Error(`No images downloaded for ${car.brand.name} ${car.name}.`);
      }

      await db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, car.id));

      await db
        .insert(vehicles)
        .values({
          id: car.id,
          slug: car.slug,
          brandId: car.brand.id,
          modelId: car.model.id,
          categoryId: car.categoryId,
          title: car.name,
          year: car.year,
          price: car.price,
          currency: "INR",
          mileage: car.mileageKm ?? null,
          fuelType: car.fuelType,
          transmission: car.transmission,
          condition: car.condition,
          availability: car.availability,
          description: car.description,
          location: car.location,
          isFeatured: car.isFeatured,
          hasGallery: saved.length > 1,
          has360View: false,
          has3DExperience: false,
          primaryImage: saved[0].url,
          model3dUrl: null,
        })
        .onDuplicateKeyUpdate({
          set: {
            slug: car.slug,
            brandId: car.brand.id,
            modelId: car.model.id,
            categoryId: car.categoryId,
            title: car.name,
            year: car.year,
            price: car.price,
            mileage: car.mileageKm ?? null,
            fuelType: car.fuelType,
            availability: car.availability,
            description: car.description,
            location: car.location,
            isFeatured: car.isFeatured,
            hasGallery: saved.length > 1,
            primaryImage: saved[0].url,
          },
        });

      for (const [imageIndex, image] of saved.entries()) {
        await db
          .insert(vehicleImages)
          .values({
            id: image.id,
            vehicleId: car.id,
            url: image.url,
            alt: image.alt,
            sortOrder: imageIndex,
            isPrimary: imageIndex === 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              url: image.url,
              alt: image.alt,
              sortOrder: imageIndex,
              isPrimary: imageIndex === 0,
            },
          });
      }

      console.log(`Added ${car.brand.name} ${car.name} (${saved.length} photos)`);
    }
  } finally {
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
