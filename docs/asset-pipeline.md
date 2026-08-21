# Production asset pipeline

This document is the offline optimization plan for the hero vehicle. It does **not** change the live website.

**Do not modify** `public/models/car.glb` until a reviewed production asset is ready. Serve the current file as `/models/car.glb`.

Do not install Draco, Meshopt, KTX2, or glTF-Transform into the Next.js app until a later performance phase explicitly adopts them.

## Current source asset

Inspected locally from `public/models/car.glb` (unchanged):

| Metric | Value |
| --- | --- |
| File size | 17,674,232 bytes (~16.9 MB) |
| Meshes | 24 |
| Primitives | 48 |
| Unique triangles | ~566,367 |
| Materials | 16 |
| Textures | 4 |
| Nodes | 98 |
| Root node | `320i` (Blender glTF 2.0) |
| Authored size | ~5.57 × 2.15 × 1.67 |
| Extensions | `KHR_materials_emissive_strength`, `KHR_materials_specular`, `KHR_materials_ior` (none required) |

The HUD treats this as a generic **VELOCITY CONCEPT** presentation. Root name `320i` is not enough verified product metadata to publish horsepower or acceleration.

## What actually costs performance

Interior geometry is **not** the main problem. Approximate unique-triangle cost:

| Region | Why it matters |
| --- | --- |
| Tires (`Mesh.001` / `Mesh.002`, shared index accessor ~659k indices) | Dominant. One tire mesh is ~220k triangles. Four wheel nodes instance that density. |
| Body (`body l`) | ~30k triangles. Keep. |
| Doors, fenders, chassis, lights | Needed for exterior silhouette. Keep. |
| Interior + leather door cards | ~6–15k triangles. Optional later if cabin is never shown. |
| Wheels (`jant`) + brakes (`bp_rf` / `bp_rb`) | Keep. Important in 3/4 shots. |
| Logos / badge text | Small. Keep. |

Hidden interior deletion would be a small win. Tire decimation is the large win.

`Mesh.001` and `Mesh.002` share the same index accessor. They should become **one** mesh with four instances (or four nodes referencing one mesh) before shipping.

## Production targets

Keep visual quality of the painted body, glass, wheels, and overall silhouette.

| Target | Goal |
| --- | --- |
| File size | **Under 10 MB**, prefer **4–8 MB** after Draco or Meshopt |
| Unique triangles | **150k–250k** if tires are rebuilt; do not drop below ~120k if body edges start to break |
| Tire unique triangles | **8k–20k per tire mesh**, instanced four times |
| Draw calls | Prefer one geometry per repeated part (wheels, tires, calipers) |
| Materials | Keep authored paint / glass / rubber split. Do not collapse to one material |
| Textures | Keep the four maps. Compress later with KTX2 only if the runtime loader is added |
| Exterior | Preserve body, doors, glass, lights, wheels, brakes |
| Interior | Safe to strip only if the camera never looks through open windows at cabin detail |

Do not decimate the body shell aggressively. Most of the 566k triangles are tires, not body.

## Recommended offline workflow

Run these **outside** the website install. Use `npx` so nothing is added to `package.json`.

### 1. Inspect

```bash
npx @gltf-transform/cli inspect public/models/car.glb
```

Confirm mesh names, triangle counts, and texture sizes before changing anything.

### 2. Work on a copy

```bash
copy public\models\car.glb public\models\car.production.glb
```

Never overwrite `car.glb` until the production file is reviewed in the showroom.

### 3. Blender pass (preferred for tires)

1. Open the copy in Blender.
2. Join or instance `Mesh.001` / `Mesh.002` so all four tires share one mesh.
3. Decimate **only** the tire mesh (target ~10k–18k triangles). Keep sidewall silhouette.
4. Optional: hide or delete interior meshes that are not visible from the locked camera.
5. Keep wheels, brake discs, calipers, glass, and body.
6. Export glTF Binary (`.glb`) with:
   - `+Y Up`
   - no extra lights/cameras
   - original materials
   - Draco optional (or compress in the next step)

### 4. glTF-Transform pass

From the project root, against the **copy only**:

```bash
npx @gltf-transform/cli dedup public/models/car.production.glb public/models/car.production.glb
npx @gltf-transform/cli instance public/models/car.production.glb public/models/car.production.glb
npx @gltf-transform/cli prune public/models/car.production.glb public/models/car.production.glb
npx @gltf-transform/cli resample public/models/car.production.glb public/models/car.production.glb
```

Draco (smaller file, requires a Draco decoder in the app later):

```bash
npx @gltf-transform/cli draco public/models/car.production.glb public/models/car.production.glb
```

Meshopt (often easier to adopt than Draco in R3F):

```bash
npx @gltf-transform/cli meshopt public/models/car.production.glb public/models/car.production.glb
```

Do **not** enable either codec in the website until a later phase adds the matching loader (`DRACOLoader` / `MeshoptDecoder`).

### 5. Review in the showroom

Point `CAR_MODEL_PATH` at the copy only after visual review:

- paint reflections
- wheel/tire silhouette
- glass
- headlights / taillights
- no missing body panels

Then, if accepted, replace the runtime path. Keep the original `car.glb` as the authored source until that swap is intentional.

## Runtime rules for this project

- The live model path remains `/models/car.glb`.
- Normalization and material polish live in `src/features/showroom/lib/`. They must keep working on both the current file and a future optimized copy.
- Quality tiers, DPR caps, mobile simplification, and reduced-motion behavior stay in `src/features/showroom/config.ts`.
- Do not add post-processing, extra car models, or optimizer packages to the web app in this phase.
