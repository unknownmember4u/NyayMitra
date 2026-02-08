---
description: Deploy the complete project to Firebase
---

# Deployment Workflow

This workflow deploys both the frontend (Vue/React) and the backend (Python Cloud Functions) to Firebase.

1.  **Prerequisites**:
    - Ensure you have `firebase-tools` installed: `npm install -g firebase-tools`
    - Login to Firebase: `firebase login`
    - Select your project: `firebase use <project-id>` (or run `firebase use --add`)
    - Ensure `server/.env` exists with `GEMINI_API_KEY`.

2.  **Run the Deployment Script**:
    This script handles environment setup, building the frontend, and deploying.
    ```powershell
    ./deploy_to_firebase.ps1
    ```

    Alternatively, run manually:
    ```bash
    cp server/.env functions/.env
    npm run build
    firebase deploy
    ```

3.  **Verify**:
    - Visit the Hosting URL provided by Firebase.
    - Test the application features (voice recording, analysis).
    - Checks logs in Firebase Console > Functions > Logs if issues arise.
