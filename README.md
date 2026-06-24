# QueueCure 🏥

> Real-Time Digital Queue Management System for Clinics

QueueCure eliminates paper token slips and manual queue management from clinics by providing a live, synchronized queue system for receptionists and patients.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-v18+-brightgreen)
![MongoDB](https://img.shields.io/badge/database-MongoDB_Atlas-green)
![Socket.IO](https://img.shields.io/badge/realtime-Socket.IO-black)

---

## 🚀 Live Demo

| Interface | URL |
|-----------|-----|
| Receptionist Dashboard | `http://localhost:5173/receptionist` |
| Patient Portal | `http://localhost:5173/patient` |

---

## 🧩 Problem Statement

More than 75% of small and medium clinics in India still rely on paper tokens and verbal announcements. Patients wait for hours without knowing their position. Receptionists struggle to manage walk-ins and appointments simultaneously.

**QueueCure solves this.**

---

## ✅ Features

### Receptionist Dashboard
- Generate tokens instantly for walk-in patients
- Call next patient with one click
- Manage appointments — approve, reject, reschedule
- Mark patients as no-show
- Live queue monitoring
- Analytics — patients served, avg wait time, no-shows

### Patient Portal
- Track token position in real time
- View estimated wait time
- See how many patients are ahead
- Receive live updates without refreshing
- Queue progress stepper

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Vite, CSS3 |
| Backend | Node.js, Express.js |
| Real-Time | Socket.IO |
| Database | MongoDB Atlas, Mongoose |

---

## 📁 Project Structure
queue-cure-26/

│

├── backend/

│   ├── config/          # MongoDB connection

│   ├── models/          # Mongoose schemas

│   ├── routes/          # REST API routes

│   ├── services/        # Business logic

│   ├── sockets/         # Socket.IO handlers

│   └── index.js         # Entry point

│

├── frontend/

│   └── src/

│       ├── components/  # React components

│       ├── hooks/       # Custom hooks

│       ├── services/    # API calls

│       └── context/     # Queue context

│

└── docs/                # Architecture and API docs

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/Mayur-web03/queue-cure-26.git
cd queue-cure-26
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=4000
```

Start backend:

```bash
node index.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
Receptionist → http://localhost:5173/receptionist

Patient      → http://localhost:5173/patient

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `add_patient` | Client → Server | Add patient to queue |
| `call_next` | Client → Server | Call next token |
| `mark_no_show` | Client → Server | Mark patient as no-show |
| `reset_queue` | Client → Server | Reset entire queue |
| `queue_update` | Server → All | Broadcast queue state |
| `book_appointment` | Client → Server | Book appointment |
| `appointment_arrived` | Client → Server | Mark appointment arrived |

---

## 📊 Database Collections

| Collection | Purpose |
|------------|---------|
| `patients` | All patient records |
| `queuepatients` | Active queue state |
| `appointments` | Appointment management |
| `consultations` | Consultation history |
| `queuesettings` | Clinic configuration |

---

## 🧠 Smart Wait Time

QueueCure calculates wait times from real consultation data:
Estimated Wait = Position × Average Consultation Duration

Average is computed from previously completed consultations — not hardcoded. Gets more accurate over time.

---

## 🏗 Architecture
┌─────────────────────────┐

│    Receptionist View    │

│  React + Socket.IO      │

└────────────┬────────────┘

│ Socket Events

▼

┌─────────────────────────┐

│   Node.js + Express     │

│   Queue Engine          │

│   Appointment Manager   │

│   Analytics Engine      │

└────────────┬────────────┘

│ Mongoose ODM

▼

┌─────────────────────────┐

│     MongoDB Atlas       │

│  patients               │

│  queuepatients          │

│  appointments           │

└────────────┬────────────┘

│ Socket Broadcast

▼

┌─────────────────────────┐

│     Patient Portal      │

│  React + Socket.IO      │

└─────────────────────────┘

---

## 🚀 Current Capabilities

### Real-Time Queue Management
- Generate tokens instantly
- Call next patient
- Live queue synchronization using Socket.IO
- Queue persistence using MongoDB
- Automatic queue recovery after server restart

### Appointment Management
- Book appointments
- Approve appointments
- Reject appointments
- Reschedule appointments
- Cancel appointments
- Mark appointment arrivals
- Automatically convert arrived appointments into queue tokens

### Patient Tracking
- Track token position in real time
- View patients ahead in queue
- View estimated waiting time
- Live queue progress updates
- Token persistence across refreshes

### Analytics & Reporting
- Total patients served
- Average consultation duration
- Average wait time
- Active queue count
- No-show tracking
- Daily analytics dashboard

### Database Features
- MongoDB Atlas integration
- Mongoose schema validation
- Persistent patient records
- Persistent appointment records
- Persistent queue state

### Reliability Features
- No-show handling
- Queue restoration after restart
- Real-time synchronization
- Smart wait-time calculation
- Token verification system

---

## 🎯 Project Outcome

QueueCure successfully transforms traditional paper-based clinic queue systems into a real-time digital platform.

The system enables receptionists to manage walk-in patients and appointments efficiently while allowing patients to track their queue position, waiting time, and token status from a live synchronized interface.

By combining React, Node.js, Socket.IO, MongoDB Atlas, and Mongoose, QueueCure delivers a scalable, persistent, and real-time clinic queue management solution.

---

## 👨‍💻 Built For

> Hackathon Project 2026 — solving real-world clinic queue problems in India

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
