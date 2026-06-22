/**
 * News Types
 *
 * Types for NEWS entities.
 *
 * DynamoDB NEWS entity key structure:
 *   PK = 'NEWS'
 *   SK = 'TS#<ts>#ID#<news_id>'
 *
 * All news items live under a single partition. List queries use the SK for
 * timestamp ordering.
 */

export type NewsKind = 'article' | 'audio';

export interface NewsEntity {
    // ── Required ───────────────────────────────────────────────────────────
    news_id: string;    // UUID
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
    ts?: number;  // Unix seconds — derived by the server when omitted
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

// Shape used in list responses. news_sk is the DynamoDB SK for admin actions.
export type NewsListItem = Omit<NewsEntity, 'type'> & {
    news_sk: string;
};

export interface ListNewsResponse {
    news: NewsListItem[];
    has_more?: boolean;
    last_key?: string;
}

export interface NewsMutationResponse {
    success: true;
    news_id: string;
    news_sk: string;
}

export interface BulkCreateNewsResponse {
    success: true;
    count: number;
    news_ids: string[];
}
