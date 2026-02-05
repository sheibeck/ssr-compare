using Microsoft.AspNetCore.Mvc;
using SsrHybrid.Models;
using SsrHybrid.Services;

namespace SsrHybrid.Controllers;

public class SearchController : Controller
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    public IActionResult Index(string? make, string? model, string? year, int? minPrice, int? maxPrice)
    {
        var filters = new SearchFilters
        {
            Make = make,
            Model = model,
            Year = year,
            MinPrice = minPrice,
            MaxPrice = maxPrice
        };

        var results = _searchService.SearchVehicles(filters);

        var viewModel = new SearchViewModel
        {
            Filters = filters,
            Results = results,
            TotalCount = results.Count
        };

        return View("Search", viewModel);
    }

    [HttpGet]
    public IActionResult Results(string? make, string? model, string? year, int? minPrice, int? maxPrice)
    {
        // Handle AJAX requests for partial updates
        var filters = new SearchFilters
        {
            Make = make,
            Model = model,
            Year = year,
            MinPrice = minPrice,
            MaxPrice = maxPrice
        };

        var results = _searchService.SearchVehicles(filters);

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView("_SearchResultsPartial", results);
        }

        return RedirectToAction("Index", new { make, model, year, minPrice, maxPrice });
    }
}
