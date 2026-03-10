# MyPlanfit 🏋️‍♂️

**MyPlanfit** is a goal-oriented workout management application designed to help users create custom workout routines, stay motivated, and maintain a consistent exercise log.

## 🎯 Project Overview
The primary goal of MyPlanfit is to bridge the gap between planning and execution. It allows users to organize their workouts into a structured hierarchy and provides a seamless "Exercise Mode" to track progress in real-time.

### Key Hierarchy:
`MY_PLAN` 📂 → `DAY_PLAN` 📂 → `EXERCISE_PLAN` 📂 → `SET_PLAN` 📄
*(e.g., General Routine → Monday/Chest Day → Bench Press → 80kg / 10 reps)*

---

## ✨ Core Features
- **Structured Workout Planning:** Create multi-layered plans (Day > Exercise > Sets).
- **Intuitive Exercise Library:** Categorized by body parts with YouTube-linked video guides.
- **Smart Set Tracking:** Automatically carries over weight/reps from previous sets for faster logging.
- **Progress Calendar:** Visualizes workout consistency; click on any date to view detailed historical logs.
- **Auto-Save:** All progress is saved instantly without the need for a manual "Save" button.
- **Completion Rewards:** Motivational modals and visual feedback upon finishing a routine.

---

## 🛠 Tech Stack
- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Infrastructure:** Google Cloud Platform (GCP)
- **Styling:** Modern and Minimalist (Toss-style UI)
- **Authentication:** Email-based JWT with SMTP verification

---

## 🚀 Development Roadmap

### Phase 0-1: Infrastructure & UI Framing
- Setting up the Vite+React and Node.js skeleton.
- Designing mockups for Login, Home, and Workout screens.

### Phase 2-4: Authentication & Security
- Implementing secure login/signup with email verification (Gmail SMTP).
- Password recovery systems and SQL injection prevention.

### Phase 5-7: Core Logic & Exercise Mode
- Building the Home Dashboard with the Workout Calendar.
- Developing the Plan Configuration screen (CRUD for routines).
- Implementing the "Active Workout" mode for real-time set tracking.

---

## 🛡 Security & Cost Optimization (GCP)
To keep the project within the free/low-cost tier and prevent malicious usage:
- **Rate Limiting:** Implemented on the backend to prevent API abuse and excessive egress costs.
- **Request Validation:** Strict input validation to prevent SQL Injection and XSS.
- **GCP Budgets:** Set up automated alerts to monitor cloud spending.