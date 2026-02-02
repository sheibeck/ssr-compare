# IIS Setup Guide for Node.js SSR Application

## Prerequisites

1. **IIS (Internet Information Services)**
   - Windows Server: Enable IIS through Server Manager
   - Windows 10/11: Control Panel → Programs → Turn Windows features on or off → Internet Information Services

2. **Node.js**
   - Download and install from https://nodejs.org/
   - Verify installation: `node --version`

3. **iisnode Module**
   - Download from https://github.com/tjanczuk/iisnode/releases
   - Install the appropriate version (x64 or x86) for your system
   - This bridges IIS and Node.js applications

4. **URL Rewrite Module**
   - Download from https://www.iis.net/downloads/microsoft/url-rewrite
   - Required for routing requests to Node.js

## Installation Steps

### 1. Build the Application

```powershell
cd C:\DealerOn\ssr-demo\server
npm install
npm run build
```

### 2. Configure IIS Application Pool

1. Open **IIS Manager** (inetmgr)
2. Navigate to **Application Pools**
3. Create a new Application Pool:
   - Name: `SSRDemoPool`
   - .NET CLR version: **No Managed Code**
   - Managed pipeline mode: **Integrated**
4. Click **OK**

### 3. Create IIS Website

1. In IIS Manager, right-click **Sites** → **Add Website**
2. Configure:
   - Site name: `SSR-Demo`
   - Application pool: `SSRDemoPool`
   - Physical path: `C:\DealerOn\ssr-demo\server`
   - Binding:
     - Type: `http`
     - IP: `All Unassigned`
     - Port: `80` (or your preferred port)
     - Host name: `ssr-demo.local` (optional)
3. Click **OK**

### 4. Set Permissions

1. Right-click the website → **Edit Permissions**
2. Go to **Security** tab
3. Add **IIS_IUSRS** group with **Read & Execute** permissions
4. Add **IUSR** user with **Read & Execute** permissions

### 5. Configure web.config

The `web.config` file is already configured. Key sections:

- **URL Rewrite**: Routes all requests to `dist/index.js`
- **iisnode**: Configures Node.js hosting
- **Handlers**: Maps `.js` files to iisnode module

### 6. Configure Application Settings (Optional)

Add environment variables in IIS:
1. Select your site in IIS Manager
2. Double-click **Configuration Editor**
3. Navigate to: `system.webServer/iisnode`
4. Set environment variables as needed

## Testing

### 1. Verify the Build

```powershell
# Check that dist/index.js exists
Test-Path C:\DealerOn\ssr-demo\server\dist\index.js
```

### 2. Test Locally First

```powershell
node dist/index.js
# Visit http://localhost:3000
```

### 3. Browse the IIS Site

- Open browser to `http://localhost` (or configured port/hostname)
- Should redirect to `/custom/search`
- Test API: `http://localhost/api/search?q=honda`

## Troubleshooting

### Check iisnode Logs

Logs are stored in: `C:\DealerOn\ssr-demo\server\iisnode\`

### Common Issues

1. **500 Error**: Check Node.js path in web.config
2. **404 Error**: Verify URL Rewrite module is installed
3. **Module not found**: Run `npm install` in the server directory
4. **Permission denied**: Check IIS_IUSRS has read access

### Enable Detailed Errors

In `web.config`, temporarily set:
```xml
<iisnode debuggingEnabled="true" devErrorsEnabled="true" />
```

### Test iisnode Installation

Create a test site:
```javascript
// test.js
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello from iisnode!');
}).listen(process.env.PORT);
```

## Production Considerations

1. **Set Node Environment**
   ```xml
   <iisnode node_env="production" />
   ```

2. **Disable Debugging**
   ```xml
   <iisnode debuggingEnabled="false" devErrorsEnabled="false" />
   ```

3. **Configure Process Count**
   - `nodeProcessCountPerApplication: 0` uses all CPU cores
   - Set specific number for fine-tuning

4. **Enable Compression**
   In IIS → Compression (for better performance)

5. **Configure Caching**
   Set cache headers for static assets in your Node.js code

6. **Monitor Performance**
   Use IIS logs and Windows Performance Monitor

## Alternative: ASP.NET Core Hosting

If you prefer C#/.NET instead of iisnode, see the `ssr-razor` folder for an ASP.NET Core implementation that's native to IIS.

## Resources

- [iisnode GitHub](https://github.com/tjanczuk/iisnode)
- [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
- [Node.js on Windows](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows)
