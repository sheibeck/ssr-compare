// Core types shared between client and server across all implementations

export type SortOption = 'relevance' | 'price_asc' | 'price_desc';

export interface SearchState {
  q: string;
  page: number;
  sort: SortOption;
}

export interface SearchResult {
  id: string;
  title: string;
  price: number;
  description: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// BootState is injected via <script id="__STATE__"> for client hydration
export interface BootState {
  state: SearchState;
  data: SearchResponse;
}
