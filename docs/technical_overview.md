# Technical Overview

**Architecture**
- Backend: `Flask` app (`app.py`) serving HTML templates and JSON APIs.
- ORM: `SQLAlchemy` with SQLite by default; optional Postgres via `DATABASE_URL` (app.py:26–37).
- Frontend: Jinja2 templates with `Bootstrap 5`, `Chart.js`, Google Maps JS, and custom JS/CSS.
- Background: Canvas-based animated water effect (`static/js/global_ripple.js`, `static/style.css`).
- Exports: `pandas` + `openpyxl` for CSV/Excel download (app.py:406–446).
- Chatbot: Hugging Face Inference Router via HTTPS (app.py:221–352).
- IoT: ESP32 posts readings to `/api/iot`; Sensors page polls latest and computes WQI.

**Key Modules**
- Data models:
  - `Location` (app.py:79–85) — coordinates with optional name.
  - `WaterSample` (app.py:87–98) — pH, DO, TDS, turbidity, nitrate, temperature, WQI.
  - `IoTReading` (app.py:100–105) — sensor table for latest readings (temperature, pH, turbidity).
- WQI logic:
  - `calculate_wqi(data)` (app.py:117–173) — dynamic weights from `STANDARD` values, temperature handled as absolute deviation from ideal.
  - `get_status(wqi)` (app.py:176–188) — standard 5-tier classification and color mapping.
- UI pages:
  - `index.html`, `map.html`, `data.html`, `dashboard.html`, `chatbot.html`, `sensors.html` extend `layout.html`.

**Chatbot**
- Endpoint: `POST /chat` (app.py:221–352).
- Model: `HuggingFaceTB/SmolLM3-3B:hf-inference` by default (app.py:237), configurable via `HF_CHAT_MODEL`.
- Why this model:
  - Lightweight 3B parameter size → fast responses and low memory on HF Inference API.
  - Good general-purpose Q&A with reasonable coherence at low cost.
  - Inference hosted by Hugging Face Router → simple integration using `requests`.
- Request config:
  - `max_tokens=3000`, `temperature=0.7`, system prompt encouraging compact, complete answers.
- Output cleaning:
  - Server: `clean_response()` removes `<think>` sections and “Thinking Process:” (app.py:107–115).
  - Client: `static/chatbot.js` strips chain-of-thought and asterisks, enforces send delay.

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
  - `GOOGLE_MAPS_API_KEY` for `templates/map.html`.
  - `HUGGING_FACE_API_TOKEN` for `/chat`.
  - `HF_CHAT_MODEL` optional override of the default model.
  - `DATABASE_URL` optional Postgres URI.
- App start:
  - `python app.py` (dev with debug mode).
  - `gunicorn app:app` (prod via `Procfile`).

**Performance Notes**
- Server calculates WQI on-demand if missing; latest sample per location is used.
- IoT endpoint returns a minimal JSON with only the latest reading to reduce payload and complexity.
- Canvas background animation is lightweight and capped to several sine layers.
- Chatbot enforces a minimum delay between sends to avoid spamming backend.
