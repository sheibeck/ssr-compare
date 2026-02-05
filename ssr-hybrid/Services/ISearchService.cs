using SsrHybrid.Models;

namespace SsrHybrid.Services;

public interface ISearchService
{
    List<Vehicle> SearchVehicles(SearchFilters filters);
}
