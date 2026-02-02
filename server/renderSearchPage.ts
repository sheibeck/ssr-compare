//NOTE: This file is only ever used by custom SSR implementation (ssr-custom). 
// It is not used by the framework-based implementations (ssr-vue, ssr-react).

import { BootState, SearchResponse, SearchState } from '../shared/types.js';
import { toUrl } from '../ssr-custom/src/shared/urlState.js';

// Escape HTML to prevent XSS
// In a real framework, this would be built-in (e.g., React's JSX escaping, Vue's {{ }} escaping)
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Render the search page as HTML
// In a real framework, this would be a component template (Vue SFC, React JSX, Svelte, etc.)
export function renderSearchPage(
  data: SearchResponse,
  state: SearchState
): { head: string; body: string; bootState: BootState } {
  
  const bootState: BootState = { state, data };
  
  // Build sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];
  
  const sortOptionsHtml = sortOptions
    .map(opt => {
      const selected = opt.value === state.sort ? ' selected' : '';
      return `<option value="${escapeHtml(opt.value)}"${selected}>${escapeHtml(opt.label)}</option>`;
    })
    .join('');
  
  // Build results list
  const resultsHtml = data.results.length > 0
    ? data.results.map(result => `
        <div class="result-item">
          <h3>${escapeHtml(result.title)}</h3>
          <p class="price">$${result.price.toLocaleString()}</p>
          <p>${escapeHtml(result.description)}</p>
        </div>
      `).join('')
    : '<p class="no-results">No results found. Try a different search.</p>';
  
  // Build pagination
  const prevUrl = data.hasPrev ? toUrl({ ...state, page: state.page - 1 }) : null;
  const nextUrl = data.hasNext ? toUrl({ ...state, page: state.page + 1 }) : null;
  
  const paginationHtml = `
    <div class="pagination">
      ${prevUrl 
        ? `<a data-page href="${escapeHtml(prevUrl)}" class="btn">← Previous</a>` 
        : '<span class="btn disabled">← Previous</span>'}
      <span class="page-info">Page ${state.page}</span>
      ${nextUrl 
        ? `<a data-page href="${escapeHtml(nextUrl)}" class="btn">Next →</a>` 
        : '<span class="btn disabled">Next →</span>'}
    </div>
  `;
  
  const head = `
    <title>Search Results${state.q ? ': ' + escapeHtml(state.q) : ''}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; padding: 20px; }
      .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      h1 { margin-bottom: 24px; color: #333; }
      .search-controls { display: flex; gap: 12px; margin-bottom: 24px; }
      .search-form { flex: 1; display: flex; gap: 12px; }
      .search-form input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
      .search-form button { padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
      .search-form button:hover { background: #0052a3; }
      .sort-control { display: flex; align-items: center; gap: 8px; }
      .sort-control label { font-size: 14px; color: #666; }
      .sort-control select { padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; cursor: pointer; }
      .results-info { margin-bottom: 16px; color: #666; font-size: 14px; }
      .result-item { padding: 16px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 12px; }
      .result-item h3 { color: #0066cc; margin-bottom: 8px; font-size: 18px; }
      .result-item .price { color: #16a34a; font-weight: 600; font-size: 16px; margin-bottom: 8px; }
      .result-item p { color: #666; line-height: 1.5; }
      .no-results { padding: 40px; text-align: center; color: #999; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e0e0e0; }
      .btn { padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; }
      .btn:hover { background: #0052a3; }
      .btn.disabled { background: #ccc; cursor: not-allowed; }
      .page-info { color: #666; font-size: 14px; }
    </style>
  `;
  
  const body = `
    <div class="container">
      <h1>Vehicle Search</h1>
      
      <div class="search-controls">
        <form data-search-form class="search-form">
          <input 
            type="text" 
            name="q" 
            placeholder="Search vehicles..." 
            value="${escapeHtml(state.q)}"
          />
          <button type="submit">Search</button>
        </form>
        
        <div class="sort-control">
          <label for="sort">Sort:</label>
          <select data-sort name="sort" id="sort">
            ${sortOptionsHtml}
          </select>
        </div>
      </div>
      
      ${data.total > 0 
        ? `<div class="results-info">Found ${data.total} result${data.total !== 1 ? 's' : ''}</div>` 
        : ''}
      
      <div class="results">
        ${resultsHtml}
      </div>
      
      ${data.total > 0 ? paginationHtml : ''}
    </div>
  `;
  
  return { head, body, bootState };
}
