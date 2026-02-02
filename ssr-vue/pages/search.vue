<template>
  <div class="search-page">
    <h1>Search Results Page</h1>
    
    <!-- Search Form -->
    <form @submit.prevent="handleSearch">
      <input
        v-model="searchInput"
        type="text"
        placeholder="Search..."
        class="search-input"
      />
      <button type="submit">Search</button>
    </form>
    
    <!-- Sort Dropdown -->
    <div class="sort-controls">
      <label for="sort">Sort by:</label>
      <select id="sort" :value="currentSort" @change="handleSortChange">
        <option value="relevance">Relevance</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
    
    <!-- Results -->
    <div v-if="pending" class="loading">Loading...</div>
    <div v-else-if="error" class="error">Error loading results</div>
    <div v-else-if="data">
      <p v-if="data.total > 0" class="results-info">
        Found {{ data.total }} result{{ data.total !== 1 ? 's' : '' }}
      </p>
      
      <div v-if="data.results.length > 0">
        <ul class="results-list">
          <li v-for="item in data.results" :key="item.id" class="result-item">
            <h3>{{ item.title }}</h3>
            <p class="price">${{ item.price.toLocaleString() }}</p>
            <p>{{ item.description }}</p>
          </li>
        </ul>
        
        <!-- Pagination -->
        <div class="pagination">
          <NuxtLink
            v-if="data.hasPrev"
            :to="getPaginationUrl(data.state.page - 1)"
            class="pagination-link"
          >
            ← Previous
          </NuxtLink>
          <span v-else class="pagination-link disabled">← Previous</span>
          
          <span class="page-info">Page {{ data.state.page }}</span>
          
          <NuxtLink
            v-if="data.hasNext"
            :to="getPaginationUrl(data.state.page + 1)"
            class="pagination-link"
          >
            Next →
          </NuxtLink>
          <span v-else class="pagination-link disabled">Next →</span>
        </div>
      </div>
      
      <p v-else class="no-results">No results found. Try a different search.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// Parse and normalize query params
const currentQuery = computed(() => String(route.query.q || ''));
const currentPage = computed(() => {
  const page = Number(route.query.page) || 1;
  return Math.max(1, page);
});
const currentSort = computed(() => {
  const sort = String(route.query.sort || 'relevance');
  return ['relevance', 'price_asc', 'price_desc'].includes(sort) 
    ? sort 
    : 'relevance';
});

// Local state for search input
const searchInput = ref(currentQuery.value);

// Watch query changes to update search input
watch(currentQuery, (newQuery) => {
  searchInput.value = newQuery;
});

// SSR-aware data fetching
const { data, pending, error, refresh } = await useAsyncData(
  'search-results',
  () => $fetch('http://localhost:3000/api/search', {
    query: {
      q: currentQuery.value,
      page: currentPage.value,
      sort: currentSort.value,
    },
  }),
  {
    watch: [currentQuery, currentPage, currentSort],
  }
);

// Set page title
useHead({
  title: computed(() => {
    const q = currentQuery.value;
    const page = currentPage.value;
    if (q) {
      return `Search: "${q}" - Page ${page}`;
    }
    return `Search - Page ${page}`;
  }),
});

// Handle search form submission
function handleSearch() {
  router.push({
    path: '/search',
    query: {
      q: searchInput.value,
      sort: currentSort.value,
      page: 1, // Reset to page 1 on new search
    },
  });
}

// Handle sort change
function handleSortChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  router.push({
    path: '/search',
    query: {
      q: currentQuery.value,
      sort: target.value,
      page: 1, // Reset to page 1 on sort change
    },
  });
}

// Generate pagination URL
function getPaginationUrl(page: number) {
  return {
    path: '/search',
    query: {
      q: currentQuery.value,
      sort: currentSort.value,
      page,
    },
  };
}
</script>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  margin-bottom: 20px;
}

form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  font-size: 14px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0052a3;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

select {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.loading,
.error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #cc0000;
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #999;
}

.results-info {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.result-item {
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
}

.result-item h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #0066cc;
}

.result-item p {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.price {
  font-weight: bold;
  color: #009900;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.pagination-link {
  padding: 8px 16px;
  background: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-link:hover {
  background: #0052a3;
}

.pagination-link.disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>
