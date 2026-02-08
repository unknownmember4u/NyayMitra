
Write-Host "Preparing to deploy to Firebase (Frontend Only)..."

# 1. Build Frontend
Write-Host "Building Frontend..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed!"
    exit 1
}

# 2. Deploy
Write-Host "Deploying to Firebase Hosting..."
Write-Host "If this is your first time, you might need to run: firebase login"
Write-Host "You also need to select a project using: firebase use <project-id>"

# Check if project is selected
$projectCheck = firebase projects:list
if ($projectCheck -match "Not specified") {
    Write-Warning "No active project selected. Please run 'firebase use --add' or 'firebase use <project-id>' before running this script again."
    # List projects to help user
    firebase projects:list
    exit 1
}

firebase deploy --only hosting
