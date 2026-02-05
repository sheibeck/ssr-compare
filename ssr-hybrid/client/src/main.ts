import { App, createApp } from 'vue';
import SearchFilters from './islands/SearchFilters.vue';
import SearchResults from './islands/SearchResults.vue';

// Island registry for re-hydration
const islandRegistry: Map<string, any> = new Map([
  ['search-filters', SearchFilters],
  ['search-results', SearchResults],
]);

// Store active Vue instances for cleanup during re-hydration
const activeInstances: Map<Element, App> = new Map();

/**
 * Mount a Vue island with SSR hydration support
 * Server sends HTML, we hydrate it with Vue for interactivity
 */
function mountIsland(selector: string, component: any) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((el) => {
    // Unmount existing instance if re-hydrating
    if (activeInstances.has(el)) {
      activeInstances.get(el)?.unmount();
      activeInstances.delete(el);
    }
    
    // Read props from server-rendered data attribute
    const propsData = JSON.parse(el.getAttribute('data-props') || '{}');
    
    // Create and mount Vue app
    const app = createApp(component, propsData);
    app.mount(el);
    
    // Track instance for cleanup
    activeInstances.set(el, app);
  });
}

/**
 * Re-hydrate an island after receiving new server-rendered HTML
 * This maintains SSR benefits while keeping Vue reactivity
 */
function rehydrateIsland(container: Element, islandName: string) {
  const island = container.querySelector(`[data-island="${islandName}"]`);
  if (!island) return;
  
  const component = islandRegistry.get(islandName);
  if (!component) {
    console.warn(`No component registered for island: ${islandName}`);
    return;
  }
  
  mountIsland(`[data-island="${islandName}"]`, component);
}

// Initialize all islands after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Auto-mount all registered islands found in the DOM
  islandRegistry.forEach((component, islandName) => {
    mountIsland(`[data-island="${islandName}"]`, component);
  });
});

// Export for use in island components
export { islandRegistry, mountIsland, rehydrateIsland };

