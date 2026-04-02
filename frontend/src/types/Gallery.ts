/**
 * Artwork data for the ICAF gallery.
 *
 * All metadata lives in data/galleryData.json, hand-edited.
 * The build script (generateGalleryData.js) reads this file,
 * generates thumbnails + display-size images, and validates
 * that every referenced image file exists on disk.
 *
 * Image files live in gallery-arts/{event-folder}/:
 *   gallery-arts/
 *     7th-Arts-Olympiad/
 *       anwita-k.jpg
 *       nicolas.jpg
 *       thumbs/              ← generated
 *       display/             ← generated
 *
 * Filename convention (human-readable slug, not parsed for data):
 *   {artist-slug}.jpg          — e.g. anwita-k.jpg
 *   {artist-slug}-2.jpg        — duplicate from same artist
 *   anon-001.jpg               — anonymous work
 *
 * Event folder names use kebab-case: 7th-Arts-Olympiad, etc.
 */

export type TArtwork = {
  /** Image filename including extension, e.g. "anwita-k.jpg" */
  file: string;
  /** Event folder name, e.g. "7th-Arts-Olympiad" */
  event: string;
  /** Artist first name(s). Omit or leave empty for anonymous. */
  artists?: string[];
  /** Last initial of the primary artist, e.g. "K" */
  lastInitial?: string;
  /** Title of the artwork; shown in modal/slideshow, not on gallery cards */
  title?: string;
  /** Artist's age at time of creation */
  age?: number;
  /** Country name; must match a value in filterData.ts */
  country?: string;
  /** Sub-national region (state, province, city); display-only */
  region?: string;
  /** Free-text description shown in modal/slideshow */
  description?: string;
};

// ---------------------------------------------------------------------------
// Derived fields (computed at runtime, not stored in JSON)
// ---------------------------------------------------------------------------

/** Artwork with all URL fields resolved. Returned by the gallery loader. */
export type TResolvedArtwork = TArtwork & {
  /** Unique id: "{event}/{file}" */
  id: string;
  /** Full-size original: /gallery-arts/{event}/{file} */
  url: string;
  /** 350px-wide thumbnail: /gallery-arts/{event}/thumbs/{base}.webp */
  thumbUrl: string;
  /** 800px-max display image: /gallery-arts/{event}/display/{base}.webp */
  displayUrl: string;
  /** Alt text for accessibility */
  alt: string;
};

export interface IGalleryContext {
  artworks: TArtwork[];
}
