@echo off
echo Publishing SSR Hybrid Application...
echo.

set OUTPUT_DIR=.\publish

echo Step 1: Building client assets...
cd client
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo.
echo Step 2: Publishing .NET application...
dotnet publish -c Release -o %OUTPUT_DIR%
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Publish completed successfully!
echo Output directory: %OUTPUT_DIR%
echo.
echo To deploy to IIS:
echo 1. Copy contents of %OUTPUT_DIR% to your IIS site folder
echo 2. Ensure Application Pool is configured (see IIS-SETUP.md)
echo 3. Run: iisreset
