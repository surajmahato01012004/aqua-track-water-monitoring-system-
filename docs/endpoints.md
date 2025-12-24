# Project Endpoints Reference

This document lists all UI pages and API endpoints exposed by the application, including methods, inputs, outputs, and notes. Code locations are provided for quick navigation.

## UI Pages
- `GET /` — Calculator page  
  - Renders `templates/index.html`  
  - Code: `app.py:200–206`
- `GET /dashboard` — Dashboard landing page  
  - Renders `templates/dashboard.html`  
  - Code: `app.py:208–210`
- `GET /map` — WQI map page  
  - Renders `templates/map.html` with `google_maps_key`  
  - Code: `app.py:212–215`
- `GET /data` — Database dashboard (locations + samples)  
  - Renders `templates/data.html` with computed/latest WQI per location  
  - Code: `app.py:335–405`
- `GET /chatbot.html` — AI chatbot UI  
  - Renders `templates/chatbot.html`  
  - Code: `app.py:217–219`

## APIs
- `POST /calculate` — Compute WQI for provided parameters  
  - Body JSON:  
    - `ph`, `do`, `turbidity`, `tds`, `nitrate`, `temperature` (floats; any missing are skipped)  
  - Response JSON:  
    - `wqi` (number), `status` (string), `color` (Bootstrap color key)  
  - Code: `app.py:445–452`

- `GET /api/locations` — List all locations with latest WQI  
  - Response JSON array items:  
    - `name`, `latitude`, `longitude`, `wqi`, `status`, `color`  
  - Notes: Computes WQI on-the-fly if missing; includes static West Bengal locations with color status derived from WQI  
  - Code: `app.py:454–495`

- `GET /api/wqi?lat=<float>&lng=<float>` — Nearest location WQI  
  - Query params: `lat`, `lng`  
  - Response JSON:  
    - `latitude`, `longitude`, `wqi`, `status`, `color`  
  - Errors: `400` invalid lat/lng; `404` when no locations or samples; `404` if no nearby location  
  - Code: `app.py:613–642`

- `POST /api/iot` — Ingest IoT sensor reading  
  - Body JSON:
    - Required: `temperature_c` (number, °C)
    - Optional: `ph` (number), `turbidity` or `turbidity_ntu` (number), `turbidity_percent` (number)
  - Response JSON: `{ "status": "ok", "id": <int>, "timestamp": "<ISO8601>" }` or `400` on invalid payload
  - Code: `app.py:594–612`

- `GET /api/iot` — Latest IoT sensor reading  
  - Response JSON:
    - Minimal shape with rounded fields: `temperature_c`, `ph`, `turbidity`, `timestamp`
    - `404` when no data present
  - Code: `app.py:592–600`

- `GET /download_excel` — Export CSV/Excel of locations and samples  
  - Response: streamed file (XLSX/CSV) including user data and static reference data, plus temperature  
  - Code: `app.py:406–446`

### CRUD (Forms)
- `POST /data/location` — Create location  
  - Form fields: `name` (optional), `latitude`, `longitude`  
  - Response JSON: `{ "status": "ok", "location_id": <int> }` or `400` on invalid input  
  - Code: `app.py:497–509`

- `POST /data/location/<id>/delete` — Delete location  
  - Cascades to delete associated samples  
  - Response JSON: `{ "status": "ok" }`  
  - Code: `app.py:511–515`

- `POST /data/sample` — Create sample  
  - Form fields: `location_id`, `ph`, `do`, `tds`, `turbidity`, `nitrate`, `temperature`  
  - Response JSON: `{ "status": "ok", "sample_id": <int> }` or `400` on invalid location  
  - Code: `app.py:517–538`

- `POST /data/sample/<id>/update` — Update latest sample  
  - Form fields: any of `ph`, `do`, `tds`, `turbidity`, `nitrate`, `temperature` (missing retains existing)  
  - Response JSON: `{ "status": "ok" }`  
  - Code: `app.py:540–566`

### Chatbot
- `POST /chat` — Chat completion via Hugging Face Router  
  - Body JSON: `{ "message": "<text>" }`  
  - Response JSON: `{ "reply": "<text>" }` or `{ "error": "<message>" }` with appropriate HTTP status (`400`, `500`, `502`)  
  - Environment: requires `HUGGING_FACE_API_TOKEN` and optional `HF_CHAT_MODEL`  
  - Code: `app.py:221–352`

## Status and Colors
- Status mapping via `get_status(wqi)` returns one of: `Excellent`, `Good`, `Poor`, `Very Poor`, `Unfit for Consumption`  
- Color mapping aligns with Bootstrap palette: `success`, `primary`, `warning`, `danger`, `dark`  
- Code: `app.py:176–188`

## Notes
- Auto-migration adds `temperature` column if missing (on startup)  
  - Code: `app.py:41–55`
- WQI calculation skips missing parameters and applies dynamic weights  
  - Code: `app.py:117–173`
