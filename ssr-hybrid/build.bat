@echo off
echo Building SSR Hybrid Application...
echo.

echo Step 1: Restoring .NET dependencies...
dotnet restore
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Step 2: Building client assets...
cd client
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo.
echo Step 3: Building .NET application...
dotnet build -c Release
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Build completed successfully!
echo To run the application, use: dotnet run
