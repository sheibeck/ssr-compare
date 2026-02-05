<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrl?: string;
}

interface Props {
  initialResults?: Vehicle[];
}

const props = defineProps<Props>();

const results = ref<Vehicle[]>(props.initialResults || []);
const loading = ref(false);

// Listen for custom events from parent
onMounted(() => {
  window.addEventListener('search-update', ((event: CustomEvent) => {
    results.value = event.detail.results;
  }) as EventListener);
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}
</script>

<template>
  <div class="search-results">
    <div v-if="results.length === 0" class="no-results">
      <p>No vehicles found matching your criteria.</p>
    </div>
    
    <div v-else class="results-grid">
      <div 
        v-for="vehicle in results" 
        :key="vehicle.id" 
        class="vehicle-card"
        :class="{ 'selected': isSelected(vehicle.id) }"
        @click="selectVehicle(vehicle.id)"
      >
        <div class="vehicle-image">
          <img 
            v-if="vehicle.imageUrl" 
            :src="vehicle.imageUrl" 
            :alt="`${vehicle.year} ${vehicle.make} ${vehicle.model}`"
          />
          <div v-else class="placeholder-image">No Image</div>
        </div>
        
        <div class="vehicle-info">
          <h4>{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</h4>
          <p class="price">{{ formatPrice(vehicle.price) }}</p>
          
          <!-- Client-side rich UX: expandable details -->
          <button class="view-details" @click.stop="selectVehicle(vehicle.id)">
            {{ isSelected(vehicle.id) ? 'Hide Details' : 'View Details' }}
          </button>
          
          <transition name="fade">
            <div v-if="isSelected(vehicle.id)" class="expanded-details">
              <p><strong>Make:</strong> {{ vehicle.make }}</p>
              <p><strong>Model:</strong> {{ vehicle.model }}</p>
              <p><strong>Year:</strong> {{ vehicle.year }}</p>
              <p><strong>Price:</strong> {{ formatPrice(vehicle.price) }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
    
    <div v-if="results.length > 0" class="results-count">
      Showing {{ results.length }} vehicle(s)
    </div>
  </div>
</template>

<style scoped>
.search-results {
  padding: 1rem 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.no-results {
  text-align: center;
  padding: 3rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.vehicle-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.vehicle-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vehicle-image {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  color: #999;
  font-size: 0.9rem;
}

.vehicle-info {
  padding: 1rem;
}

.vehicle-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4CAF50;
  margin: 0.5rem 0;
}

.view-details {
  width: 100%;
  padding: 0.75rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.view-details:hover {
  background: #1976D2;
}

.results-count {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-size: 0.95rem;
}

.vehicle-card.selected {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  border-color: #2196F3;
}

.expanded-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.expanded-details p {
  margin: 0.5rem 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
