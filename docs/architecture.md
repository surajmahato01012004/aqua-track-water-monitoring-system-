# Architectural Structure

**Overview**
- Monolithic Flask app serving pages and JSON APIs.
- SQLAlchemy ORM with SQLite (dev) and optional Postgres (prod).
- Frontend in Jinja2 + Bootstrap 5, with small JS modules for each page.
- Chatbot via external Hugging Face Router; IoT ingestion via REST.

**Components**
- Backend (app.py)
  - Routes: pages (`/`, `/dashboard`, `/map`, `/data`, `/chatbot.html`, `/sensors`, `/login`, `/signup`, `/user-dashboard`)
  - APIs: `/calculate`, `/api/locations`, `/api/wqi`, `/api/iot`, `/download_excel`, `/chat`
  - Models: `Location`, `WaterSample`, `IoTReading`
  - Services: WQI calculation, export generation, chatbot proxy
- Frontend (templates/, static/)
  - Layout: navbar, ripple background, content container
  - Pages: calculator, map, data CRUD, dashboard, chatbot, sensors, auth
  - JS: script.js (calculator), map.js, sensors.js, chatbot.js, auth.js, global_ripple.js
  - CSS: style.css, chatbot.css

**Data Flow**
- WQI
  - Input → `/calculate` → WQI + status → UI badges/charts.
  - Data page computes latest WQI per location from latest sample.
- IoT
  - ESP32 → `POST /api/iot` → DB (IoTReading) → `GET /api/iot` → Sensors/Dashboard render.
- Chatbot
  - UI → `POST /chat` → HF Router → cleaned response → UI.

**Auth Flow (Client-Side)**
- Signup/Login → localStorage email + SHA-256 password hash.
- Protected pages check localStorage and redirect to `/login` if absent.
- Dashboard shows email and logout clears localStorage.

**Status Mapping**
- WQI → `get_status(wqi)` → one of: Excellent, Good, Poor, Very Poor, Unfit.
- Colors align to Bootstrap palette for consistent badges.

**Deployment**
- Procfile runs Gunicorn.
- Environment variables configure external services (Maps, Chat model/token).
