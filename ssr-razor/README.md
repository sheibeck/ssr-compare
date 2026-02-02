# SSR-Razor - ASP.NET Core Server-Side Rendering

This is a complete ASP.NET Core web application using Razor templates for server-side rendering (SSR). It demonstrates the same vehicle search functionality as the other SSR implementations but uses C# and Razor instead of Node.js and inline HTML strings.

## Features

✅ **Native IIS support** - No iisnode required  
✅ **Razor templates** - Clean separation of HTML and logic  
✅ **Type-safe** - Strongly-typed view models  
✅ **Automatic XSS protection** - Razor `@` syntax escapes by default  
✅ **SSR + Hydration** - Server renders HTML, client takes over for interactivity  
✅ **REST API endpoint** - JSON API at `/api/search`

## Project Structure

```
ssr-razor/
├── Controllers/
│   └── SearchController.cs       # Handles /custom/search and /api/search routes
├── Models/
│   └── SearchViewModel.cs        # View models for Razor templates
├── Services/
│   ├── ISearchService.cs         # Search service interface
│   └── SearchService.cs          # Mock search implementation
├── Views/
│   └── Search/
│       └── Search.cshtml         # Razor template (replaces renderSearchPage.ts)
├── wwwroot/
│   └── assets/
│       └── client.js             # Client-side hydration script
├── Properties/
│   └── launchSettings.json       # Development launch configuration
├── Program.cs                    # Application startup and configuration
├── appsettings.json             # Configuration
├── web.config                    # IIS deployment configuration
└── ssr-razor.csproj             # Project file

```

## Getting Started

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- Visual Studio 2022, VS Code, or any text editor

### Development

1. **Navigate to the project directory:**
   ```powershell
   cd C:\DealerOn\ssr-demo\ssr-razor
   ```

2. **Restore dependencies:**
   ```powershell
   dotnet restore
   ```

3. **Run the application:**
   ```powershell
   dotnet run
   ```

4. **Open your browser:**
   - Main search page: http://localhost:5000/custom/search
   - API endpoint: http://localhost:5000/api/search?q=honda&sort=price_asc

### Hot Reload

The application supports hot reload during development:
```powershell
dotnet watch run
```

Any changes to `.cs` or `.cshtml` files will automatically reload the application.

## Routes

| Route | Description | Type |
|-------|-------------|------|
| `/` | Redirects to `/custom/search` | Redirect |
| `/custom/search` | Server-rendered search page | HTML (SSR) |
| `/api/search` | Search API endpoint | JSON |

### Query Parameters

- `q` - Search query (e.g., "honda")
- `sort` - Sort order: `relevance`, `price_asc`, `price_desc`
- `page` - Page number (default: 1)

Example: `/custom/search?q=honda&sort=price_asc&page=2`

## Architecture

### Server-Side Rendering Flow

1. **Request**: Browser requests `/custom/search?q=honda`
2. **Controller**: `SearchController.Index()` handles the request
3. **Service**: `SearchService.SearchAsync()` fetches/filters data
4. **View Model**: Data is packaged into `SearchViewModel`
5. **Razor Template**: `Search.cshtml` renders HTML
6. **Response**: Complete HTML sent to browser
7. **Hydration**: `client.js` adds interactivity (optional)

### Key Components

#### SearchController.cs
Handles HTTP requests and orchestrates the SSR process:
```csharp
[HttpGet("/custom/search")]
public async Task<IActionResult> Index(string q, string sort, int page)
{
    var state = new SearchState { Query = q, Sort = sort, Page = page };
    var results = await _searchService.SearchAsync(state);
    var viewModel = new SearchViewModel { State = state, Results = results };
    return View("Search", viewModel);
}
```

#### Search.cshtml
Razor template with clean HTML and embedded C# logic:
```razor
@model SearchViewModel
<h3>@Model.Results[0].Title</h3>
<p>$@Model.Results[0].Price.ToString("N0")</p>
```

#### SearchService.cs
Business logic for searching and filtering vehicles:
```csharp
public async Task<SearchResponse> SearchAsync(SearchState state)
{
    // Filter, sort, paginate
    return new SearchResponse { Results = ..., Total = ... };
}
```

## Deployment to IIS

### Method 1: Visual Studio Publish

1. Right-click project → **Publish**
2. Choose **Folder** target
3. Select output path (e.g., `C:\inetpub\wwwroot\ssr-razor`)
4. Click **Publish**

### Method 2: Command Line

```powershell
dotnet publish -c Release -o C:\publish\ssr-razor
```

### IIS Configuration

1. **Install .NET Hosting Bundle:**
   - Download from https://dotnet.microsoft.com/download/dotnet/8.0
   - Restart IIS after installation

2. **Create Application Pool:**
   - Name: `SsrRazorPool`
   - .NET CLR version: **No Managed Code**
   - Managed pipeline mode: **Integrated**

3. **Create Website:**
   - Physical path: `C:\publish\ssr-razor` (or your publish path)
   - Application pool: `SsrRazorPool`
   - Binding: Port 80 or your preferred port

4. **Set Permissions:**
   - Grant `IIS_IUSRS` read/execute permissions on the folder

5. **Browse:**
   - http://localhost (or your configured hostname)

## Comparison with Node.js Implementation

| Feature | Node.js (server/index.ts) | ASP.NET Core (ssr-razor) |
|---------|---------------------------|--------------------------|
| Templating | String concatenation | Razor templates |
| XSS Protection | Manual `escapeHtml()` | Automatic with `@` |
| IIS Hosting | Requires iisnode | Native support |
| Type Safety | TypeScript | C# (compile-time) |
| Performance | Good | Better on Windows |
| Development | Hot reload with tsx | Hot reload with dotnet watch |
| Ecosystem | npm packages | NuGet packages |

## Development Tips

### Adding New Routes

1. Add method to `SearchController`:
```csharp
[HttpGet("/vehicles/{id}")]
public IActionResult Details(int id) => View();
```

2. Create view: `Views/Search/Details.cshtml`

### Adding Dependencies

```powershell
dotnet add package Newtonsoft.Json
```

### Debugging

- **Visual Studio**: F5 to start debugging
- **VS Code**: Install C# extension, F5 to debug
- **Command line**: `dotnet run` then attach debugger

### Environment Variables

Set in `appsettings.Development.json` or via environment:
```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run
```

## Testing

### Manual Testing

```powershell
# Test search page
curl http://localhost:5000/custom/search?q=honda

# Test API
curl http://localhost:5000/api/search?q=honda&sort=price_asc | ConvertFrom-Json
```

### Unit Testing

Create a test project:
```powershell
dotnet new xunit -n SsrRazor.Tests
dotnet add reference ../ssr-razor/ssr-razor.csproj
```

## Troubleshooting

### Port Already in Use

Change port in `Properties/launchSettings.json` or use:
```powershell
dotnet run --urls "http://localhost:5005"
```

### IIS 502.5 Error

- Verify .NET Hosting Bundle is installed
- Check `web.config` is present
- Review logs in `logs\stdout-*.log`

### Razor View Not Found

- Ensure view name matches: `return View("Search", model)`
- Check file location: `Views/Search/Search.cshtml`
- Verify `AddControllersWithViews()` is called in `Program.cs`

## Next Steps

- Add database integration (Entity Framework Core)
- Implement authentication (ASP.NET Identity)
- Add API versioning
- Set up caching (Redis, In-Memory)
- Add logging (Serilog)
- Implement comprehensive error handling

## Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Razor Syntax Reference](https://docs.microsoft.com/aspnet/core/mvc/views/razor)
- [Deploying to IIS](https://docs.microsoft.com/aspnet/core/host-and-deploy/iis)
