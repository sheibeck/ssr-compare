using System.Text.Json;

namespace SsrRazor.Models;

public class SearchViewModel
{
    public SearchState State { get; set; } = new();
    public List<VehicleResult> Results { get; set; } = new();
    public int Total { get; set; }
    public bool HasPrev { get; set; }
    public bool HasNext { get; set; }

    // Helper for serialization to JSON (for client-side hydration)
    public string BootStateJson => JsonSerializer.Serialize(new
    {
        state = new
        {
            q = State.Query,
            sort = State.Sort,
            page = State.Page
        },
        data = new
        {
            results = Results,
            total = Total,
            hasPrev = HasPrev,
            hasNext = HasNext
        }
    });
}

public class SearchState
{
    public string Query { get; set; } = "";
    public string Sort { get; set; } = "relevance";
    public int Page { get; set; } = 1;
}

public class VehicleResult
{
    public string Title { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
}
