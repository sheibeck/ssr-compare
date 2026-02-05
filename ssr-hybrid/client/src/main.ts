import { createApp } from 'vue';
import SearchFilters from './islands/SearchFilters.vue';
import SearchResults from './islands/SearchResults.vue';

// Vue Islands - Mount Vue components only where needed
function mountIsland(selector: string, component: any, props: any = {}) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const app = createApp(component, {
      ...props,
      ...JSON.parse(el.getAttribute('data-props') || '{}'),
    });
    app.mount(el);
  });
}

// Initialize islands after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Mount search filters island
  mountIsland('[data-island="search-filters"]', SearchFilters);
  
  // Mount search results island
  mountIsland('[data-island="search-results"]', SearchResults);
});

// Export for global access if needed
export { mountIsland };

