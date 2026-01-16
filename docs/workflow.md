# Build Workflow and Implementation Details

**Goals**
- Compute, visualize, and manage WQI with friendly UX.
- Ingest IoT readings and show live sensor-based WQI.
- Provide an AI chatbot for guidance.
- Keep setup simple and portable.

**Step-by-Step Workflow**
- Plan core features and pages:
  - Calculator, Map, Data (CRUD), Dashboard, Chatbot, Sensors.
  - Auth pages (Login, Signup, User Dashboard) for basic user gating.
- Set up Flask app and configuration:
  - Initialize SQLAlchemy with SQLite; support `DATABASE_URL` for Postgres.
  - Create tables: `Location`, `WaterSample`, `IoTReading`.
  - Implement startup check to add `temperature` column for backward compatibility.
- Implement WQI logic:
  - `calculate_wqi(data)` applies dynamic weights and parameter Qi scores.
  - Temperature uses absolute deviation from ideal to penalize extremes.
  - `get_status(wqi)` maps to five categories and Bootstrap colors.
- Build pages and routes:
  - Calculator (`/`) with inputs and chart; `POST /calculate` API.
  - Data (`/data`) lists static + user locations, forms for CRUD; export via `/download_excel`.
  - Map (`/map`) with Google Maps, marker colors by WQI; `GET /api/locations`, `GET /api/wqi`.
  - Dashboard (`/dashboard`) quick links, live sensor card, and awareness slogan.
  - Chatbot (`/chatbot.html`) UI using `static/chatbot.js`; backend `POST /chat`.
  - Sensors (`/sensors`) polls `GET /api/iot`; computes WQI using latest values.
- Add client-side auth:
  - `static/auth.js` manages users in localStorage and SHA-256 password hashing.
  - Pages: `/login`, `/signup`, `/user-dashboard`. Basic protection for selected routes.
- Frontend assets and UX:
  - Layout with Bootstrap 5, high-contrast container, animated ripple background.
  - Consistent WQI color badges and simple language for non-technical users.
  - Icons for parameters and chatbot; slogan artwork built with inline SVG.
- IoT ingestion:
  - `POST /api/iot` accepts JSON with `temperature_c`, optional `ph`, `turbidity_ntu` or `turbidity_percent`.
  - `GET /api/iot` returns only latest reading in a minimal, clean shape.
  - Sensors and Dashboard poll periodically and render clean status.
- Exports:
  - `/download_excel` streams XLSX/CSV including temperature and user/static data.
- Deployment:
  - `Procfile` runs `gunicorn app:app`.
  - Environment variables configure Maps and Chat.

**Testing and Validation**
- Manual testing via browser for each page and endpoint.
- Validate IoT input shapes and error codes.
- Confirm WQI consistency across Calculator, Data, and Sensors.
- Review UI responsiveness and accessibility on mobile and desktop.

**Future Enhancements**
- Replace localStorage auth with server-side sessions and roles.
- Add Flask-Migrate for versioned schema updates.
- Expand IoT model to include DO, TDS, Nitrate to remove assumptions.
- Add unit tests and CI for endpoints and WQI logic.
