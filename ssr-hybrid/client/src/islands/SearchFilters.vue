<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  initialMake?: string;
  initialModel?: string;
  initialYear?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'filter-change', filters: any): void;
}>();

// Reactive state
const make = ref(props.initialMake || '');
const model = ref(props.initialModel || '');
const year = ref(props.initialYear || '');
const minPrice = ref(props.initialMinPrice || 0);
const maxPrice = ref(props.initialMaxPrice || 100000);

// Watch for changes and emit events
watch([make, model, year, minPrice, maxPrice], () => {
  const filters = {
    make: make.value,
    model: model.value,
    year: year.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
  };
  
  emit('filter-change', filters);
  
  // Update URL without page reload
  const url = new URL(window.location.href);
  if (make.value) url.searchParams.set('make', make.value);
  else url.searchParams.delete('make');
  
  if (model.value) url.searchParams.set('model', model.value);
  else url.searchParams.delete('model');
  
  if (year.value) url.searchParams.set('year', year.value);
  else url.searchParams.delete('year');
  
  if (minPrice.value) url.searchParams.set('minPrice', minPrice.value.toString());
  else url.searchParams.delete('minPrice');
  
  if (maxPrice.value !== 100000) url.searchParams.set('maxPrice', maxPrice.value.toString());
  else url.searchParams.delete('maxPrice');
  
  window.history.pushState({}, '', url.toString());
  
  // Trigger server-side update via fetch
  fetchResults(filters);
});

async function fetchResults(filters: any) {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    // Fetch server-rendered HTML (SSR benefit - already rendered, just send it)
    const response = await fetch(`/Search/Results?${params.toString()}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    
    if (response.ok) {
      const html = await response.text();
      const resultsContainer = document.querySelector('[data-island="search-results"]')?.parentElement;
      
      if (resultsContainer) {
        // Display server-rendered HTML immediately (fast!)
        resultsContainer.innerHTML = html;
        
        // Re-hydrate the island for Vue interactivity
        const { rehydrateIsland } = await import('../main');
        rehydrateIsland(resultsContainer, 'search-results');
      }
    }
  } catch (error) {
    console.error('Failed to fetch results:', error);
  }
}

function resetFilters() {
  make.value = '';
  model.value = '';
  year.value = '';
  minPrice.value = 0;
  maxPrice.value = 100000;
}
</script>

<template>
  <div class="search-filters">
    <h3>Filter Results</h3>
    
    <div class="filter-group">
      <label for="make">Make</label>
      <input 
        id="make" 
        v-model="make" 
        type="text" 
        placeholder="e.g., Toyota"
      />
    </div>
    
    <div class="filter-group">
      <label for="model">Model</label>
      <input 
        id="model" 
        v-model="model" 
        type="text" 
        placeholder="e.g., Camry"
      />
    </div>
    
    <div class="filter-group">
      <label for="year">Year</label>
      <input 
        id="year" 
        v-model="year" 
        type="text" 
        placeholder="e.g., 2024"
      />
    </div>
    
    <div class="filter-group">
      <label for="minPrice">Min Price</label>
      <input 
        id="minPrice" 
        v-model.number="minPrice" 
        type="number" 
        min="0"
      />
    </div>
    
    <div class="filter-group">
      <label for="maxPrice">Max Price</label>
      <input 
        id="maxPrice" 
        v-model.number="maxPrice" 
        type="number" 
        min="0"
      />
    </div>
    
    <button @click="resetFilters" class="reset-btn">Reset Filters</button>
  </div>
</template>

<style scoped>
.search-filters {
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.filter-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

.reset-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #45a049;
}
</style>
