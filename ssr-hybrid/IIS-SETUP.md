# IIS Setup for SSR Hybrid

## Prerequisites

1. **Windows Server 2016+** or **Windows 10/11**
2. **IIS 10+** with the following features:
   - Web Server (IIS)
   - Application Development Features
     - ASP.NET 4.8
     - .NET Extensibility 4.8
   - Management Tools
     - IIS Management Console

3. **.NET 8.0 Hosting Bundle**
   - Download: https://dotnet.microsoft.com/download/dotnet/8.0
   - Install the "Hosting Bundle" (includes runtime + ASP.NET Core Module)

## Installation Steps

### Step 1: Install IIS

```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ApplicationInit
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HealthAndDiagnostics
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Performance
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpCompressionStatic
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpCompressionDynamic
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerManagementTools
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ManagementConsole
```

### Step 2: Install .NET 8.0 Hosting Bundle

1. Download from Microsoft
2. Run the installer
3. Restart IIS: `iisreset`

### Step 3: Create Application Pool

```powershell
# Import IIS module
Import-Module WebAdministration

# Create Application Pool
New-WebAppPool -Name "SsrHybridPool"

# Configure Application Pool
Set-ItemProperty "IIS:\AppPools\SsrHybridPool" -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\SsrHybridPool" -Name managedPipelineMode -Value "Integrated"
Set-ItemProperty "IIS:\AppPools\SsrHybridPool" -Name processModel.identityType -Value "ApplicationPoolIdentity"
Set-ItemProperty "IIS:\AppPools\SsrHybridPool" -Name enable32BitAppOnWin64 -Value $false
```

### Step 4: Create Website

```powershell
# Create logs directory
New-Item -ItemType Directory -Path "C:\inetpub\ssr-hybrid\logs" -Force

# Set up the website
New-Website -Name "SsrHybrid" `
    -PhysicalPath "C:\inetpub\ssr-hybrid" `
    -ApplicationPool "SsrHybridPool" `
    -Port 80 `
    -HostHeader "ssr-hybrid.local"

# Set permissions
$acl = Get-Acl "C:\inetpub\ssr-hybrid"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow")
$acl.SetAccessRule($rule)
Set-Acl "C:\inetpub\ssr-hybrid" $acl
```

### Step 5: Deploy Application

1. **Build for production**:
   ```powershell
   cd ssr-hybrid
   
   # Build client assets
   cd client
   npm install
   npm run build
   cd ..
   
   # Publish .NET app
   dotnet publish -c Release -o C:\inetpub\ssr-hybrid
   ```

2. **Verify files**:
   - `C:\inetpub\ssr-hybrid\ssr-hybrid.dll`
   - `C:\inetpub\ssr-hybrid\web.config`
   - `C:\inetpub\ssr-hybrid\wwwroot\dist\`

3. **Test deployment**:
   ```powershell
   # Restart application pool
   Restart-WebAppPool -Name "SsrHybridPool"
   
   # Test website
   Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
   ```

## IIS Manager Configuration (Alternative)

### Application Pool Settings:
1. Open IIS Manager
2. Right-click "Application Pools" → "Add Application Pool"
3. Name: `SsrHybridPool`
4. .NET CLR version: `No Managed Code`
5. Managed pipeline mode: `Integrated`
6. Click "OK"

### Website Settings:
1. Right-click "Sites" → "Add Website"
2. Site name: `SsrHybrid`
3. Application pool: `SsrHybridPool`
4. Physical path: `C:\inetpub\ssr-hybrid`
5. Binding:
   - Type: `http`
   - IP address: `All Unassigned`
   - Port: `80`
   - Host name: `ssr-hybrid.local` (optional)
6. Click "OK"

## Troubleshooting

### 500.31 Error (Failed to load .NET Core host)
- Install .NET 8.0 Hosting Bundle
- Run `iisreset` after installation

### 502.5 Error (Process failure)
- Check stdout logs in `logs` folder
- Verify permissions on application folder
- Ensure web.config is present

### Static files not loading
- Verify wwwroot folder exists
- Check MIME types in IIS
- Enable static content in IIS features

### Application Pool crashes
- Check Event Viewer for errors
- Review stdout logs
- Verify .NET version compatibility

## Performance Tuning

### Enable Compression
```xml
<!-- In web.config -->
<httpCompression>
  <dynamicTypes>
    <add mimeType="application/javascript" enabled="true" />
    <add mimeType="application/json" enabled="true" />
    <add mimeType="text/html" enabled="true" />
  </dynamicTypes>
  <staticTypes>
    <add mimeType="application/javascript" enabled="true" />
    <add mimeType="text/css" enabled="true" />
  </staticTypes>
</httpCompression>
```

### Enable Caching
```xml
<staticContent>
  <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="7.00:00:00" />
</staticContent>
```

### Application Initialization
```xml
<applicationInitialization>
  <add initializationPage="/" />
</applicationInitialization>
```

## Security Hardening

1. **Remove server headers**:
   ```xml
   <httpProtocol>
     <customHeaders>
       <remove name="X-Powered-By" />
     </customHeaders>
   </httpProtocol>
   ```

2. **Enable HTTPS** (recommended for production)

3. **Configure request filtering**

4. **Use dedicated application pool identity**

## Monitoring

- **Application Logs**: `wwwroot\logs\`
- **Event Viewer**: Windows Logs → Application
- **IIS Logs**: `C:\inetpub\logs\LogFiles\`
- **Performance Counters**: ASP.NET Core counters

## Additional Resources

- [ASP.NET Core on IIS](https://docs.microsoft.com/aspnet/core/host-and-deploy/iis/)
- [ASP.NET Core Module](https://docs.microsoft.com/aspnet/core/host-and-deploy/aspnet-core-module)
- [Troubleshooting Guide](https://docs.microsoft.com/aspnet/core/test/troubleshoot-azure-iis)
