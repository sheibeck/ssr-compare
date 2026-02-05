# SSR Hybrid - IIS + Razor + Vue Islands

This application combines ASP.NET Core Razor for server-side rendering with Vue 3 islands for client-side interactivity.

## Architecture

- **Backend**: ASP.NET Core 8.0 with Razor Pages (No Node.js required)
- **Frontend**: Vue 3 with Islands architecture for selective hydration
- **Build**: Vite for optimal bundling and tree-shaking
- **Deployment**: IIS with ASP.NET Core Module

## Key Features

1. **Fast First Load**: Server-rendered HTML delivered immediately
2. **Progressive Enhancement**: JavaScript loads after initial render
3. **Vue Islands**: Only interactive components are hydrated
4. **Small Footprint**: Only ~50KB Vue runtime loaded
5. **SEO Friendly**: Full HTML in initial response

## Development Setup

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ (for building client assets only)
- IIS (for production deployment)

### Build Steps

1. **Restore .NET dependencies**:
   ```powershell
   dotnet restore
   ```

2. **Build client assets**:
   ```powershell
   cd client
   npm install
   npm run build
   cd ..
   ```

3. **Run the application**:
   ```powershell
   dotnet run
   ```

4. Navigate to `http://localhost:5000`

## Production Deployment

### Build for Production

```powershell
# Build client assets
cd client
npm install
npm run build
cd ..

# Publish .NET application
dotnet publish -c Release -o ./publish
```

### IIS Configuration

1. **Install Prerequisites**:
   - .NET 8.0 Hosting Bundle
   - ASP.NET Core Module v2

2. **Create Application Pool**:
   - Name: `SsrHybridPool`
   - .NET CLR Version: No Managed Code
   - Managed Pipeline Mode: Integrated

3. **Create Website**:
   - Physical Path: Point to `publish` folder
   - Application Pool: `SsrHybridPool`
   - Binding: Configure as needed

4. **Set Permissions**:
   - Grant IIS_IUSRS read access to application folder
   - Create `logs` folder for stdout logging

## Islands Architecture

The application uses Vue islands for selective hydration:

### SearchFilters Island
- Location: Sidebar filter panel
- Hydration: Immediate on page load
- Purpose: Interactive filtering with URL sync

### SearchResults Island  
- Location: Main results grid
- Hydration: Immediate on page load
- Purpose: Dynamic result updates without page refresh

### How It Works

1. **Server renders full HTML** with all content visible
2. **Vue hydrates specific islands** marked with `data-island` attribute
3. **No JavaScript = Still functional** via traditional form submission
4. **With JavaScript = Enhanced UX** via AJAX updates

## File Structure

```
ssr-hybrid/
├── Controllers/           # MVC Controllers
│   └── SearchController.cs
├── Models/               # View Models
│   └── SearchViewModel.cs
├── Services/             # Business Logic
│   ├── ISearchService.cs
│   └── SearchService.cs
├── Views/                # Razor Views
│   └── Search/
│       ├── Search.cshtml
│       └── _SearchResultsPartial.cshtml
├── client/               # Client-side code
│   ├── src/
│   │   ├── main.ts      # Entry point
│   │   └── islands/     # Vue components
│   │       ├── SearchFilters.vue
│   │       └── SearchResults.vue
│   ├── package.json
│   └── vite.config.ts
├── wwwroot/              # Static files
│   └── dist/            # Built assets (generated)
├── Program.cs           # Application entry
├── web.config           # IIS configuration
└── ssr-hybrid.csproj    # Project file
```

## Performance Benefits

- **First Contentful Paint**: < 500ms (server-rendered HTML)
- **Time to Interactive**: < 1s (small Vue bundle)
- **Bundle Size**: ~50KB gzipped (Vue + components)
- **No Hydration Mismatch**: Server HTML matches client expectations

## Comparison to Alternatives

| Approach | First Load | JS Size | Backend |
|----------|-----------|---------|---------|
| Nuxt/Next | Medium | ~200KB | Node.js |
| SPA | Slow | ~150KB | Any |
| **Hybrid** | **Fast** | **~50KB** | **IIS/Razor** |

## Development Tips

- **Modify Razor views** for HTML structure changes
- **Modify Vue islands** for interactive behavior changes
- **Run `npm run build`** after changing client code
- **Hot reload** works for Razor views in development
- **Vite dev server** can be used for client development

## Troubleshooting

### Islands not hydrating
- Check browser console for errors
- Verify `main.js` is loading
- Ensure `data-island` attributes are present

### Styles not applied
- Run `npm run build` in client folder
- Check wwwroot/dist folder exists
- Verify static files middleware is configured

### IIS deployment issues
- Install .NET Hosting Bundle
- Check Application Pool settings
- Review logs in stdout folder
