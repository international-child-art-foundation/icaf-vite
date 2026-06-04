/**
 * News Types
 *
 * Types for NEWS entities.
 *
 * DynamoDB NEWS entity key structure:
 *   PK = 'NEWS'
 *   SK = '<news_id>'
 *
 * All news items live under a single partition. List queries return all of them
 * (dataset is small — a few dozen items). Clients sort by ts descending.
 */

export type NewsKind = 'article' | 'audio';

export interface NewsEntity {
    // ── Required ───────────────────────────────────────────────────────────
    news_id: string;    // UUID (also SK)
    source: string;     // e.g. 'National Law Review'
    ts: number;  // Unix ts (seconds) — used for client-side sorting
    type: 'NEWS';

    // ── Optional ───────────────────────────────────────────────────────────
    kind?: NewsKind;    // 'audio' for podcast episodes; absent = standard article
    place?: string;     // e.g. 'Washington, D.C.'
    body?: string;      // Short description / teaser text
    date?: string;      // Human-readable display date, e.g. 'March 25, 2026'
    src?: string;       // Internal media asset path (audio)
    link?: string;      // External URL (articles)
}

export interface CreateNewsRequest {
    source: string;
    ts: number;  // Unix seconds — caller supplies so dates can be backdated
    kind?: NewsKind;
    place?: string;
    body?: string;
    date?: string;
    src?: string;
    link?: string;
}

export type BulkCreateNewsItem = Omit<CreateNewsRequest, 'ts'> & {
    ts?: number;
};

export type BulkCreateNewsRequest = BulkCreateNewsItem[] | {
    news: BulkCreateNewsItem[];
};

export interface UpdateNewsRequest {
    source?: string;
    ts?: number;
    kind?: NewsKind;
    place?: string;
    body?: string;
    date?: string;
    src?: string;
    link?: string;
}

// Shape used in list responses — identical to entity, exposed fully
export type NewsListItem = Omit<NewsEntity, 'type'>;

export interface ListNewsResponse {
    news: NewsListItem[];
    has_more?: boolean;
    last_key?: string;
}

export interface NewsMutationResponse {
    success: true;
    news_id: string;
}

export interface BulkCreateNewsResponse {
    success: true;
    count: number;
    news_ids: string[];
}
