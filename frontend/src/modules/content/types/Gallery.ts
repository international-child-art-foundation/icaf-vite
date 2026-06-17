/**
 * Artwork data for the ICAF gallery.
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
  /** Unique id: "{eventSlug}/{file}" */
  id: string;
  /** Folder-safe slug derived from event: spaces → hyphens, e.g. "7th-Arts-Olympiad" */
  eventSlug: string;
  /** Full-size original: /gallery-arts/{eventSlug}/{file} */
  url: string;
  /** 350px-wide thumbnail: /gallery-arts/{eventSlug}/thumbs/{base}.avif */
  thumbUrl: string;
  /** 800px-max display image: /gallery-arts/{eventSlug}/medium/{base}.avif */
  displayUrl: string;
  /** 1920px-max high-res image: /gallery-arts/{eventSlug}/original/{base}.avif */
  featureUrl: string;
  /** Alt text for accessibility */
  alt: string;
  /** API artwork id for remote artworks. */
  art_id?: string;
  /** Approved group id this artwork belongs to, when submitted through a group. */
  group_id?: string;
  /** Theme SK used by remote gallery filtering/display. */
  theme?: string;
  /** Display name of the classroom/group this artwork belongs to. */
  groupTitle?: string;
  /** Display name for the teacher/group submitter. */
  groupOwnerName?: string;
  /** Group type label, e.g. classroom. */
  groupType?: string;
  /** Country associated with the group submission. */
  groupCountry?: string;
  /** Region associated with the group submission. */
  groupRegion?: string;
  /** Number of kudos recorded for this artwork. */
  kudos_count?: number;
};

export interface IGalleryContext {
  artworks: TResolvedArtwork[];
  onArtworkKudos?: (artId: string, amount: number) => void;
  preserveOrder?: boolean;
}
