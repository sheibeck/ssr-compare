// Client-side hydration and interactivity for ASP.NET Core Razor SSR
// Supports: Infinite scroll, AJAX search, client-side filtering

class SearchApp {
  constructor() {
    this.state = this.getBootState();
    this.isLoading = false;
    this.hasMoreResults = true;
    this.currentPage = this.state?.state?.page || 1;
    
    this.elements = {
      form: document.querySelector('[data-search-form]'),
      sortSelect: document.querySelector('[data-sort]'),
      resultsContainer: document.querySelector('[data-results]'),
      loadingIndicator: this.createLoadingIndicator(),
      sentinel: this.createSentinel(),
    };

    this.init();
  }

  // Parse the SSR state injected from the server
  getBootState() {
    const stateElement = document.getElementById('__STATE__');
    if (!stateElement) return null;
    try {
      return JSON.parse(stateElement.textContent);
    } catch (error) {
      console.error('Failed to parse boot state:', error);
      return null;
    }
  }

  init() {
    console.log('ASP.NET Core Razor SSR initialized', this.state);
    this.setupFormSubmission();
    this.setupSortChange();
    this.setupInfiniteScroll();
    this.setupPaginationInterception();
  }

  // Create loading indicator element
  createLoadingIndicator() {
    const existing = document.querySelector('[data-loading]');
    if (existing) return existing;

    const loader = document.createElement('div');
    loader.setAttribute('data-loading', '');
    loader.style.cssText = 'display: none; text-align: center; padding: 20px; color: #666;';
    loader.innerHTML = `
      <div style="display: inline-block;">
        <div style="border: 3px solid #f3f3f3; border-top: 3px solid #0066cc; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 10px;">Loading more results...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    return loader;
  }

  // Create intersection observer sentinel
  createSentinel() {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('data-sentinel', '');
    sentinel.style.cssText = 'height: 1px;';
    return sentinel;
  }

  // Intercept form submission for AJAX search
  setupFormSubmission() {
    if (!this.elements.form) return;

    this.elements.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(this.elements.form);
      const query = formData.get('q') || '';
      const sort = this.elements.sortSelect?.value || 'relevance';

      // Reset state for new search
      this.currentPage = 1;
      this.hasMoreResults = true;

      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      url.searchParams.set('sort', sort);
      url.searchParams.set('page', '1');
      window.history.pushState({}, '', url);

      // Fetch and replace results
      await this.loadResults(query, sort, 1, true);
    });
  }

  // Handle sort change with AJAX
  setupSortChange() {
    if (!this.elements.sortSelect) return;

    this.elements.sortSelect.addEventListener('change', async () => {
      const query = this.elements.form?.querySelector('input[name="q"]')?.value || '';
      const sort = this.elements.sortSelect.value;

      // Reset for new sort
      this.currentPage = 1;
      this.hasMoreResults = true;

      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('sort', sort);
      url.searchParams.set('page', '1');
      window.history.pushState({}, '', url);

      // Fetch and replace results
      await this.loadResults(query, sort, 1, true);
    });
  }

  // Setup infinite scroll with Intersection Observer
  setupInfiniteScroll() {
    if (!this.elements.resultsContainer) return;

    // Add sentinel and loading indicator to DOM
    this.elements.resultsContainer.after(this.elements.loadingIndicator);
    this.elements.resultsContainer.after(this.elements.sentinel);

    // Hide traditional pagination when JS is enabled
    const pagination = document.querySelector('.pagination');
    if (pagination) {
      pagination.style.display = 'none';
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isLoading && this.hasMoreResults) {
            this.loadNextPage();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(this.elements.sentinel);
  }

  // Intercept pagination links for smoother navigation
  setupPaginationInterception() {
    document.addEventListener('click', async (e) => {
      const link = e.target.closest('[data-page]');
      if (!link) return;

      e.preventDefault();
      const url = new URL(link.href);
      const page = parseInt(url.searchParams.get('page') || '1');
      const query = url.searchParams.get('q') || '';
      const sort = url.searchParams.get('sort') || 'relevance';

      window.history.pushState({}, '', url);
      await this.loadResults(query, sort, page, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Load next page for infinite scroll
  async loadNextPage() {
    const query = this.elements.form?.querySelector('input[name="q"]')?.value || '';
    const sort = this.elements.sortSelect?.value || 'relevance';
    
    this.currentPage += 1;
    await this.loadResults(query, sort, this.currentPage, false);
  }

  // Fetch results from API and update DOM
  async loadResults(query, sort, page, replace = false) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.elements.loadingIndicator.style.display = 'block';

    try {
      const url = new URL('/api/search', window.location.origin);
      url.searchParams.set('q', query);
      url.searchParams.set('sort', sort);
      url.searchParams.set('page', page.toString());

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch results');

      const data = await response.json();
      
      if (replace) {
        this.replaceResults(data);
      } else {
        this.appendResults(data);
      }

      this.hasMoreResults = data.hasNext;
      this.updateResultsInfo(data);

    } catch (error) {
      console.error('Error loading results:', error);
      this.showError('Failed to load results. Please try again.');
    } finally {
      this.isLoading = false;
      this.elements.loadingIndicator.style.display = 'none';
    }
  }

  // Replace all results (new search)
  replaceResults(data) {
    if (!this.elements.resultsContainer) return;

    if (data.results && data.results.length > 0) {
      this.elements.resultsContainer.innerHTML = data.results
        .map(result => this.createResultHTML(result))
        .join('');
    } else {
      this.elements.resultsContainer.innerHTML = 
        '<p class="no-results">No results found. Try a different search.</p>';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Append results (infinite scroll)
  appendResults(data) {
    if (!this.elements.resultsContainer || !data.results || data.results.length === 0) {
      this.hasMoreResults = false;
      return;
    }

    const fragment = document.createDocumentFragment();
    data.results.forEach(result => {
      const div = document.createElement('div');
      div.innerHTML = this.createResultHTML(result);
      fragment.appendChild(div.firstElementChild);
    });

    this.elements.resultsContainer.appendChild(fragment);
  }

  // Create HTML for a single result
  createResultHTML(result) {
    const title = this.escapeHtml(result.title);
    const description = this.escapeHtml(result.description);
    const price = result.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return `
      <div class="result-item">
        <h3>${title}</h3>
        <p class="price">${price}</p>
        <p>${description}</p>
      </div>
    `;
  }

  // Update results count info
  updateResultsInfo(data) {
    const infoElement = document.querySelector('.results-info');
    if (infoElement && data.total !== undefined) {
      const plural = data.total !== 1 ? 's' : '';
      infoElement.textContent = `Found ${data.total} result${plural}`;
      infoElement.style.display = data.total > 0 ? 'block' : 'none';
    }
  }

  // Show error message
  showError(message) {
    if (!this.elements.resultsContainer) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'padding: 20px; background: #fee; color: #c00; border-radius: 4px; margin: 20px 0;';
    errorDiv.textContent = message;
    
    this.elements.resultsContainer.before(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SearchApp();
  });
} else {
  new SearchApp();
}
