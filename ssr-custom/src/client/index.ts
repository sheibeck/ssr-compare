import { BootState } from '../../../shared/types.js';

// Read the SSR boot state from the inline JSON
// In a real framework, this would be handled automatically (e.g., Next.js __NEXT_DATA__)
function readBootState(): BootState | null {
  const script = document.getElementById('__STATE__');
  if (!script || !script.textContent) {
    return null;
  }
  
  try {
    return JSON.parse(script.textContent);
  } catch (e) {
    console.error('Failed to parse boot state:', e);
    return null;
  }
}

// Hydrate the page by attaching event listeners
// In a real framework, this would be automatic (React.hydrate, Vue.createSSRApp, etc.)
function hydrate() {
  // Attach search form submit handler
  const form = document.querySelector<HTMLFormElement>('[data-search-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const q = (formData.get('q') as string) || '';
      
      // Get current state and update query, reset to page 1
      const bootState = readBootState();
      const currentState = bootState?.state || { q: '', page: 1, sort: 'relevance' as const };
      
      // Build new URL
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('page', '1'); // Reset to page 1 on new search
      if (currentState.sort !== 'relevance') params.set('sort', currentState.sort);
      
      const url = `/search${params.toString() ? '?' + params.toString() : ''}`;
      navigate(url);
    });
  }
  
  // Attach sort dropdown handler
  const sortSelect = document.querySelector<HTMLSelectElement>('[data-sort]');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const bootState = readBootState();
      const currentState = bootState?.state || { q: '', page: 1, sort: 'relevance' as const };
      
      // Build new URL with updated sort, reset to page 1
      const params = new URLSearchParams();
      if (currentState.q) params.set('q', currentState.q);
      params.set('page', '1'); // Reset to page 1 on sort change
      const newSort = sortSelect.value;
      if (newSort !== 'relevance') params.set('sort', newSort);
      
      const url = `/search${params.toString() ? '?' + params.toString() : ''}`;
      navigate(url);
    });
  }
  
  // Attach pagination link handlers
  const pageLinks = document.querySelectorAll<HTMLAnchorElement>('[data-page]');
  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('href');
      if (url) {
        navigate(url);
      }
    });
  });
}

// Client-side navigation
// Fetches the new page HTML, swaps content, and updates history
// In a real framework, this would be handled by the router (Vue Router, React Router, etc.)
async function navigate(url: string, shouldPushState = true) {
  // Show loading state
  const container = document.querySelector('.container');
  if (container) {
    container.style.opacity = '0.6';
    container.style.pointerEvents = 'none';
  }
  
  try {
    // Fetch the new page HTML from the server
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract the new #app content
    const newApp = doc.querySelector('#app');
    const currentApp = document.querySelector('#app');
    if (newApp && currentApp) {
      currentApp.innerHTML = newApp.innerHTML;
    }
    
    // Extract and replace the __STATE__ script
    const newState = doc.querySelector('#__STATE__');
    const currentState = document.querySelector('#__STATE__');
    if (newState && currentState) {
      currentState.textContent = newState.textContent;
    }
    
    // Update browser history
    if (shouldPushState) {
      window.history.pushState(null, '', url);
    }
    
    // Re-hydrate with new content
    hydrate();
    
    // Remove loading state
    if (container) {
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  } catch (error) {
    console.error('Navigation failed:', error);
    
    // Remove loading state on error
    if (container) {
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
    }
    
    // Fallback to full page reload
    window.location.href = url;
  }
}

// Handle browser back/forward buttons
// In a real framework, this would be handled by the router
window.addEventListener('popstate', () => {
  const url = window.location.pathname + window.location.search;
  navigate(url, false); // Don't push state again
});

// Initial hydration on page load
// In a real framework, this would be called automatically
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrate);
} else {
  hydrate();
}
