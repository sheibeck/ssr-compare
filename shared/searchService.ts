import { MOCK_PRODUCTS, RESULTS_PER_PAGE } from './mockData.js';
import { SearchResponse, SearchState } from './types.js';

// Shared search service logic - used by both implementations
// In a real app, this would call an API, database, or search engine (Elasticsearch, Algolia, etc.)

export async function search(state: SearchState): Promise<SearchResponse> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Filter by query
  let filtered = MOCK_PRODUCTS;
  if (state.q) {
    const query = state.q.toLowerCase();
    filtered = MOCK_PRODUCTS.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }
  
  // Sort
  const sorted = [...filtered];
  if (state.sort === 'price_asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (state.sort === 'price_desc') {
    sorted.sort((a, b) => b.price - a.price);
  }
  // relevance = default order (no sorting needed)
  
  // Paginate
  const start = (state.page - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const results = sorted.slice(start, end);
  
  return {
    results,
    total: sorted.length,
    hasNext: end < sorted.length,
    hasPrev: state.page > 1,
  };
}
