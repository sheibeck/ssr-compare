using Microsoft.AspNetCore.Mvc;
using SsrRazor.Models;
using SsrRazor.Services;
using System.Text.Json;

namespace SsrRazor.Controllers;

public class SearchController : Controller
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet("/custom/search")]
    public async Task<IActionResult> Index(
        [FromQuery] string q = "",
        [FromQuery] string sort = "relevance",
        [FromQuery] int page = 1)
    {
        var state = new SearchState
        {
            Query = q,
            Sort = sort,
            Page = page
        };

        var results = await _searchService.SearchAsync(state);

        var viewModel = new SearchViewModel
        {
            State = state,
            Results = results.Results,
            Total = results.Total,
            HasPrev = results.HasPrev,
            HasNext = results.HasNext
        };

        return View("Search", viewModel);
    }

    [HttpGet("/api/search")]
    public async Task<IActionResult> ApiSearch(
        [FromQuery] string q = "",
        [FromQuery] string sort = "relevance",
        [FromQuery] int page = 1)
    {
        var state = new SearchState { Query = q, Sort = sort, Page = page };
        var results = await _searchService.SearchAsync(state);

        return Json(new
        {
            state = new
            {
                q = state.Query,
                sort = state.Sort,
                page = state.Page
            },
            results = results.Results,
            total = results.Total,
            hasPrev = results.HasPrev,
            hasNext = results.HasNext
        });
    }
}
