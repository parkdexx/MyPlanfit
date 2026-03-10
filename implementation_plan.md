# Implementation Plan: MyPlanfit MVP

## Goal Description
Develop the MVP (Minimum Viable Product) for **MyPlanfit**, an application designed to encourage users to work out using custom exercise groups and to log their fitness journey. 
The application will be built using Vite+React for the frontend, Node.js+Express/MySQL for the backend, and will deploy to GCP (Google Cloud Platform), utilizing free-tier services.

## User Review Required
> [!IMPORTANT]
> - **GCP Free Tier Limitations**: The plan utilizes GCP free tier compute instances (e2-micro) and Cloud SQL (if eligible) or a free-tier remote DB database (e.g., PlanetScale, Supabase) to keep costs near zero. We need to implement strict rate-limiting (e.g., `express-rate-limit`) to prevent API abuse that could lead to billing surprises.
> - **Ouroboros Socratic Clarifications Applied**:
>   - `DAY_PLAN` is a reusable **Template**.
>   - The moment an exercise is logged (first set completion), a **History Record** is created for that date, separate from the Template.
>   - A User has only **1 `MY_PLAN`** (acts simply as the user's root identifier for their plans).
>   - A `DAY_PLAN` can be empty or contain `EXERCISE_PLAN`s, which can be empty or contain `SET_PLAN`s.
>   - When adding a new `SET_PLAN` during a workout, its default weight/reps will inherit from the **immediately preceding set** in that specific exercise. If it's the first set, it defaults to 0kg/0reps.
>   - A `SET_PLAN` can be marked as **"완료" (Done)** or **"포기" (Give Up)**. Once all mapped sets have one of these statuses, the `EXERCISE_PLAN` is considered complete.

## Proposed Changes

---

### [Database & Backend Schema]
The database will be structured to separate Templates from History.

#### [NEW] `schema.sql` (Conceptual)
```sql
-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template Hierarchy
CREATE TABLE day_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE exercise_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_plan_id INT NOT NULL,
  name VARCHAR(100) NOT NULL, -- e.g., "Squat"
  youtube_url VARCHAR(255),
  order_index INT,
  FOREIGN KEY (day_plan_id) REFERENCES day_plans(id) ON DELETE CASCADE
);

CREATE TABLE set_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exercise_plan_id INT NOT NULL,
  weight_kg DECIMAL(5,2) DEFAULT 0,
  reps INT DEFAULT 0,
  order_index INT,
  FOREIGN KEY (exercise_plan_id) REFERENCES exercise_plans(id) ON DELETE CASCADE
);

-- History Hierarchy (Instantiated per day)
CREATE TABLE workout_history_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day_plan_id INT, -- Reference to the template used
  workout_date DATE NOT NULL,
  completed_at TIMESTAMP,
  UNIQUE(user_id, workout_date) -- One record per user per day
);

CREATE TABLE workout_history_exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  history_day_id INT NOT NULL,
  exercise_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (history_day_id) REFERENCES workout_history_days(id) ON DELETE CASCADE
);

CREATE TABLE workout_history_sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  history_exercise_id INT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  reps INT NOT NULL,
  status ENUM('DONE', 'GIVEN_UP') NOT NULL,
  FOREIGN KEY (history_exercise_id) REFERENCES workout_history_exercises(id) ON DELETE CASCADE
);
```

#### [NEW] `server/middleware/rateLimiter.js`
Implementation of `express-rate-limit` to prevent abuse and excessive GCP billing.

---

### [Frontend/Backend Setup - Phase 0 & 1]
Set up the monorepo structure.

#### [NEW] `client/`
Vite + React frontend initialized with Toss-style minimal design system (CSS).
- Configure UI routing (`react-router-dom`).
- Mock views for Login, Signup, Home (Calendar + Day Plans), Day Plan Management, and Workout Execution.

#### [NEW] `server/`
Node.js + Express backend initialized.
- Configure DB connection pool.
- Setup basic JWT authentication middleware.

---

### [Feature Implementation Phases 2-7]

- **Phase 2 & 3 & 4 (Auth)**: Implement Register, Login, and Password recovery via Gmail SMTP. Integrate JWT.
- **Phase 5 (Home/Calendar)**: Fetch `day_plans` templates. Fetch `workout_history_days` to render calendar checkmarks. Implement the history detail modal showing "DONE/GIVEN_UP" status.
- **Phase 6 (Plan Setup)**: UI to manage `day_plans` > `exercise_plans` > `set_plans`. Implement the Socratic clarification: Day plans act purely as folders/templates.
- **Phase 7 (Workout Execution)**: 
  - Instantiation Logic: Clicking "Start" creates a `workout_history_days` record for today.
  - Set Logic: "Done" or "Give up" buttons per set.
  - Adding Sets dynamically: Default values inherit from the `previous_set.weight` and `previous_set.reps` (or 0/0 if first).

---

## Verification Plan

### Automated Tests
- We will set up a Jest + Supertest environment in the Node.js backend.
- We will write integration tests covering the instantiation of History records from Templates to ensure data integrity is maintained (History doesn't modify Templates).

### Manual Verification
1. Run `npm run dev` for both frontend and backend.
2. Register a new user and login.
3. Create a **Template**: `DAY_PLAN` > `EXERCISE_PLAN` ("Squat") > 3 `SET_PLAN`s (60kg/10reps).
4. Go to Home, click **Start Workout** for today.
5. In the Workout view, mark Set 1 as **DONE**, Set 2 as **GIVEN_UP**.
6. **Add a new Set 4**. Verify its default values instantly populate as the values from Set 3.
7. Complete the workout.
8. Go back to the original Template settings -> Verify the Template remains unchanged (60kg/10reps x 3 sets).
9. Click today on the Calendar -> Verify the history perfectly reflects the DONE and GIVEN_UP statuses.
