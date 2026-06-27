# 🚀 Complete Beginner's Guide: Local Setup, GitHub, Firebase & Vercel Deployment

Welcome! This step-by-step guide is written specifically for beginners. By following these steps, you will be able to run **Geeta's Masale** on your local computer, connect it to a real **Firebase Database**, upload it to **GitHub**, and host it live on the internet using **Vercel** or **Render**.

---

## 📌 PHASE 1: Running the Project Locally on Your Computer

### Step 1.1: Install Required Software
Before doing anything, ensure your computer has these two free tools installed:
1. **Node.js** (Version 18 or higher): [Download here](https://nodejs.org/) (Choose the LTS version).
2. **Visual Studio Code (VS Code)**: [Download here](https://code.visualstudio.com/).

### Step 1.2: Extract the ZIP & Open in VS Code
1. Extract (Unzip) the downloaded ZIP file to a folder on your Desktop.
2. Open **VS Code**.
3. Click **File > Open Folder...** and select the unzipped project folder.

### Step 1.3: Install Dependencies & Start the App
1. Inside VS Code, click **Terminal > New Terminal** at the top menu.
2. Type the following command and press Enter to install all required packages:
   ```bash
   npm install
   ```
3. Once installation completes, start the local server:
   ```bash
   npm run dev
   ```
4. Open your web browser (Chrome/Safari) and visit: `http://localhost:3000`  
   🎉 *Your website is now running locally!*

---

## 🔥 PHASE 2: Setting up Firebase Database (Firestore)

We will use Google's free **Firebase** service to store customer inquiries, reviews, and store data.

### Step 2.1: Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and sign in with your Google Account.
2. Click **+ Create a Project** (or Add Project).
3. Name your project (e.g., `geetas-masale-db`) and click **Continue**.
4. You can disable Google Analytics for now, then click **Create Project**.

### Step 2.2: Set Up Firestore Database
1. On the left sidebar menu, click **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose a location (e.g., `asia-south1` for Mumbai/India) and click **Next**.
4. Select **Start in Test Mode** (this allows your website to read and write data easily while you learn), then click **Create**.

### Step 2.3: Get Your Firebase API Keys
1. In the Firebase console, click the **Gear Icon ⚙️ > Project Settings** near the top left.
2. Scroll down to the **"Your apps"** section and click the **Web icon (`</>`)**.
3. Register the app with a nickname (e.g., `Geetas Store Website`) and click **Register app**.
4. You will see a code block containing `firebaseConfig`. It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD-EXAMPLE_KEY...",
     authDomain: "geetas-masale.firebaseapp.com",
     projectId: "geetas-masale",
     storageBucket: "geetas-masale.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
5. Keep this tab open! You will paste these keys into your local project in the next step.

### Step 2.4: Add Firebase Keys to Your Project
1. In VS Code, look at the files list on the left. Create a new file named `.env` in the root folder (right next to `package.json`).
2. Paste your Firebase keys into `.env` formatted like this:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
*(Note: In Vite React apps, environment variables must start with `VITE_` to be readable by the browser).*

---

## 🐙 PHASE 3: Uploading Your Code to GitHub

GitHub safely stores your code online and connects directly to deployment platforms.

### Step 3.1: Create a GitHub Account & Repository
1. Go to [github.com](https://github.com/) and sign up / log in.
2. Click the **+** icon at the top right and select **New repository**.
3. Name it `geetas-masale-store`.
4. Keep it **Public** or **Private** (your choice), and click **Create repository**.

### Step 3.2: Push Your Local Code to GitHub
1. Go back to VS Code terminal. Stop the running app by pressing `Ctrl + C`.
2. Run these commands one by one in the terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial website launch"
   git branch -M main
   ```
3. Copy the exact `git remote add origin ...` command from your newly created GitHub repository page and paste it in terminal. Example:
   ```bash
   git remote add origin https://github.com/YourUsername/geetas-masale-store.git
   git push -u origin main
   ```
4. Refresh your GitHub page online — your code is now backed up in the cloud!

---

## 🌐 PHASE 4: Going Live on the Internet!

Because this project contains both a **React Frontend** and a **Custom Node.js Express Backend (`server.ts`)**, you have two great ways to deploy:

### Option A: Deploy to Render.com (⭐ HIGHLY RECOMMENDED for Full-Stack Apps)
**Render.com** is free and runs custom Express backend servers (`server.ts`) and database APIs seamlessly 24/7.

1. Go to [render.com](https://render.com/) and sign up using your **GitHub account**.
2. Click **+ New > Web Service**.
3. Select your `geetas-masale-store` GitHub repository and click **Connect**.
4. Configure the settings:
   - **Name**: `geetas-masale-live`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add all the `VITE_FIREBASE_...` keys from your `.env` file.
6. Click **Create Web Service**. In 2-3 minutes, Render will give you a live HTTPS URL (e.g., `https://geetas-masale.onrender.com`)!

---

### Option B: Deploy to Vercel (Great for Frontend Speed)
**Vercel** is lightning fast for React static sites. 

1. Go to [vercel.com](https://vercel.com/) and sign up with **GitHub**.
2. Click **Add New... > Project**.
3. Import your `geetas-masale-store` repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and paste your `VITE_FIREBASE_...` keys.
6. Click **Deploy**. Your site will go live immediately on a `.vercel.app` domain!

---

## 💡 Quick Tips for Managing Your Store

- **Accessing the Admin Dashboard**: On your website's footer, look for the small **"🔑 Manage Store (Admin)"** link near the address line. Clicking this opens your admin panel workspace.
- **Custom Domains**: Both Vercel and Render have a **"Custom Domains"** tab in project settings where you can type your Hostinger or GoDaddy domain name (e.g., `geetasmasale.com`) and follow their simple DNS record instructions.
