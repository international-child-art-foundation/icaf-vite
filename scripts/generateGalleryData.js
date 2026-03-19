#!/usr/bin/env node
/**
 * generateGalleryData.js
 *
 * Walks a gallery folder, generates .webp thumbnails for each image using sharp,
 * parses filenames according to the ICAF artwork naming convention, and writes
 * galleryData.json to the data folder.
 *
 * Thumbnails are written to a thumbs/ subfolder inside each event folder:
 *   gallery-arts/7th-Arts-Olympiad/thumbs/n-Anwita_a-10_c-USA.webp
 *
 * Usage:
 *   node scripts/generateGalleryData.js <galleryDir> <dataDir>
 *
 * Example:
 *   node scripts/generateGalleryData.js /mnt/host/m/icaf-vite-files/gallery \
 *                                       /mnt/host/m/icaf-vite-files/data
 *
 * Requires: sharp (pnpm install at repo root)
 *
 * Filename format (segments separated by _):
 *   Each segment: {key}-{value}  — key is one character, value follows after the first "-"
 *   "+" in a value = space (e.g. United+Kingdom → "United Kingdom")
 *   "-" in a value = literal hyphen (e.g. Mary-Jane stays "Mary-Jane")
 *
 *   Keys:
 *     n  — artist first name (repeat 0–2× per artwork)
 *     a  — age (integer)
 *     c  — country (filterable)
 *     l  — location detail (display-only, shown before country)
 *     d  — duplicate index (2, 3, …); ignored in output
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const THUMB_WIDTH = 350;
const THUMB_QUALITY = 60;
const DISPLAY_MAX = 800;
const DISPLAY_QUALITY = 82;

function parseValue(raw) {
  return raw.replace(/\+/g, ' ');
}

function formatEventName(folder) {
  return folder.replace(/-/g, ' ');
}

function parseFilename(filename, eventFolder) {
  const ext = path.extname(filename).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return null;

  const base = path.basename(filename, ext);
  const segments = base.split('_');

  const artists = [];
  let age;
  let country;
  let locationDetail;

  for (const seg of segments) {
    if (seg.length < 2 || seg[1] !== '-') continue;
    const key = seg[0];
    const value = parseValue(seg.slice(2));
    switch (key) {
      case 'n': artists.push(value); break;
      case 'a': { const n = parseInt(value, 10); if (!isNaN(n)) age = n; break; }
      case 'c': country = value; break;
      case 'l': locationDetail = value; break;
      case 'd': break;
    }
  }

  const webpFilename = base + '.webp';
  const id = `${eventFolder}/${filename}`;
  const url = `/gallery-arts/${eventFolder}/${filename}`;
  const thumbUrl = `/gallery-arts/${eventFolder}/thumbs/${webpFilename}`;
  const displayUrl = `/gallery-arts/${eventFolder}/display/${webpFilename}`;
  const alt = artists.join(' & ') || country || 'Artwork';

  const artwork = {
    id,
    artists,
    url,
    thumbUrl,
    displayUrl,
    alt,
    event: formatEventName(eventFolder),
  };
  if (age !== undefined) artwork.age = age;
  if (country) artwork.country = country;
  if (locationDetail) artwork.locationDetail = locationDetail;

  return { artwork, webpFilename };
}

async function generateThumb(srcPath, thumbDir, webpFilename) {
  const destPath = path.join(thumbDir, webpFilename);
  if (fs.existsSync(destPath)) return; // skip if already generated
  await sharp(srcPath)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toFile(destPath);
}

async function generateDisplay(srcPath, displayDir, webpFilename) {
  const destPath = path.join(displayDir, webpFilename);
  if (fs.existsSync(destPath)) return; // skip if already generated
  await sharp(srcPath)
    .resize({ width: DISPLAY_MAX, height: DISPLAY_MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: DISPLAY_QUALITY })
    .toFile(destPath);
}

async function run() {
  const [,, galleryDir, dataDir] = process.argv;

  if (!galleryDir || !dataDir) {
    console.error('Usage: node scripts/generateGalleryData.js <galleryDir> <dataDir>');
    process.exit(1);
  }

  if (!fs.existsSync(galleryDir)) {
    console.error(`Gallery directory not found: ${galleryDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  const artworks = [];
  let thumbsGenerated = 0;
  let thumbsSkipped = 0;
  let displayGenerated = 0;
  let displaySkipped = 0;

  const eventFolders = fs.readdirSync(galleryDir).filter((name) => {
    const full = path.join(galleryDir, name);
    return fs.statSync(full).isDirectory() && name !== 'thumbs' && name !== 'display';
  });

  for (const eventFolder of eventFolders) {
    const eventPath = path.join(galleryDir, eventFolder);
    const thumbDir = path.join(eventPath, 'thumbs');
    const displayDir = path.join(eventPath, 'display');
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir);
    if (!fs.existsSync(displayDir)) fs.mkdirSync(displayDir);

    const files = fs.readdirSync(eventPath)
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return IMAGE_EXTENSIONS.has(ext);
      })
      .sort();

    for (const file of files) {
      const parsed = parseFilename(file, eventFolder);
      if (!parsed) continue;

      const { artwork, webpFilename } = parsed;
      artworks.push(artwork);

      const srcPath = path.join(eventPath, file);

      // thumbnail
      const thumbDest = path.join(thumbDir, webpFilename);
      if (fs.existsSync(thumbDest)) {
        thumbsSkipped++;
      } else {
        await generateThumb(srcPath, thumbDir, webpFilename);
        thumbsGenerated++;
        process.stdout.write(`  thumb:   ${eventFolder}/thumbs/${webpFilename}\n`);
      }

      // display (800px max)
      const displayDest = path.join(displayDir, webpFilename);
      if (fs.existsSync(displayDest)) {
        displaySkipped++;
      } else {
        await generateDisplay(srcPath, displayDir, webpFilename);
        displayGenerated++;
        process.stdout.write(`  display: ${eventFolder}/display/${webpFilename}\n`);
      }
    }
  }

  const outPath = path.join(dataDir, 'galleryData.json');
  fs.writeFileSync(outPath, JSON.stringify(artworks, null, 2) + '\n');

  console.log(`\nDone.`);
  console.log(`  ${artworks.length} artworks written to ${outPath}`);
  console.log(`  thumbnails: ${thumbsGenerated} generated, ${thumbsSkipped} skipped`);
  console.log(`  display:    ${displayGenerated} generated, ${displaySkipped} skipped`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
