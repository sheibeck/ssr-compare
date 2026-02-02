import { SearchState, SortOption } from '../../../shared/types.js';

// Parse URL query params into SearchState
// In a real framework, this would be handled by the router
export function parseState(url: URL): SearchState {
  const params = url.searchParams;
  
  const q = params.get('q') || '';
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  
  let sort: SortOption = 'relevance';
  const sortParam = params.get('sort');
  if (sortParam === 'price_asc' || sortParam === 'price_desc' || sortParam === 'relevance') {
    sort = sortParam;
  }
  
  return { q, page, sort };
}

// Serialize SearchState to URL string with stable param order
// In a real framework, this would be part of the router
export function toUrl(state: SearchState): string {
  const params = new URLSearchParams();
  
  // Stable order: q, page, sort
  if (state.q) {
    params.set('q', state.q);
  }
  if (state.page > 1) {
    params.set('page', state.page.toString());
  }
  if (state.sort !== 'relevance') {
    params.set('sort', state.sort);
  }
  
  const queryString = params.toString();
  return `/custom/search${queryString ? '?' + queryString : ''}`;
}
