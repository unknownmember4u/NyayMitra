# ⚖️ NyayMitra - AI Legal Services Platform

**NyayMitra** is a hackathon-ready AI-powered legal assistance platform for India that helps citizens access justice faster by automating case intake, prioritization, classification, and lawyer discovery using artificial intelligence.

It bridges the gap between users and verified legal professionals while enabling multilingual and inclusive access.

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js installed on your machine
- A Firebase project

---

### 2. Installation
```bash
# Navigate to the project folder
cd nyaymitra

# Install dependencies
npm install
```

---

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

---

### 4. Firebase Setup

In your Firebase Console:

#### 1️⃣ Authentication
- Enable Email/Password authentication

#### 2️⃣ Firestore Database
- Create database in Test Mode
- Configure security rules later for production

#### 3️⃣ Firebase Storage
- Enable storage for secure legal document uploads

---

### 5. Running the App
```bash
npm run dev
```

---

## 🧠 Key Features

### 🤖 AI-Powered Legal Assistant
- Smart chatbot for legal queries
- Simplifies complex legal language
- Guides users with next steps

---

### 🚨 AI Case Priority & Urgency Detection
- Detects emergency keywords using NLP
- Flags critical legal cases
- Categorizes cases as High / Medium / Normal

---

### 📂 Domain-wise Case Classification

Automatically classifies cases into:
- Criminal Law
- Civil Disputes
- Family Law
- Property Law
- Cyber Crime

---

### 📄 Secure Legal Document Upload
- Encrypted cloud storage
- Upload FIRs, affidavits and evidence
- Role-based access control

---

### 🔐 Role-Based Authentication & Authorization

Separate dashboards for:
- **Clients** - Submit and track complaints
- **Advocates** - Manage cases and clients
- **Admins** - Platform oversight and verification

---

### 🔔 Real-Time Alerts & Notifications

Live updates on:
- Case status changes
- Lawyer responses
- Appointment scheduling

---

### 📝 Complaint Registration & Tracking
- Digital complaint submission
- Live progress tracking
- **Status flow:** Submitted → Review → Assigned → Resolved

---

### ✅ Advocate Verification & Trust Scoring

Lawyer profile verification with trust score based on:
- Experience
- Success rate
- Client ratings

---

### 📢 AI Legal Awareness System

Awareness about:
- Citizen rights
- Government schemes
- New legal updates

---

### 🌐 Multi-Language Support (India Focused)
- Regional language support
- Rural-friendly accessibility
- Digital inclusion focus

---

### ⚖️ Smart Lawyer Recommendation Engine

AI-based matching system with ranking based on:
- Domain expertise
- Experience
- Success rate
- Ratings
- **Explainable recommendations**

---

## 🛠️ Testing the MVP

**Quick Start for Testing:**

Click the **"Seed Sample Lawyers"** button on the login page.

This will:
- ✅ Insert dummy advocate data
- ✅ Populate ratings and experience
- ✅ Enable instant testing

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Firebase Authentication + Firestore |
| **Storage** | Firebase Cloud Storage |
| **AI Layer** | NLP-based classification & scoring |
| **Hosting** | Firebase / Vercel |

---

## 📄 License

This project is built for educational and hackathon purposes.

---

<div align="center">
  <p><strong>Made with ⚖️ for accessible justice in India</strong></p>
</div>
