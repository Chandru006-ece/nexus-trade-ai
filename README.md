<p align="center">
  <strong>⚡ NexusTrade AI</strong><br/>
  <em>Carbon-Aware Intelligent Logistics Dashboard</em>
</p>

---

## 📋 Table of Contents

1. [Project Description](#-project-description)
2. [Problem Statement](#-problem-statement)
3. [Solution Overview](#-solution-overview)
4. [Features](#-features)
5. [Tech Stack](#-tech-stack)
6. [System Architecture](#-system-architecture)
7. [How to Run Locally](#-how-to-run-locally)
8. [Deployment (Vercel)](#-deployment-vercel)
9. [Future Scope](#-future-scope)
10. [Screenshots](#-screenshots)

---

## 🚀 Project Description

**NexusTrade AI** is a production-quality smart logistics dashboard that computes optimal delivery routes by balancing **distance**, **carbon emissions**, and **transit delay**. It uses graph-based routing (ParcelFlow), carbon estimation (GreenChain), ML-driven delay prediction (TradeMind AI), and a weighted decision engine to select the most eco-efficient path.

---

## 🧩 Problem Statement

Traditional logistics platforms optimize for speed or cost but ignore environmental impact. Rising CO₂ emissions from freight transport contribute significantly to climate change. There is a growing need for intelligent systems that factor in sustainability alongside operational efficiency.

---

## 💡 Solution Overview

NexusTrade AI computes multiple delivery routes between logistics hubs and evaluates each one using three key metrics:

- **Distance** — Total path length in km
- **Carbon Emission** — Estimated CO₂ output (distance × 0.2 kg/km)
- **Delay** — Predicted transit delay using a trained Linear Regression model

A weighted **decision score** combines these metrics:

```
score = (0.4 × carbon) + (0.3 × distance) + (0.3 × delay)
```

The route with the **lowest score** is selected as the optimal, carbon-aware choice.

---

## ✨ Features

- 🗺️ **Interactive Leaflet Map** — Visualize all logistics hubs and routes on OpenStreetMap
- 🟢 **Best Route Highlighting** — Optimal route drawn with a thick green line and glowing markers
- 📊 **Route Comparison Panel** — See distance, CO₂, delay, and score for every route
- ⚡ **One-Click Optimization** — Staged loading with real-time status messages
- 🌿 **Carbon-Aware Scoring** — Weighted decision engine prioritizing sustainability
- 🤖 **ML Delay Prediction** — scikit-learn Linear Regression model trained on synthetic traffic data
- 🎨 **Premium Dark UI** — Glassmorphism, smooth animations, and modern typography

---

## 🛠️ Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS 4            |
| Maps      | Leaflet, react-leaflet, OpenStreetMap     |
| Backend   | Node.js, Express                          |
| AI/ML     | Python, scikit-learn, NetworkX, NumPy     |
| Hosting   | Vercel (frontend), Local (backend)        |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Header  │  │   MapView    │  │    DataPanel        │  │
│  │         │  │  (Leaflet)   │  │  Routes + Metrics   │  │
│  └─────────┘  └──────────────┘  └────────────────────┘  │
│                        │                                 │
│                   GET /optimize                          │
└────────────────────────┼─────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────┐
│                   BACKEND (Express)                      │
│                        │                                 │
│              exec("python main.py")                      │
│                        │                                 │
│  ┌─────────────────────┼──────────────────────────────┐  │
│  │              PYTHON CORE LOGIC                     │  │
│  │  ┌───────────┐ ┌───────────┐ ┌──────────────────┐ │  │
│  │  │ ParcelFlow│ │ GreenChain│ │   TradeMind AI   │ │  │
│  │  │  (Routes) │ │ (Carbon)  │ │ (Delay Predict)  │ │  │
│  │  └───────────┘ └───────────┘ └──────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🖥️ How to Run Locally

### Prerequisites

- Node.js 18+
- Python 3.8+ with pip

### 1. Clone the Repository

```bash
git clone https://github.com/Chandru006-ece/nexus-trade-ai.git
cd NexusTrade-AI
```

### 2. Install Python Dependencies

```bash
cd python
pip install -r requirements.txt
cd ..
```

### 3. Start the Backend

```bash
cd backend
npm install
npm start
```

The API server will run on `http://localhost:3000`.

### 4. Start the Frontend

```bash
cd frontend
cp .env.example .env     # optional — defaults to localhost:3000
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌍 Deployment (Vercel)

### Frontend Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set the **Root Directory** to `frontend`
4. **Framework Preset**: Vite
5. Click **Deploy**

### Backend Note

The Express backend uses Python (exec). For full Vercel deployment, consider:
- Porting the Python logic to JavaScript
- Using Vercel Serverless Functions
- Deploying the backend separately on Render or Railway (free tier)

---

## 🔮 Future Scope

- 🌦️ **Real-Time Weather Integration** — Factor live weather into delay predictions
- 📦 **Multi-Parcel Batching** — Optimize routes for multiple deliveries simultaneously
- 🔐 **User Authentication** — Role-based access for fleet managers
- 📈 **Historical Analytics** — Track and visualize carbon savings over time
- 🗣️ **Natural Language Queries** — Ask "What's the greenest route to Chennai?"
- 🚛 **Vehicle Type Selection** — Different emission factors for trucks, EVs, drones
- 📱 **Mobile App** — React Native companion for drivers

---

## 📸 Screenshots

> _Coming soon — run the app locally and click **Optimize Route** to see the dashboard in action._

---

## 🚀 GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: NexusTrade AI – Carbon-Aware Logistics Dashboard"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for a greener future
</p>
