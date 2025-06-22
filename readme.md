# Squares Project

A fullstack web application for creating and rendering colored squares in a dynamic grid layout with support for offline mode, visual status indicators, and backend storage. Built with React, Tailwind CSS, and ASP.NET Core.

---

## 🔧 Features

- Add squares with randomly assigned colors (never same as previous)
- Unique, ID for each square – no duplicates
- Offline mode: squares are added locally and auto-synced when back online
- Stable layout: colors and positions are preserved after refresh
- Reset button clears both backend and frontend state
- Visual indicators for server connection and syncing status
- RESTful backend with JSON file storage (no database needed)

---

## 🖥️ Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- ASP.NET Core (Minimal API)
- JSON file-based storage

---

## 🚀 Getting Started

### 1. Start the backend API (C#)

Make sure you’re in the **server/backend directory** (where `Program.cs` is located):

```bash
dotnet run
```

This starts the API at:  
`http://localhost:5000/api/square`

### 2. Start the frontend (React + Vite)

In a new terminal, navigate to the **frontend project folder** (where `package.json` is):

```bash
npm install      # Install dependencies (only needed once)
npm run dev      # Start the dev server
```

Frontend will run at:  
`http://localhost:5173`

---

## 📁 Project Structure

```
SquaresProject/
│
├── backend/
│   ├── Program.cs
│   ├── SquaresController.cs
│   ├── Square.cs
│   ├── square.json
│   └── appsettings*.json
│
├── frontend/
│   ├── App.jsx
│   ├── components/
│   │   └── Square.jsx
│   ├── helpers/
│   │   └── squareHelpers.js
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
```

---

## 📦 Installed NPM Packages

- `react`
- `react-dom`
- `vite`
- `tailwindcss`
- `postcss`
- `autoprefixer`

---

## ⚠️ Known Limitations

- If you spam "Add square" exactly when the server goes offline, some squares may remain unsynced without warning.
- Layout placement logic is sensitive. Do not modify the grid system unless fully understood.
- Backend has no authentication or security layers – intended for educational/demo use only.

---

## 📃 License

MIT – use freely for personal, educational, or portfolio purposes.
