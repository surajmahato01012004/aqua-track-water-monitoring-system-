# Technical Overview

**Architecture**
- Backend: Flask app (app.py) serving HTML templates and JSON APIs.
- ORM: SQLAlchemy with SQLite by default; optional Postgres via `DATABASE_URL`.
- Frontend: Jinja2 templates with Bootstrap 5, Chart.js, Google Maps JS, and custom JS/CSS.
- Background: Canvas-based animated water effect (static/js/global_ripple.js, static/style.css).
- Exports: pandas + openpyxl for CSV/Excel download.
- Chatbot: Hugging Face Inference Router via HTTPS.
- IoT: ESP32 posts readings to `/api/iot`; Sensors page polls latest and computes WQI.
- Auth: Client-side localStorage with SHA-256 password hashing, pages at `/login`, `/signup`, `/user-dashboard`.

**Key Modules**
- Data models:
  - Location — coordinates with optional name.
  - WaterSample — pH, DO, TDS, turbidity, nitrate, temperature, WQI.
  - IoTReading — temperature, pH, turbidity with timestamps.
- WQI logic:
  - `calculate_wqi(data)` — dynamic weights from standards, temperature handled as absolute deviation from ideal.
  - `get_status(wqi)` — standard 5-tier classification and color mapping.
- UI pages:
  - index.html, map.html, data.html, dashboard.html, chatbot.html, sensors.html extend layout.html.
  - Auth pages: login.html, signup.html, user_dashboard.html.

**Chatbot**
- Endpoint: `POST /chat` (relative path).
- Model: `HuggingFaceTB/SmolLM3-3B:hf-inference` by default, configurable via `HF_CHAT_MODEL`.
- Why this model:
  - Lightweight 3B parameter size for fast responses and low cost.
  - General-purpose Q&A with balanced performance.
  - Hosted on Hugging Face Router via HTTPS using requests.
- Request config:
  - `max_tokens=3000`, `temperature=0.7`, compact and complete answers.
- Output cleaning:
  - Server: `clean_response()` removes chain-of-thought sections.
  - Client: `static/chatbot.js` strips chain-of-thought formatting and asterisks; enforces send delay.

**Tech Stack Rationale**
- Flask + Jinja2:
  - Simple, productive, and well-supported for small-to-medium web apps.
  - Clean separation of templates and backend logic.
- SQLAlchemy:
  - DB-agnostic ORM — easy local SQLite, easy migration to Postgres.
  - Relationships for samples enable efficient latest-record queries.
- SQLite (dev) → Postgres (prod):
  - SQLite is frictionless locally; Postgres is robust and scalable in production.
- Bootstrap 5:
  - Rapid, accessible UI with consistent components and theming.
- Chart.js:
  - Minimal footprint for charts; perfect for WQI doughnut/bar visualizations.
- Google Maps:
  - Standard mapping APIs for markers and interactions.
- Pandas/OpenPyXL:
  - Easy tabular export to XLSX and CSV.
- Canvas background:
  - Smooth animation with good performance; highly themable for brand coherence.

**Configuration**
- Environment variables:
  - `GOOGLE_MAPS_API_KEY` for map.
  - `HUGGING_FACE_API_TOKEN` for `/chat`.
  - `HF_CHAT_MODEL` optional override of the default model.
  - `DATABASE_URL` optional Postgres URI.
- App start:
  - `python app.py` (dev).
  - `gunicorn app:app` (prod via Procfile).

**Performance Notes**
- Server calculates WQI on-demand; latest sample per location is used.
- IoT endpoint returns minimal JSON with only the latest reading.
- Canvas background animation is lightweight and capped to several sine layers.
- Chatbot enforces a minimum delay between sends to avoid spamming backend.
