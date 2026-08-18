# GymTrack &mdash; Full-Stack Gym Workout Logger

GymTrack is a production-ready, personal workout logger application that helps users track, log, and analyze their gym progress. It features a responsive React client, a secure Django REST API backend, JWT authentication, and interactive progress metrics.

---

## 1. Problem & Solution

### Problem
When working out, people frequently forget how much weight or how many reps they performed in their previous sessions. Checking notebook logs is tedious, and existing apps are either too complicated or lack secure, private progress analysis.

### Solution
GymTrack offers a streamlined, private, and responsive personal logger. Users log sessions with exercises on specific dates, and the app automatically transforms this history into personal records, training streaks, and progression charts.

---

## 2. Features

* **JWT-Authenticated Access**: Private, secure accounts with token refresh mechanisms.
* **Granular Ownership Enforcement**: Server-side checks ensure you only see, edit, or delete your own data.
* **Single-Transaction Logging**: Log a complete workout session with multiple exercises dynamically in a single form.
* **Automatic Insights**: View total workouts, sets, and reps calculated on-the-fly.
* **Personal Records (PRs)**: Tracks the maximum weight lifted for each exercise.
* **Progress Charts**: Select any exercise to view interactive weight progression charts using Recharts.
* **Workout Streak Counter**: Keeps you motivated by tracking consecutive days of training.
* **Polished Responsive Design**: Sleek, sporty dark mode UI built with Tailwind CSS, optimized for mobile, tablet, and desktop screens.

---

## 3. Tech Stack

### Frontend
* **React** & **Vite** (JavaScript, HTML, CSS)
* **Tailwind CSS** (v4)
* **React Router Dom** (v6)
* **Axios** (With request and response interceptors for JWT injection and token refresh)
* **Recharts** (Line chart visualizations)
* **Lucide React** (Sporty icons)

### Backend
* **Python** (3.12)
* **Django** (Web framework)
* **Django REST Framework (DRF)** (REST API development)
* **djangorestframework-simplejwt** (JWT authentication)
* **django-cors-headers** (CORS management)
* **python-dotenv** (Environment variable loader)

### Database
* **SQLite**: Default for local development.
* **PostgreSQL**: Supported out-of-the-box in production settings.

---

## 4. Architecture

```text
                    USER
                      |
                      v
              React Frontend
                      |
           HTTPS (JSON / Bearer JWT)
                      |
                      v
              Django REST API
                      |
           Django ORM (SQL Queries)
                      |
                      v
             PostgreSQL / SQLite
```

* The **React Frontend** manages UI state, form validation, route authorization, and queries the backend via REST.
* The **Django Backend** enforces security, manages auth, database migrations, and serializes records.

---

## 5. Database Schema

```text
    +------------------+          +------------------+          +------------------+
    |    Django User   |          |  WorkoutSession  |          |     Exercise     |
    +------------------+          +------------------+          +------------------+
    | id (PK)          | <-----+  | id (PK)          | <-----+  | id (PK)          |
    | username         |          | date (Date)      |          | name (CharField) |
    | email            |          | owner_id (FK)    |          | sets (Positive)  |
    | password         |          | created_at       |          | reps (Positive)  |
    +------------------+          +------------------+          | weight (Decimal) |
                                                                | session_id (FK)  |
                                                                | created_at       |
                                                                +------------------+
```

---

## 6. API Overview

| Endpoint | HTTP Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register/` | POST | No | Create user account |
| `/api/auth/login/` | POST | No | Login and get JWT token pair |
| `/api/auth/refresh/` | POST | No | Refresh expired access token |
| `/api/workouts/` | GET | Yes | List workouts for current user |
| `/api/workouts/` | POST | Yes | Save workout with nested exercises |
| `/api/workouts/<id>/` | GET | Yes | Retrieve single workout session |
| `/api/workouts/<id>/` | PUT/PATCH | Yes | Update workout date |
| `/api/workouts/<id>/` | DELETE | Yes | Delete workout and its exercises |
| `/api/workouts/<workout_id>/exercises/` | POST | Yes | Add exercise to existing workout |
| `/api/exercises/<id>/` | PUT/PATCH | Yes | Edit sets/reps/weight of an exercise |
| `/api/exercises/<id>/` | DELETE | Yes | Delete a specific exercise |

---

## 7. Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside `backend/`:
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Optional PostgreSQL configuration for production:
# DB_NAME=gymtrack
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_HOST=localhost
# DB_PORT=5432
```

### Frontend (`frontend/.env`)
Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 8. Local Setup & Execution

### Prerequisites
* Python 3.10+
* Node.js v18+ & NPM

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Create a superuser (for admin access):
   ```bash
   python manage.py createsuperuser
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The backend will be running at `http://127.0.0.1:8000/`.

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173/`.

---

## 9. Deployment Preparation

### Backend
1. Freeze requirements:
   ```bash
   pip freeze > requirements.txt
   ```
2. In production env, set `DEBUG=False` and specify your production domains in `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.
3. Configure `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` for your production PostgreSQL instance.

### Frontend
1. Compile the build bundle:
   ```bash
   npm run build
   ```
2. Deploy the static contents of the `dist/` directory to static hosting services (Vercel, Netlify, AWS S3, etc.). Ensure `VITE_API_URL` environment variable points to your deployed backend API domain.

---

## 10. Future Improvements (Unimplemented)

* **Exercise Database**: Integrated library with demonstration videos and instruction cards.
* **Workout Templates**: Save workout blueprints to log routine sessions faster.
* **Advanced Metrics**: Charts detailing volume trends and muscle group training ratios.
* **Bodyweight & Progress Photos**: Track body fat percentages and upload visual checks.
* **Wearable Integration**: Synchronize data with Apple Health, Google Fit, or Fitbit.
* **AI Personal Coach**: Automated suggestions for weights, reps, and sets targets.

