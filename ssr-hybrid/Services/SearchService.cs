using SsrHybrid.Models;

namespace SsrHybrid.Services;

public class SearchService : ISearchService
{
    // Mock data for demonstration
    private readonly List<Vehicle> _vehicles = new()
    {
        new Vehicle { Id = 1, Make = "Toyota", Model = "Camry", Year = 2024, Price = 28500, VIN = "1HGCM82633A123456", Color = "Silver", Mileage = 5000, ImageUrl = "https://via.placeholder.com/400x300?text=2024+Toyota+Camry" },
        new Vehicle { Id = 2, Make = "Honda", Model = "Accord", Year = 2023, Price = 27800, VIN = "1HGCM82633A123457", Color = "Blue", Mileage = 12000, ImageUrl = "https://via.placeholder.com/400x300?text=2023+Honda+Accord" },
        new Vehicle { Id = 3, Make = "Ford", Model = "F-150", Year = 2024, Price = 45000, VIN = "1HGCM82633A123458", Color = "Black", Mileage = 3000, ImageUrl = "https://via.placeholder.com/400x300?text=2024+Ford+F-150" },
        new Vehicle { Id = 4, Make = "Chevrolet", Model = "Silverado", Year = 2023, Price = 42500, VIN = "1HGCM82633A123459", Color = "White", Mileage = 8000, ImageUrl = "https://via.placeholder.com/400x300?text=2023+Chevrolet+Silverado" },
        new Vehicle { Id = 5, Make = "Toyota", Model = "RAV4", Year = 2024, Price = 32000, VIN = "1HGCM82633A123460", Color = "Red", Mileage = 2000, ImageUrl = "https://via.placeholder.com/400x300?text=2024+Toyota+RAV4" },
        new Vehicle { Id = 6, Make = "Honda", Model = "CR-V", Year = 2023, Price = 30500, VIN = "1HGCM82633A123461", Color = "Gray", Mileage = 15000, ImageUrl = "https://via.placeholder.com/400x300?text=2023+Honda+CR-V" },
        new Vehicle { Id = 7, Make = "Nissan", Model = "Altima", Year = 2024, Price = 26900, VIN = "1HGCM82633A123462", Color = "Silver", Mileage = 7000, ImageUrl = "https://via.placeholder.com/400x300?text=2024+Nissan+Altima" },
        new Vehicle { Id = 8, Make = "Mazda", Model = "CX-5", Year = 2023, Price = 29800, VIN = "1HGCM82633A123463", Color = "Blue", Mileage = 10000, ImageUrl = "https://via.placeholder.com/400x300?text=2023+Mazda+CX-5" },
        new Vehicle { Id = 9, Make = "Subaru", Model = "Outback", Year = 2024, Price = 34500, VIN = "1HGCM82633A123464", Color = "Green", Mileage = 4000, ImageUrl = "https://via.placeholder.com/400x300?text=2024+Subaru+Outback" },
        new Vehicle { Id = 10, Make = "Volkswagen", Model = "Tiguan", Year = 2023, Price = 31200, VIN = "1HGCM82633A123465", Color = "White", Mileage = 11000, ImageUrl = "https://via.placeholder.com/400x300?text=2023+Volkswagen+Tiguan" },
        new Vehicle { Id = 11, Make = "Hyundai", Model = "Tucson", Year = 2024, Price = 28900, VIN = "1HGCM82633A123466", Color = "Black", Mileage = 6000, ImageUrl = "https://via.placeholder.com/400x300?text=2024+Hyundai+Tucson" },
        new Vehicle { Id = 12, Make = "Kia", Model = "Sportage", Year = 2023, Price = 27500, VIN = "1HGCM82633A123467", Color = "Red", Mileage = 9000, ImageUrl = "https://via.placeholder.com/400x300?text=2023+Kia+Sportage" },
    };

    public List<Vehicle> SearchVehicles(SearchFilters filters)
    {
        var query = _vehicles.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(filters.Make))
        {
            query = query.Where(v => v.Make.Contains(filters.Make, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(filters.Model))
        {
            query = query.Where(v => v.Model.Contains(filters.Model, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(filters.Year))
        {
            if (int.TryParse(filters.Year, out int year))
            {
                query = query.Where(v => v.Year == year);
            }
        }

        if (filters.MinPrice.HasValue)
        {
            query = query.Where(v => v.Price >= filters.MinPrice.Value);
        }

        if (filters.MaxPrice.HasValue)
        {
            query = query.Where(v => v.Price <= filters.MaxPrice.Value);
        }

        return query.ToList();
    }
}
