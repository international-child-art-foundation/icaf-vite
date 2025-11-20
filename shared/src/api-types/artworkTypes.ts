/**
 * Artwork Submission Types
 * 
 * Defines types for artwork submission API
 * and related data structures.
 */

// Supported file types for artwork uploads
export const SUPPORTED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;
export type FileType = typeof SUPPORTED_FILE_TYPES[number];

// Submit artwork request data
export interface SubmitArtworkRequest {
    season: string;
    title: string;
    description?: string;
    file_type: FileType;
    is_ai_generated: boolean;
    ai_model?: string; // Required if is_ai_generated is true
    f_name: string;
    age: number;
    location: string;
    is_virtual: boolean;
}

// Submit artwork response data
export interface SubmitArtworkResponse {
    success: boolean;
    artwork_id: string;
    presigned_url: string;
    upload_expires_at: string;
    message: string;
    timestamp: number;
}

// Artwork entity data structure
export interface ArtworkEntity {
    art_id: string;
    user_id: string;
    season: string;
    title: string;
    description?: string;
    f_name: string;
    age: number;
    location: string;
    is_virtual: boolean;
    is_ai_gen: boolean;
    model?: string;
    file_type: FileType;
    is_approved: boolean;
    votes: number;
    timestamp: string;
    type: 'ART';
}

// Art pointer entity data structure (for user → artwork relationship)
export interface ArtPtrEntity {
    artwork_id: string;
    art_id: string;
    season: string;
    timestamp: string;
    type: 'ART_PTR';
}


// List Constituent Artworks types
export interface ListConstituentArtworksRequest {
    season?: string;
    limit?: number;
    last_key?: string;
}

export interface ConstituentArtworkItem {
    art_id: string;
    season: string;
    f_name: string;
    age: number;
    title: string;
    location: string;
    is_ai_gen: boolean;
    model?: string;
    is_approved: boolean;
    votes: number;
    file_type: FileType;
    timestamp: string;
}

export interface ListConstituentArtworksResponse {
    artworks: ConstituentArtworkItem[];
    has_more: boolean;
    last_key?: string;
}

// Validation helper functions
export function isValidFileType(fileType: string): fileType is FileType {
    return SUPPORTED_FILE_TYPES.includes(fileType as FileType);
}

export function validateSubmissionData(data: SubmitArtworkRequest): string[] {
    const errors: string[] = [];

    if (!data.season?.trim()) {
        errors.push('Season is required');
    }

    if (!data.title?.trim()) {
        errors.push('Title is required');
    }

    if (data.title && data.title.length > 100) {
        errors.push('Title must be 100 characters or less');
    }

    if (!isValidFileType(data.file_type)) {
        errors.push(`File type must be one of: ${SUPPORTED_FILE_TYPES.join(', ')}`);
    }

    if (data.is_ai_generated && !data.ai_model?.trim()) {
        errors.push('AI model is required when artwork is AI-generated');
    }

    if (!data.f_name?.trim()) {
        errors.push('Artist first name is required');
    }

    if (!Number.isInteger(data.age) || data.age < 1 || data.age > 150) {
        errors.push('Age must be a valid integer between 1 and 150');
    }

    if (!data.location?.trim()) {
        errors.push('Location is required');
    }

    if (typeof data.is_virtual !== 'boolean') {
        errors.push('is_virtual must be a boolean');
    }

    return errors;
}
