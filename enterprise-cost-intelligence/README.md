# AI Enterprise Cost Intelligence

An autonomous financial intelligence system that monitors enterprise data, detects inefficiencies, explains root causes in plain English, suggests/simulates corrective actions, and quantifies financial impact. Built with a modern, dark-themed, glassmorphic UI.

## Features
- **Multi-Agent Architecture**: Separate AI logic for data processing, detection, reasoning, acting, and impact calculation.
- **Explainable AI**: Every flagged anomaly is accompanied by a plain-language explanation of its root cause and confidence level.
- **Autonomous Remediation**: Simulate taking real actions natively within the mock enterprise environment (e.g., Canceling rogue SaaS contracts or fixing AWS scaling instances).
- **Interactive CFO Dashboard**: Animated KPI charts, live tickers for capital recovered, and dynamic timeline visualization.

## Tech Stack
- **Backend**: FastAPI, Pandas, Scikit-learn (Isolation Forest)
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts

## Setup Instructions

### 1. Start the Backend API
Navigate to the `backend` directory, install requirements, and run the FastAPI server:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend Application
Navigate to the `frontend` directory, install dependencies, and run the Vite server:

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application
Open [http://localhost:5173/](http://localhost:5173/) in your web browser. Click the "**Ingest Data**" button at the top right to kickstart the multi-agent AI flow and generate the synthetic dataset.

---
**Hackathon Notes**
- Demonstrates a fully-closed feedback loop (Detect -> Explain -> Recommend -> Act -> Measure).
- Generates beautiful, responsive visualizations out of the box.
- Synthetic dataset provides immediate value without relying on proprietary or PII enterprise info.
