# 🏛️ Nyaya-Lipi (न्याय-लिपि)

> **Enterprise Ambient Digital Witness & Cryptographic Legal FIR Ledger System for Uttar Pradesh Police (उत्तर प्रदेश पुलिस)**
> Designed under **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 Section 173 & Section 176** for tamper-proof audio evidence collection, real-time Devanagari Hindi STT transcription, and automated bilingual legal FIR synthesis.

---

[![Architecture](https://img.shields.io/badge/BNSS%202023-Section%20173%20Compliant-gold.svg)](#system-architecture)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-blue.svg)](#tech-stack)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](#tech-stack)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-purple.svg)](#tech-stack)
[![Deployment](https://img.shields.io/badge/Deployments-Vercel%20%26%20Render-black.svg)](#deployment-guide)

---

## 📌 Executive Summary

**Nyaya-Lipi (न्याय-लिपि)** is an impartial, edge-to-cloud ambient digital witness system built for **Uttar Pradesh Police**. It records real-time verbal communications between police officers and complainants during station interviews, streams spoken Hindi/English text line-by-line via browser Speech-to-Text (STT), extracts legal facts using Devanagari Hindi NLP, auto-maps **Bharatiya Nyaya Sanhita (BNS, 2023)** penal codes, locks tamper-proof SHA-256 Merkle root proofs into MongoDB Atlas, and synthesizes official **Bilingual (English & Hindi) Form-I FIR Legal Documents**.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Station ["Police Station Ambient Sensor Node"]
        A1["Officer-Complainant Spoken Interview"] -->|Microphone Audio Stream| A2["Web MediaRecorder API (Real Audio Blob)"]
        A1 -->|Speech-to-Text STT (hi-IN / en-IN)| A3["Real-Time Verbatim Transcripts"]
        A4["Officer Manual Typed Notes"] --> A5["BNS Penal Code Selection"]
    end

    subgraph CoreEngine ["Nyaya-Lipi Intelligence Engine"]
        A3 --> B1["Devanagari Hindi & Indic Dialect NLP Parser"]
        B1 --> B2["Fact Entity Extraction (Stolen Items, Transport, Location)"]
        B2 --> B3["BNS 2023 Penal Code Auto-Mapper (Section 303(2), 304(2), etc.)"]
        
        A5 & B3 --> B4["Dual-Draft Fact Integrity & Discrepancy Analyzer"]
        B4 --> B5["Cryptographic SHA-256 Merkle Evidence Engine"]
    end

    subgraph Governance ["Cloud Ledger & Admin HQ Command"]
        B5 -->|Tamper-Proof Lock| C1[("MongoDB Atlas Database")]
        C1 --> C2["Central Admin HQ Command Portal (/admin)"]
        C2 --> C3["Embedded Raw Audio Voice Player"]
        C2 --> C4["Bilingual Form-I FIR Legal PDF Synthesizer"]
        C2 --> C5["24-Hour SP Oversight Escalation Countdown"]
    end
```

---

## ✨ Key Features & Capabilities

### 1. 🎙️ Live Ambient Microphone Sensor & Speech-to-Text (STT)
- Captures real-time natural interview conversation directly from police officer laptop microphones.
- Streams live transcripts in **Hindi (hi-IN)** and **English (en-IN)** line-by-line into the digital witness ledger.
- MediaRecorder API generates actual WebM/WAV audio blobs saved into MongoDB Atlas for audit playback.

### 2. 🧠 Devanagari Hindi NLP Entity Extractor & BNS 2023 Mapper
- Parses Devanagari Hindi terms (`'फ़ोन'`, `'फोन'`, `'चोरी'`, `'सैमसंग'`, `'ऑटो'`, `'रिक्शा'`, `'पर्स'`, `'नगदी'`, etc.).
- Automatically identifies stolen items (**Samsung Flip Mobile Phone / Purse / Cash**), transit mode (**Auto-Rickshaw**), and location.
- Auto-maps relevant **BNS 2023 Penal Sections** (e.g., **BNS Section 303(2) - Theft**, **BNS Section 304(2) - Snatching in Transit**).

### 3. 🖥️ Side-by-Side Dual Workstation
- **Left Panel (AI Ambient Witness Draft)**: Displays live real-time speech transcripts, extracted fact entities, and auto-mapped legal sections.
- **Right Panel (Officer Manual Editor)**: Officer types manual interview notes simultaneously while recording live audio.
- Computes **Dynamic Fact Integrity Scores**, narrative alignment percentages, and discrepancies.

### 4. 📄 Official Bilingual (English & Hindi) Form-I FIR PDF Generator
- Complies strictly with **BNSS Section 173**:
  - Official UP Police Crest Header ("UTTAR PRADESH POLICE / उत्तर प्रदेश पुलिस")
  - Station Code, Token Number, Complainant Particulars
  - **Synthesized Formal Police Narrative Statements**: Advocate-grade legal statements in both **English (Section 5A)** and **Hindi (Section 5B - प्रथम सूचना रिपोर्ट विवरण)** tailored to extracted facts.
  - **Cryptographic Evidence Seal**: Displays SHA-256 Audio Hash & Merkle Root Proof.

### 5. 🏛️ Central Admin HQ Master Command Portal (`/admin`)
- **Statewide Master FIR Registry**: View all station FIRs across Uttar Pradesh.
- **Embedded Web Audio Player**: Admin can listen to the actual recorded voice audio stream saved in the database.
- **Personnel Credentials Manager**: Onboard officers, assign Indian Police ranks (Inspector, SI, ASI, Constable, SP), edit profiles, and reset passwords.

### 6. ⏱️ 24-Hour Supervisor (SP) Escalation Engine
- Rejection of an FIR triggers an automated **24-Hour Oversight Countdown** under anti-suppression protocol.
- District Superintendent of Police (SP) receives real-time queue alerts to review or override FIR registrations.

---

## 🛠️ Tech Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | User Interface & Workstation |
| **Styling** | Vanilla CSS3, Glassmorphism, Dark Theme | Enterprise Police UI/UX |
| **Icons** | Lucide React | Modern Icons |
| **Backend API** | Node.js, Express.js, TypeScript | Core API Gateway & Business Logic |
| **Database** | MongoDB Atlas, Mongoose ODM | Cloud Ledger & Audit Logs |
| **Security** | JWT, bcryptjs, SHA-256 Merkle Tree | Cryptographic Hash Seals & Auth |
| **Audio & STT** | Web Speech API, MediaRecorder API | Real-Time Voice Recording & STT |
| **AI Orchestrator** | Python 3.10+, FastAPI, LangGraph | Multi-Agent Legal Mapping Pipeline |

---

## 📁 Repository Structure

```
Nyay-Lipi/
├── backend/                  # Node.js Express TypeScript API Server
│   ├── src/
│   │   ├── config/           # Database & Env Configuration
│   │   ├── controllers/      # Auth, Admin & FIR Controllers
│   │   ├── models/           # Mongoose Data Models (FIR, User, Station, BNSCode)
│   │   ├── routes/           # REST API Routes
│   │   ├── services/         # Merkle Engine, Similarity & Escalation Services
│   │   └── seed/             # UP Police Dataset Seeder
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React Vite TypeScript Web Application
│   ├── src/
│   │   ├── components/       # Workstation, Admin, PDF & Modal Components
│   │   ├── App.tsx           # Main Application Router & State
│   │   └── index.css         # Glassmorphism Design System
│   ├── package.json
│   └── vite.config.ts
├── ai-service/               # Python FastAPI LangGraph Multi-Agent Engine
│   ├── app/
│   └── main.py
├── vercel.json               # Vercel Deployment & API Proxy Config
├── render.yaml               # Render Backend Blueprint Config
├── README.md                 # Project Documentation
└── .gitignore
```

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Active MongoDB Atlas cluster or local MongoDB instance

### 1. Clone Repository
```bash
git clone https://github.com/SaumyaPratapSingh-cyber/Nyay-Lipi.git
cd Nyay-Lipi
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

Seed UP Police Stations, Admin, and BNS Dataset:
```bash
npm run seed:demo
```

Start Backend API Gateway (Port 5000):
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in Google Chrome or Microsoft Edge.

---

## 🔑 System Authentication Overview

- System Administrator & Station Officer credentials can be provisioned directly via the Admin HQ Portal (`/admin`).

---

## 🚀 Deployment Guide

### 1. Deploy Frontend on Vercel
1. Push project repository to GitHub: `https://github.com/SaumyaPratapSingh-cyber/Nyay-Lipi.git`
2. Go to [Vercel Dashboard](https://vercel.com/) and click **`Add New Project`**.
3. Import `SaumyaPratapSingh-cyber/Nyay-Lipi`.
4. Set Environment Variable: `VITE_API_URL` (pointing to your live backend domain).
5. Click **`Deploy`**.

### 2. Deploy Backend on Render
1. Go to [Render Dashboard](https://render.com/) and click **`New Web Service`**.
2. Connect your `SaumyaPratapSingh-cyber/Nyay-Lipi` repository.
3. Configure environment variables in Render Dashboard:
   - `MONGODB_URI`: `<Your Private MongoDB Connection String>`
   - `JWT_SECRET`: `<Your Private Secret Key>`
4. Click **`Deploy`**.

---

## 📜 License & Compliance

Developed under the governance guidelines of **Uttar Pradesh Police (उत्तर प्रदेश पुलिस)** and **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**.
