/**
 * Artwork data for the ICAF gallery.
 *
 * Filename format for AI-labeled files:
 *   {key}-{value} segments joined by underscores. Key is always one character.
 *   Use + for spaces within a value (e.g. United+Kingdom → "United Kingdom").
 *   Hyphens within a value are literal hyphens (e.g. Mary-Jane → "Mary-Jane").
 *
 * Keys:
 *   n  — first name of an artist; repeat for each artist (0–2);
 *         omit entirely for anonymous submissions
 *   a  — age (integer)
 *   c  — country; must match a name in filterData.ts; filterable
 *   l  — location detail; sub-national region (state, province, city); display-only
 *   d  — duplicate index (2, 3, …); used only when the same child submitted more than
 *         once in the same event; never shown in UI
 *
 * All fields are optional. Omit a key entirely rather than using a placeholder.
 * Recommended segment order: n (×0-2), a, c, l, d.
 *
 * Parsing rule: split filename (sans extension) on "_", then for each segment
 * the first character is the key, the second character is "-", the rest is the value
 * with "+" replaced by " ".
 * Display name: join all n-values with " & " (e.g. "Anwita & Nicolas").
 * Display location: when both l and c are present, show "{l}, {c}" (e.g. "California, USA").
 *
 * Examples:
 *   n-Anwita_a-10_c-USA_l-California.jpg          → name "Anwita", "California, USA"
 *   n-Nicolas_a-11_c-France.jpg                   → name "Nicolas", "France"
 *   n-Jamie_a-12_c-United+Kingdom.jpg             → name "Jamie", "United Kingdom"
 *   n-Mary-Jane_a-9_c-India_l-Tamil+Nadu.jpg      → name "Mary-Jane", "Tamil Nadu, India"
 *   n-Anwita_n-Nicolas_a-10_c-USA.jpg             → two artists: "Anwita & Nicolas"
 *   a-10_c-France.jpg                             → anonymous, age 10, country France
 *   n-Adam_a-10_c-USA_d-2.jpg                     → second submission from Adam
 *   c-Japan.jpg                                   → anonymous, country only
 *
 * Event folder names: 7th-Arts-Olympiad, 6th-Arts-Olympiad, etc.
 * URL pattern: /gallery/{event-folder}/{filename}
 */

export type Artwork = {
  id: string;
  artists: string[];
  age?: number;
  country?: string;
  locationDetail?: string;
  event: string;
  url: string;
  thumbUrl: string;
  displayUrl: string;
  alt: string;
};

