# Script to create placeholder images for objects
# Uses existing images as templates

$sourceDir = "."
$images = @{
    # Lakes - use lake images as templates
    "balkhash.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "alakol.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "zaysan.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "markakol.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "issykkul.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "kaindy.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "sasykkol.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "kopa.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    "tengiz.jpg" = "aral-sea-dried-ships-desert.jpg"
    "inder.jpg" = "aydar-lake-desert-uzbekistan.jpg"
    
    # Reservoirs - use reservoir images
    "kapshagay.jpg" = "charvak-reservoir-mountains-blue-water.jpg"
    "bartogay.jpg" = "charvak-reservoir-mountains-blue-water.jpg"
    "moynak.jpg" = "andijan-reservoir-dam-water.jpg"
    "shulba.jpg" = "andijan-reservoir-dam-water.jpg"
    "bukhtarma.jpg" = "charvak-reservoir-mountains-blue-water.jpg"
    "ust-kamenogorsk.jpg" = "andijan-reservoir-dam-water.jpg"
    "intumak.jpg" = "kampyrkalin-reservoir-blue-water.jpg"
    "samarkand.jpg" = "charvak-reservoir-mountains-blue-water.jpg"
    "koksaray.jpg" = "surkhan-reservoir-mountains-green.jpg"
    "kengir.jpg" = "kampyrkalin-reservoir-blue-water.jpg"
    
    # Canals - use canal image
    "irtysh-karaganda.jpg" = "fergana-canal-irrigation-water.jpg"
    "arys-turkestan.jpg" = "fergana-canal-irrigation-water.jpg"
    "shardara-kyzylorda.jpg" = "fergana-canal-irrigation-water.jpg"
    "astrakhanka.jpg" = "fergana-canal-irrigation-water.jpg"
    
    # GTS - use river/reservoir images
    "karatal.jpg" = "amu-darya-river-khorezm.jpg"
    "charyn.jpg" = "amu-darya-river-khorezm.jpg"
    "ayagoz.jpg" = "amu-darya-river-khorezm.jpg"
    "ural.jpg" = "amu-darya-river-khorezm.jpg"
    "yesil.jpg" = "amu-darya-river-khorezm.jpg"
    "syrdarya.jpg" = "amu-darya-river-khorezm.jpg"
}

Write-Host "Creating placeholder images..." -ForegroundColor Cyan

foreach ($target in $images.Keys) {
    $source = $images[$target]
    $sourcePath = Join-Path $sourceDir $source
    $targetPath = Join-Path $sourceDir $target
    
    if (Test-Path $sourcePath) {
        if (-not (Test-Path $targetPath)) {
            Copy-Item $sourcePath -Destination $targetPath -Force
            Write-Host "Created: $target (from $source)" -ForegroundColor Green
        } else {
            Write-Host "Skipped: $target (already exists)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Error: source file $source not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! All placeholders created." -ForegroundColor Green
Write-Host "Note: These are temporary placeholders. Replace them with real object images." -ForegroundColor Yellow
