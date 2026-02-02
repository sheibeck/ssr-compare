import { SearchResult } from './types.js';

// Mock vehicle products - shared across all implementations
export const MOCK_PRODUCTS: SearchResult[] = [
  { id: '1', title: '2023 Honda Civic', price: 25000, description: 'Reliable sedan with great fuel economy' },
  { id: '2', title: '2024 Toyota Camry', price: 28000, description: 'Mid-size sedan with premium features' },
  { id: '3', title: '2023 Ford F-150', price: 35000, description: 'America\'s best-selling truck' },
  { id: '4', title: '2024 Tesla Model 3', price: 42000, description: 'Electric performance sedan' },
  { id: '5', title: '2023 BMW 3 Series', price: 45000, description: 'Luxury sports sedan' },
  { id: '6', title: '2024 Chevrolet Silverado', price: 38000, description: 'Heavy-duty pickup truck' },
  { id: '7', title: '2023 Mazda CX-5', price: 27000, description: 'Sporty compact SUV' },
  { id: '8', title: '2024 Hyundai Sonata', price: 26000, description: 'Stylish mid-size sedan' },
  { id: '9', title: '2023 Subaru Outback', price: 31000, description: 'All-wheel drive wagon' },
  { id: '10', title: '2024 Jeep Wrangler', price: 36000, description: 'Iconic off-road SUV' },
  { id: '11', title: '2023 Nissan Altima', price: 25500, description: 'Comfortable family sedan' },
  { id: '12', title: '2024 Kia Telluride', price: 37000, description: 'Spacious three-row SUV' },
  { id: '13', title: '2023 Volkswagen Jetta', price: 24000, description: 'German-engineered compact' },
  { id: '14', title: '2024 Mercedes-Benz C-Class', price: 48000, description: 'Luxury performance' },
  { id: '15', title: '2023 Audi A4', price: 44000, description: 'Premium sports sedan' },
];

export const RESULTS_PER_PAGE = 5;
