# NyayMitra - AI Legal Services Platform (MVP)

NyayMitra is a hackathon-ready MVP for an AI-powered legal services platform in India. It matches clients with the best legal professionals using a custom recommendation engine and detects case urgency using AI keyword analysis.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed on your machine.
- A Firebase project.

### 2. Installation
```bash
# Navigate to the project folder
cd nyaymitra

# Install dependencies
npm install
```

### 3. Firebase Configuration
Open `src/services/firebase.js` and replace the placeholder config with your actual Firebase project keys:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Firebase Setup
In your Firebase Console:
1.  **Authentication**: Enable Email/Password provider.
2.  **Firestore**: Create a database in "Test Mode" (or set rules to allow read/write for development).

### 5. Running the App
```bash
npm run dev
```

## 🧠 Key Features

- **AI Urgency Detection**: Automatically categorizes cases as 'high' or 'medium' urgency based on descriptions (e.g., detecting keywords like 'arrest', 'violence').
- **Lawyer Recommendation Engine**: Ranks lawyers based on a weighted score of experience, win rate, and client ratings.
- **Role-Based Dashboards**: Tailored experiences for both clients and legal professionals.
- **Explainable AI**: Provides reasons why specific lawyers were recommended.

## 🛠️ Testing the MVP
On the Login page, you will see a **"Seed Sample Lawyers"** button. Clicking this will automatically populate your Firestore with dummy lawyer data so you can test the recommendation matching immediately.

---
Built with React, Vite, and Firebase.
