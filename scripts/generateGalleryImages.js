#!/usr/bin/env node
/**
 * generateGalleryImages.js
 *
 * Reads data/galleryData.json (the hand-edited source of truth), generates
 * .webp thumbnails and display-size images for each artwork, and validates
 * that every referenced image file exists on disk.
 *
 * Does NOT modify galleryData.json — that file is yours to edit.
 *
 * Output structure per event folder:
 *   gallery-arts/7th-Arts-Olympiad/thumbs/anwita-k.webp
 *   gallery-arts/7th-Arts-Olympiad/display/anwita-k.webp
 *
 * Usage:
 *   node scripts/generateGalleryImages.js [galleryDir] [dataDir]
 *
 * Defaults (relative to repo root):
 *   galleryDir = ./frontend/public/gallery-arts
 *   dataDir    = ./frontend/public/data
 *
 * Requires: sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/** Mirrors eventToSlug() in galleryProcessing.tsx — keep in sync. */
function eventToSlug(event) {
  return event.replace(/\s+/g, '-');
}
const THUMB_WIDTH = 350;
const THUMB_QUALITY = 60;
const DISPLAY_MAX = 800;
const DISPLAY_QUALITY = 82;
const FEATURE_MAX = 1920;
const FEATURE_QUALITY = 82;

async function generateImage(srcPath, destPath, opts) {
  if (fs.existsSync(destPath)) return false; // already exists
  await sharp(srcPath)
    .resize(opts.resize)
    .webp({ quality: opts.quality })
    .toFile(destPath);
  return true; // generated
}

async function run() {
  const [,, galleryDirArg, dataDirArg] = process.argv;
  const galleryDir = galleryDirArg ?? './frontend/public/gallery-arts';
  const dataDir = dataDirArg ?? './frontend/public/data';

  const jsonPath = path.join(dataDir, 'galleryData.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`galleryData.json not found: ${jsonPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(galleryDir)) {
    console.error(`Gallery directory not found: ${galleryDir}`);
    process.exit(1);
  }

  const artworks = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${artworks.length} artworks from ${jsonPath}\n`);

  let thumbsGenerated = 0;
  let thumbsSkipped = 0;
  let displayGenerated = 0;
  let displaySkipped = 0;
  let featureGenerated = 0;
  let featureSkipped = 0;
  const errors = [];

  // Track which files the JSON references, per event folder
  const referencedFiles = new Map(); // event -> Set<filename>

  for (const artwork of artworks) {
    const { file, event } = artwork;
    if (!file || !event) {
      errors.push(`Entry missing "file" or "event": ${JSON.stringify(artwork)}`);
      continue;
    }

    const eventSlug = eventToSlug(event);

    // Track for orphan detection (keyed by slug, which is the actual folder name)
    if (!referencedFiles.has(eventSlug)) referencedFiles.set(eventSlug, new Set());
    referencedFiles.get(eventSlug).add(file);

    const srcPath = path.join(galleryDir, eventSlug, file);
    if (!fs.existsSync(srcPath)) {
      errors.push(`Image not found: ${srcPath}`);
      continue;
    }

    const base = file.replace(/\.[^.]+$/, '');
    const webpFilename = base + '.webp';

    // Ensure output dirs
    const thumbDir = path.join(galleryDir, eventSlug, 'thumbs');
    const displayDir = path.join(galleryDir, eventSlug, 'display');
    const featureDir = path.join(galleryDir, eventSlug, 'feature');
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
    if (!fs.existsSync(displayDir)) fs.mkdirSync(displayDir, { recursive: true });
    if (!fs.existsSync(featureDir)) fs.mkdirSync(featureDir, { recursive: true });

    // Thumbnail
    const thumbDest = path.join(thumbDir, webpFilename);
    const thumbCreated = await generateImage(srcPath, thumbDest, {
      resize: { width: THUMB_WIDTH, withoutEnlargement: true },
      quality: THUMB_QUALITY,
    });
    if (thumbCreated) {
      thumbsGenerated++;
      process.stdout.write(`  thumb:   ${event}/thumbs/${webpFilename}\n`);
    } else {
      thumbsSkipped++;
    }

    // Display
    const displayDest = path.join(displayDir, webpFilename);
    const displayCreated = await generateImage(srcPath, displayDest, {
      resize: { width: DISPLAY_MAX, height: DISPLAY_MAX, fit: 'inside', withoutEnlargement: true },
      quality: DISPLAY_QUALITY,
    });
    if (displayCreated) {
      displayGenerated++;
      process.stdout.write(`  display: ${event}/display/${webpFilename}\n`);
    } else {
      displaySkipped++;
    }

    const featureDest = path.join(featureDir, webpFilename);
    const featureCreated = await generateImage(srcPath, featureDest, {
      resize: { width: FEATURE_MAX, height: FEATURE_MAX, fit: 'inside', withoutEnlargement: true },
      quality: FEATURE_QUALITY,
    });
    if (featureCreated) {
      featureGenerated++;
      process.stdout.write(`  feature: ${event}/feature/${webpFilename}\n`);
    } else {
      featureSkipped++;
    }
  }

  // --- Orphan detection: images on disk not referenced in JSON ---
  const eventFolders = fs.readdirSync(galleryDir).filter((name) => {
    const full = path.join(galleryDir, name);
    return fs.statSync(full).isDirectory() && name !== 'thumbs' && name !== 'display' && name !== 'feature';
  });

  const orphans = [];
  for (const eventFolder of eventFolders) {
    const eventPath = path.join(galleryDir, eventFolder);
    const filesOnDisk = fs.readdirSync(eventPath).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    });

    const referenced = referencedFiles.get(eventFolder) || new Set();
    for (const f of filesOnDisk) {
      if (!referenced.has(f)) {
        orphans.push(`${eventFolder}/${f}`);
      }
    }
  }

  // --- Report ---
  console.log(`\nDone.`);
  console.log(`  ${artworks.length} artworks in JSON`);
  console.log(`  thumbnails: ${thumbsGenerated} generated, ${thumbsSkipped} skipped`);
  console.log(`  display:    ${displayGenerated} generated, ${displaySkipped} skipped`);
  console.log(`  feature:    ${featureGenerated} generated, ${featureSkipped} skipped`);

  if (orphans.length > 0) {
    console.log(`\n  WARNING: ${orphans.length} image(s) on disk not in galleryData.json:`);
    for (const o of orphans) {
      console.log(`    ${o}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n  ERRORS (${errors.length}):`);
    for (const e of errors) {
      console.log(`    ${e}`);
    }
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});