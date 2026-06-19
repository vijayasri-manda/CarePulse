# CarePulse — Frontend Web Application

This is the client-facing presentation and orchestration layer for **CarePulse**, built using React, Vite, and vanilla CSS for a modern, high-performance, and responsive user experience.

---

## 🛠️ Technology Stack
* **Framework**: React 19 (Functional Hooks-based state management)
* **Build System**: Vite (Fast HMR & bundling)
* **Routing**: React Router DOM v7
* **Styling**: Vanilla CSS (incorporating modern glassmorphism, tailored HSL color schemas, and CSS variables)
* **Icons**: Lucide React

---

## ⚙️ Environment Variables

The frontend app communicates with the backend API via the base URL specified in its environment variables.

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | The endpoint URL of the CarePulse Spring Boot API | `http://localhost:8080/api` |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher

### 2. Properties Setup
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Installation & Bootup
Navigate to the frontend folder, install the node packages, and run the development server:
```bash
cd frontend
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

---

## 📦 Deploying to Vercel

Vercel is the recommended hosting platform for React SPA applications. Follow these steps to configure Vercel for this monorepo layout:

### Step-by-Step Vercel Deployment Guide

1. **Import the Repository**:
   - Log in to your [Vercel Dashboard](https://vercel.com).
   - Click **Add New** -> **Project**.
   - Import your GitHub Repository containing this project.

2. **Configure Build & Development Settings**:
   - **Framework Preset**: Select **Vite** (automatically detected).
   - **Root Directory**: Click *Edit* and select the **`frontend`** directory. This ensures Vercel installs dependencies and runs build scripts inside the frontend workspace.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install`

3. **Configure Environment Variables**:
   Under the **Environment Variables** section, add the API route:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: *Your Render Backend API URL* (e.g. `https://carepulse-backend.onrender.com/api`)

4. **Deploy**:
   Click **Deploy**. Vercel will bundle the static React app and serve it on a global CDN.

---

## 🔗 Single Page App (SPA) Routing Configuration
This project includes a [vercel.json](file:///c:/Users/HP/Documents/workspace-spring-tools-for-eclipse-5.1.1.RELEASE/HospitalManagementSystem/frontend/vercel.json) file that handles SPA routes. It redirects all non-file route requests directly to `/index.html`, allowing React Router to manage the routes natively and preventing `404 Not Found` errors when users refresh deep pages.
