namespace SsrHybrid.Models;

public class SearchViewModel
{
    public SearchFilters Filters { get; set; } = new();
    public List<Vehicle> Results { get; set; } = new();
    public int TotalCount { get; set; }
}

public class SearchFilters
{
    public string? Make { get; set; }
    public string? Model { get; set; }
    public string? Year { get; set; }
    public int? MinPrice { get; set; }
    public int? MaxPrice { get; set; }
}

public class Vehicle
{
    public int Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string VIN { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Mileage { get; set; }
}
