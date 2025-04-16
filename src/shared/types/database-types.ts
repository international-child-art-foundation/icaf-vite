// ===== Domain (App-level) Types =====
export type UserId = string;
export type PaymentId = string;
export type ArtworkId = string;
export type Timestamp = string;

export interface User {
  user_id: UserId;
  f_name: string;
  l_name: string;
  birthdate: string;
  can_submit_art: boolean;
  created_at: Timestamp;
  has_active_submission: boolean;
  has_paid: boolean;
  pi_id: PaymentId;
  active_vote_id: ArtworkId | null;
  guardian: boolean;
}

export interface Art {
  user_id: UserId;
  season: string;
  age_of_artist: number;
  title: string;
  f_name: string;
  file_type: string;
  is_ai_gen: boolean;
  is_approved: boolean;
  location: string;
  model: string;
  prompt: string;
  category: string;
  votes: number;
  submitted_at: Timestamp;
}

export interface VArt {
  v_art_id: ArtworkId;
  season: string;
  user_id: UserId;
  age_of_artist: number;
  title: string;
  f_name: string;
  file_type: string;
  is_ai_gen: boolean;
  is_approved: boolean;
  location: string;
  model: string;
  prompt: string;
  category: string;
  votes: number;
  submitted_at: Timestamp;
}

export interface Votes {
  Total: number;
}

export type AllArtworkTypes = Art | VArt;
export type IGalleryContent = AllArtworkTypes[] | void;

// ===== Database Types (explicit PK/SK only) =====

export interface DBUser {
  PK: string; // maps to user_id
  f_name: string;
  l_name: string;
  birthdate: string;
  can_submit_art: boolean;
  created_at: Timestamp;
  has_active_submission: boolean;
  has_paid: boolean;
  pi_id: PaymentId;
  active_vote_id: ArtworkId | null;
  guardian: boolean;
}

export interface DBArt {
  PK: string; // maps to user_id
  SK: string; // season
  age_of_artist: number;
  title: string;
  f_name: string;
  file_type: string;
  is_ai_gen: boolean;
  is_approved: boolean;
  location: string;
  model: string;
  prompt: string;
  category: string;
  votes: number;
  submitted_at: Timestamp;
}

export interface DBVArt {
  PK: string; // maps to v_art_id
  SK: string; // season
  user_id: UserId;
  age_of_artist: number;
  title: string;
  f_name: string;
  file_type: string;
  is_ai_gen: boolean;
  is_approved: boolean;
  location: string;
  model: string;
  prompt: string;
  category: string;
  votes: number;
  submitted_at: Timestamp;
}
