using SsrRazor.Models;

namespace SsrRazor.Services;

public class SearchService : ISearchService
{
    // Mock data - simulating a database
    private static readonly List<VehicleResult> MockVehicles = new()
    {
        new VehicleResult { Title = "2023 Honda Civic LX", Price = 24500, Description = "Reliable and fuel-efficient sedan with modern features." },
        new VehicleResult { Title = "2022 Honda Accord EX", Price = 28900, Description = "Spacious midsize sedan with advanced safety technology." },
        new VehicleResult { Title = "2023 Honda CR-V Sport", Price = 32400, Description = "Versatile compact SUV perfect for families." },
        new VehicleResult { Title = "2021 Honda Pilot Touring", Price = 38900, Description = "Three-row SUV with premium comfort and capability." },
        new VehicleResult { Title = "2023 Toyota Camry SE", Price = 26500, Description = "Smooth-riding sedan with excellent reliability." },
        new VehicleResult { Title = "2022 Toyota RAV4 XLE", Price = 30200, Description = "Popular compact SUV with all-wheel drive." },
        new VehicleResult { Title = "2023 Toyota Highlander Limited", Price = 42800, Description = "Refined three-row SUV with luxury features." },
        new VehicleResult { Title = "2022 Ford F-150 XLT", Price = 45600, Description = "America's best-selling truck with powerful performance." },
        new VehicleResult { Title = "2023 Ford Mustang GT", Price = 38900, Description = "Iconic muscle car with thrilling V8 power." },
        new VehicleResult { Title = "2022 Chevrolet Silverado LT", Price = 43200, Description = "Capable full-size truck for work and play." },
        new VehicleResult { Title = "2023 Chevrolet Equinox Premier", Price = 29800, Description = "Compact SUV with modern technology." },
        new VehicleResult { Title = "2022 Nissan Altima SV", Price = 25700, Description = "Comfortable sedan with advanced driver assistance." },
        new VehicleResult { Title = "2023 Nissan Rogue SL", Price = 33500, Description = "Practical compact SUV with spacious interior." },
        new VehicleResult { Title = "2022 Mazda CX-5 Touring", Price = 31200, Description = "Sporty compact SUV with upscale feel." },
        new VehicleResult { Title = "2023 Mazda3 Premium", Price = 27400, Description = "Stylish compact sedan with engaging driving dynamics." },
        new VehicleResult { Title = "2022 Subaru Outback Limited", Price = 36800, Description = "Versatile wagon with standard all-wheel drive." },
        new VehicleResult { Title = "2023 Subaru Forester Sport", Price = 32900, Description = "Rugged compact SUV ready for adventure." },
        new VehicleResult { Title = "2022 Hyundai Tucson SEL", Price = 28600, Description = "Bold-styled compact SUV with tech features." },
        new VehicleResult { Title = "2023 Kia Sportage EX", Price = 29900, Description = "Modern compact SUV with striking design." },
        new VehicleResult { Title = "2022 Volkswagen Tiguan SE", Price = 30400, Description = "European compact SUV with three-row seating." }
    };

    private const int PageSize = 5;

    public Task<SearchResponse> SearchAsync(SearchState state)
    {
        // Filter by query
        var filtered = string.IsNullOrWhiteSpace(state.Query)
            ? MockVehicles
            : MockVehicles.Where(v =>
                v.Title.Contains(state.Query, StringComparison.OrdinalIgnoreCase) ||
                v.Description.Contains(state.Query, StringComparison.OrdinalIgnoreCase)
            ).ToList();

        // Sort
        var sorted = state.Sort switch
        {
            "price_asc" => filtered.OrderBy(v => v.Price).ToList(),
            "price_desc" => filtered.OrderByDescending(v => v.Price).ToList(),
            _ => filtered // relevance (keep original order)
        };

        // Paginate
        var total = sorted.Count;
        var skip = (state.Page - 1) * PageSize;
        var results = sorted.Skip(skip).Take(PageSize).ToList();

        var response = new SearchResponse
        {
            Results = results,
            Total = total,
            HasPrev = state.Page > 1,
            HasNext = skip + PageSize < total
        };

        return Task.FromResult(response);
    }
}
