using SsrRazor.Models;

namespace SsrRazor.Services;

public interface ISearchService
{
    Task<SearchResponse> SearchAsync(SearchState state);
}

public class SearchResponse
{
    public List<VehicleResult> Results { get; set; } = new();
    public int Total { get; set; }
    public bool HasPrev { get; set; }
    public bool HasNext { get; set; }
}
