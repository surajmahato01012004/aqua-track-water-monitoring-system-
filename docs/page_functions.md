# Page Functions and Relationships

**Layout (`templates/layout.html`)**
- Provides navbar, default title, animated background container, and high-contrast content wrapper.
- Loads Bootstrap and site CSS/JS including `static/js/global_ripple.js`.

**Dashboard (`templates/dashboard.html`)**
- Entry page linking to Calculator, Map, Database, and Chatbot.
- Includes a scrolling hardware integration banner styled via `.marquee` CSS.

**Calculator (`templates/index.html`)**
- Lets users input parameters (`ph`, `do`, `turbidity`, `tds`, `nitrate`, `temperature`).
- Submits to `POST /calculate` (app.py:445–452).
- Displays WQI score, status, and a chart via `static/script.js`.

**Data (`templates/data.html`)**
- CRUD for locations and samples:
  - `POST /data/location` to add locations (app.py:497–509).
  - `POST /data/sample` to add samples with temperature (app.py:517–538).
  - `POST /data/sample/<id>/update` to edit latest sample (app.py:540–566).
  - `POST /data/location/<id>/delete` to delete a location (app.py:511–515).
- Shows static West Bengal data and user-added rows with latest WQI and status (`get_status`, app.py:176–188).
- Export button hits `GET /download_excel` (app.py:406–446).

**Map (`templates/map.html`)**
- Loads Google Maps JS API with `GOOGLE_MAPS_API_KEY`.
- `static/map.js` fetches:
  - `GET /api/locations` to render markers (app.py:454–495).
  - Clicking on map calls `GET /api/wqi?lat&lng` to show nearest location’s WQI (app.py:613–642).

**Sensors (`templates/sensors.html`)**
- Polls `GET /api/iot` every few seconds to get the latest ESP32 reading.
- Displays temperature, pH, turbidity, and computes WQI assuming ideal observed values for missing parameters (DO=14.6 mg/L, TDS=0 mg/L, Nitrate=0 mg/L).
- Hides content until data arrives.

**Chatbot (`templates/chatbot.html`)**
- Client JS: `static/chatbot.js` sends user messages to `window.CHAT_BACKEND_URL` or `/chat`.
- Server endpoint: `POST /chat` routes requests to Hugging Face Router (app.py:221–352).
- Cleans responses on both client and server sides and enforces send delay on the client.

**Relationships**
- `calculate_wqi` (app.py:117–173) and `get_status` (app.py:176–188) power UI pages (Calculator, Data, Map).
- Sensors page reuses the same WQI weighting and status semantics for consistency.
- Map and Data pages share color/status mapping for consistency.
- Export reuses the same fields shown on Data page plus static locations.
- Chatbot is independent of WQI logic but lives within the same Flask app and layout.
