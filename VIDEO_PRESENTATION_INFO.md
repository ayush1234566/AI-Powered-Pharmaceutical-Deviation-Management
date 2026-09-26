# AIVOA — Video Presentation & Code Walkthrough Master Guide

This guide gives you an exact, step-by-step spoken script, screen actions, and code explanations for both required 5–10 minute video submissions.

---

# 📹 VIDEO 1: Working Demonstration of AI Tools & Frontend Features (5–8 Mins)

### Objective
Demonstrate all working features on screen:
1. **PDF / Document Extraction Tool** (Upload file + Paste text + One-click test samples)
2. **Log Interaction Tool** (Form auto-fill, Impact & Severity Copilot assessment, saving to database)
3. **Edit Interaction Tool** (Loading saved records from registry, modifying fields, updating)
4. **Deviations Registry (Audit Repository)** (Real-time search, severity/impact filtering, dossier inspection modal, and print dossier)
5. **Quality Analytics Dashboard** (Live KPI cards, severity & impact risk distributions)
6. **AI Copilot Chat Assistant** (Context-aware pharmaceutical QMS guidance)

---

## ⏱️ Video 1 Breakdown (Minute-by-Minute)

### [0:00 – 1:00] Introduction & Architecture Overview
- **What to show on screen**: Open browser at `http://localhost:5173`. Show the clean interface with the two main panels:
  - Left: **Log Deviation** intake form
  - Right: **AI Deviation Assistant**
- **What to say**:
  > *"Hello everyone. Today I am demonstrating AIVOA, an AI-powered pharmaceutical deviation management system built in compliance with FDA 21 CFR 211 and ICH Q7 guidelines. In pharmaceutical manufacturing, when an equipment malfunction, temperature excursion, or contamination occurs, QA officers must rapidly log the deviation, assess its impact on product quality and patient safety, and determine the severity level. AIVOA automates this entire intake workflow using AI and LangGraph."*

---

### [1:00 – 2:30] AI Tool 1: Document & Text Extraction
- **What to show on screen**:
  1. Point to the right panel (**AI Deviation Assistant**). Show the dropzone supporting PDF, DOCX, TXT, XLSX, and images.
  2. Point to the **"One-Click Test Samples"** bar.
  3. Click the first button: **`Reactor Temperature Excursion (Metformin API)`**.
  4. Point your cursor to the animated progress bar:
     - *"Uploading document..."* → *"Parsing document content..."* → *"Extracting key parameters..."* → *"Generating impact assessment..."*
- **What to say**:
  > *"Here on the right is our AI Assistant. Users can drag and drop raw deviation reports in PDF, Word, or plain text, or paste email notes. For quick testing, we have pre-configured sample reports. Let's click the 'Reactor Temperature Excursion' sample."*
  >
  > *"Notice the real-time progress bar. The backend receives the raw document, parses the text using our document parser, and sends it to our LangGraph workflow. Within 2 seconds, the AI extracts all relevant GMP fields and auto-populates the form on the left."*

---

### [2:30 – 3:45] AI Tool 2: Log Interaction & Risk Copilot
- **What to show on screen**:
  1. Scroll through the left panel form:
     - **Site / Plant**: Auto-selected to `API Manufacturing Unit`
     - **Date of Occurrence**: `2026-09-20`
     - **Title**: `Reactor Temperature Excursion Exceeding Validated Process Parameter`
     - **Source**: `Manufacturing`
     - **Related Product**: `Metformin Hydrochloride API (Intermediate Stage)`
     - **Batch Number**: `MET-2026-0847`
     - **Detailed Description**: Complete narrative with event details, root cause, and immediate containment.
  2. Highlight the **AI Copilot Risk Assessment**:
     - **Initial Impact**: Auto-recommended as **`High`** (with purple *"AI Recommended"* tag and regulatory rationale).
     - **Initial Severity**: Auto-recommended as **`Major`** (with equipment malfunction rationale).
  3. Click the blue **"Save Deviation"** button at the bottom.
  4. Show the green banner: `Deviation saved successfully! (ID: DEV-2026-XXXXXX)`.
- **What to say**:
  > *"Look at the Log Deviation form on the left. The AI successfully identified the manufacturing site, occurrence date, exact batch number MET-2026-0847, and synthesized the event description. More importantly, look at the AI Copilot recommendations. It classified the impact as 'High' because temperature excursions during synthesis can create degradants like Impurity-C. It set severity to 'Major' because multiple batches on the same reactor line are affected. Now let's click 'Save Deviation'. A permanent record is generated in our SQLite/PostgreSQL database with an audit ID."*

---

### [3:45 – 5:00] Feature 3: Deviations Registry & Inspection Dossier
- **What to show on screen**:
  1. Click the link **"View in Registry →"** or click **"Deviations Registry"** in the top navigation bar.
  2. Point to the table: show all saved records with badges for Impact (*High, Critical, Major, Minor*) and Status (*Saved*).
  3. Demonstrate the **Search Bar**: type `MET-2026` or `Metformin` — show instant real-time filtering.
  4. Demonstrate the **Filters**: click the Severity dropdown and filter by `Major`.
  5. Click the **Eye icon** on a row to open the **Deviation Detail & Audit Dossier** modal.
  6. Point out the metadata grid, AI reasoning box, and click the **"Print Dossier"** button to show the print preview dialog (then cancel).
- **What to say**:
  > *"Next, let's navigate to the Deviations Registry. This is the centralized audit repository for QA managers. Every captured deviation appears in this table with color-coded severity and impact badges. We have instant real-time search across batch numbers, product names, and titles, plus filtering by risk levels."*
  >
  > *"When we click the eye icon, it opens the complete Deviation Dossier modal. This includes the full QA reasoning, root cause notes, and regulatory audit footnotes. We also have a one-click 'Print Dossier' button that uses a clean print stylesheet for regulatory inspections."*

---

### [5:00 – 6:15] Feature 4: Edit Interaction Tool
- **What to show on screen**:
  1. In the registry row, click the **Edit icon** (pencil).
  2. The view switches back to the form with header showing **"Edit Deviation"** and all previous fields populated.
  3. Change the title or add text to the description, e.g. add `"— Quarantined in Room 4B"`.
  4. Click the blue button which now says **"Update Deviation"**.
  5. Show the green banner: `Deviation updated successfully!`.
- **What to say**:
  > *"Now let's demonstrate the Edit Interaction tool. By clicking the edit icon in the registry, the record loads back into our Redux form state. The header dynamically switches to 'Edit Deviation'. Let's modify the description by adding quarantine room details, and click 'Update Deviation'. The record is updated via our PUT endpoint without duplicating the entry."*

---

### [6:15 – 7:15] Feature 5: Quality Analytics Dashboard
- **What to show on screen**:
  1. In the top navigation header, click **"Quality Dashboard"**.
  2. Point to the 4 KPI cards:
     - Total Deviations
     - Critical / Major Severity
     - High Quality Impact
     - Minor / Low Risk
  3. Show the horizontal distribution progress bars:
     - **Severity Risk Breakdown** (Critical vs Major vs Minor)
     - **Product Quality Impact Distribution** (Critical vs High vs Medium vs Low)
  4. Point to the **Recent Deviation Dossiers** timeline at the bottom.
- **What to say**:
  > *"In the top header, we click 'Quality Dashboard'. This provides executive-level quality intelligence. We can see real-time counts of total deviations, high-risk batches requiring quarantine, and visual risk distribution bars comparing Critical, Major, and Minor events. QA Directors can instantly monitor systemic trends across manufacturing sites."*

---

### [7:15 – 8:00] Feature 6: AI Copilot QMS Chat & Conclusion
- **What to show on screen**:
  1. Click **"Log Deviation"** to return to the intake workspace.
  2. Go to the chat input at the bottom right.
  3. Type: `What is the difference between impact and severity in pharma?` and press Enter.
  4. Show the AI's instant, structured response referencing 21 CFR 211 and ICH Q10.
- **What to say**:
  > *"Finally, we have the AI QMS Chat Assistant. Users can ask questions about CAPA investigation techniques, root cause analysis, or regulatory definitions. For instance, asking 'What is the difference between impact and severity?' gives a clear, GMP-aligned answer distinguishing product quality consequence from investigation scope. This concludes the working demonstration of AIVOA."*

---
---

# 📹 VIDEO 2: Code Walkthrough & End-to-End Workflow Explanation (5–8 Mins)

### Objective
Walk through the codebase line-by-line / section-by-section, explaining the full technical dataflow:
1. **Frontend Input** (`AIAssistant.jsx`, Dropzone, Samples)
2. **API Communication & Proxy** (`deviationApi.js`, `vite.config.js`)
3. **Backend API Endpoints** (`app/routes/deviations.py`, `app/schemas.py`)
4. **Document Parser** (`app/services/document_parser.py`)
5. **AI / LangGraph Workflow** (`app/services/ai_service.py` - StateGraph, Node 1 Extraction, Node 2 Recommendation, Fallback)
6. **State Management & Form Auto-fill** (`store/deviationSlice.js`, `store/aiPanelSlice.js`)
7. **Audit Registry & Analytics Code** (`DeviationRegistry.jsx`, `AnalyticsDashboard.jsx`)

---

## ⏱️ Video 2 Breakdown (Minute-by-Minute)

### [0:00 – 1:15] Code Architecture Overview
- **What to show on screen**: Open VS Code / Antigravity IDE with the project tree visible:
  - `backend/app/`
  - `frontend/src/`
- **What to say**:
  > *"Welcome to the technical code walkthrough of AIVOA. The application follows a modern decoupled architecture: a React 19 frontend managed by Redux Toolkit and Vite, communicating with a FastAPI Python backend, backed by SQLAlchemy ORM and an AI workflow powered by LangGraph with Groq LLaMA 3.3 70B, supported by an intelligent pharmaceutical heuristics fallback engine."*

---

### [1:15 – 2:30] Step 1: Frontend Input & API Client
- **File 1**: Open [`frontend/src/components/AIAssistant.jsx`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/src/components/AIAssistant.jsx)
  - Highlight lines **85–125** (`onDrop` callback using `react-dropzone` and `extractFromFile`).
  - Highlight lines **135–165** (`executeTextExtraction` calling `extractFromText`).
  - Highlight lines **65–83** (`handleExtractionResult` dispatching `populateFromAI` to Redux).
- **File 2**: Open [`frontend/src/api/deviationApi.js`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/src/api/deviationApi.js)
  - Highlight lines **3–8** (Axios client with relative base `/api/deviations`).
- **File 3**: Open [`frontend/vite.config.js`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/vite.config.js)
  - Highlight lines **7–13** (Vite proxy forwarding `/api` to `http://127.0.0.1:8000`).
- **What to say**:
  > *"Let's start where the user interacts. In `AIAssistant.jsx`, we use `react-dropzone` to accept files up to 10MB. When a user uploads a document or clicks a sample report, `executeTextExtraction` dispatches progress states to Redux and calls our Axios service in `deviationApi.js`.*
  >
  > *In `deviationApi.js`, we use relative paths `/api/deviations`. To eliminate CORS preflight issues across localhost and 127.0.0.1, we configured a Vite reverse proxy in `vite.config.js` that securely forwards API calls directly to port 8000."*

---

### [2:30 – 4:00] Step 2: Backend Routes & Multi-Format Document Parser
- **File 1**: Open [`backend/app/routes/deviations.py`](file:///c:/Users/USER/Desktop/AIVOA%20project/backend/app/routes/deviations.py)
  - Highlight lines **35–71** (`@router.post("/extract")` endpoint).
  - Highlight lines **73–132** (`@router.post("/extract-file")` endpoint).
- **File 2**: Open [`backend/app/services/document_parser.py`](file:///c:/Users/USER/Desktop/AIVOA%20project/backend/app/services/document_parser.py)
  - Highlight lines **14–43** (`extract_text_from_pdf` using `pdfplumber` with `PyPDF2` fallback).
  - Highlight lines **107–144** (`parse_document` router for `.pdf`, `.docx`, `.txt`, `.xlsx`, images).
- **What to say**:
  > *"When the request hits FastAPI in `routes/deviations.py`, the `/extract-file` endpoint validates the file extension and size. It calls `parse_document()` in `document_parser.py`.*
  >
  > *`document_parser.py` is modular: it uses `pdfplumber` as primary with `PyPDF2` fallback for PDF layout extraction, `python-docx` for Word documents, `openpyxl` for Excel spreadsheets, and OCR for images. Once raw text is extracted, it forwards the content to our AI service."*

---

### [4:00 – 5:45] Step 3: LangGraph AI Workflow & Fallback Engine
- **File**: Open [`backend/app/services/ai_service.py`](file:///c:/Users/USER/Desktop/AIVOA%20project/backend/app/services/ai_service.py)
  - Highlight lines **25–32** (`DeviationState` TypedDict).
  - Highlight lines **78–110** (`extraction_node` — Groq LLM + JSON extraction).
  - Highlight lines **146–204** (`recommendation_node` — Risk matrix assessment).
  - Highlight lines **210–232** (`build_deviation_workflow` compiling the `StateGraph`).
  - Highlight lines **275–380** (`extract_pharma_deviation_heuristics` — domain fallback).
  - Highlight lines **385–440** (`process_deviation_text` — graceful execution pipeline).
- **What to say**:
  > *"This is the core AI engine in `ai_service.py`. We orchestrate the process using LangGraph with a two-node StateGraph:*
  >
  > *1. `extraction_node`: Uses a strict pharmaceutical QA system prompt with Groq's LLaMA 3.3 70B model to convert unstructured narrative into a structured JSON schema matching our form fields.*
  > *2. `recommendation_node`: Receives the extracted entity and evaluates the Impact (Low/Medium/High/Critical) and Severity (Minor/Major/Critical), generating 2-3 sentences of regulatory reasoning based on FDA 21 CFR 211.*
  >
  > *Crucially, we also built `extract_pharma_deviation_heuristics()`. If the user does not have a Groq API key configured, or if the API rate limits, our system automatically falls back to an intelligent regex and NLP rules engine. The application never crashes and guarantees 100% uptime."*

---

### [5:45 – 6:45] Step 4: Redux State & Form Population
- **File 1**: Open [`frontend/src/store/deviationSlice.js`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/src/store/deviationSlice.js)
  - Highlight lines **41–58** (`populateFromAI` reducer).
  - Highlight lines **59–78** (`loadDeviation` reducer for edit interaction).
- **File 2**: Open [`frontend/src/components/DeviationForm.jsx`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/src/components/DeviationForm.jsx)
  - Highlight lines **68–105** (`handleSave` supporting both `saveDeviation` POST and `updateDeviation` PUT).
- **What to say**:
  > *"When the backend returns the JSON response, the frontend dispatches `populateFromAI` in `deviationSlice.js`. Redux immutably updates all form fields: site, date, product, batch number, and reasoning.*
  >
  > *In `DeviationForm.jsx`, the inputs bind directly to this state. Notice `handleSave`: if `deviation.id` exists, it invokes `updateDeviation` (HTTP PUT); otherwise, it invokes `saveDeviation` (HTTP POST) and stores the resulting `deviation_id`."*

---

### [6:45 – 7:45] Step 5: Database ORM, Registry & Analytics
- **File 1**: Open [`backend/app/models.py`](file:///c:/Users/USER/Desktop/AIVOA%20project/backend/app/models.py)
  - Highlight lines **21–60** (`Deviation` SQLAlchemy model with unique sequential `deviation_id`).
- **File 2**: Open [`frontend/src/components/DeviationRegistry.jsx`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/src/components/DeviationRegistry.jsx)
  - Highlight lines **28–46** (`fetchDeviations` with live search and filter).
  - Highlight lines **58–62** (`handleEdit` loading a record back into the form).
- **File 3**: Open [`frontend/src/components/AnalyticsDashboard.jsx`](file:///c:/Users/USER/Desktop/AIVOA%20project/frontend/src/components/AnalyticsDashboard.jsx)
  - Highlight lines **18–35** (`getDeviationStats` fetching KPI summaries).
- **What to say**:
  > *"On the backend, `models.py` defines our SQLAlchemy schema with auto-generated IDs like DEV-2026-XXXX. In `DeviationRegistry.jsx`, we render our audit table with debounced search and severity filters. The pencil icon triggers `loadDeviation` to support full editing.*
  >
  > *Finally, `AnalyticsDashboard.jsx` fetches aggregated statistics from our `/api/deviations/stats/summary` endpoint, rendering real-time KPI cards and risk distributions. This provides an end-to-end, enterprise-ready deviation management solution."*

---
---

# 📋 Quick Technical Reference Summary

| Layer | File Path | Key Responsibilities |
|---|---|---|
| **Frontend UI** | `frontend/src/App.jsx` | Tab navigation (`Log`, `Registry`, `Dashboard`) |
| **Intake Form** | `frontend/src/components/DeviationForm.jsx` | Form inputs, validation, POST create & PUT update |
| **AI Copilot** | `frontend/src/components/AIAssistant.jsx` | Dropzone, 1-click test chips, chat interface |
| **Audit Registry** | `frontend/src/components/DeviationRegistry.jsx` | Searchable table, risk filters, load-to-edit action |
| **Dossier Modal** | `frontend/src/components/DeviationDetailModal.jsx` | Full inspection view & `@media print` dossier |
| **Dashboard** | `frontend/src/components/AnalyticsDashboard.jsx` | Real-time KPIs, severity & impact distribution bars |
| **Redux Store** | `frontend/src/store/deviationSlice.js` | Form fields, AI population, record loading |
| **API Client** | `frontend/src/api/deviationApi.js` | Axios calls (`extract`, `save`, `list`, `update`, `stats`) |
| **Proxy Config** | `frontend/vite.config.js` | Vite reverse proxy (`/api` → `http://127.0.0.1:8000`) |
| **API Routes** | `backend/app/routes/deviations.py` | FastAPI route handlers (CRUD, Extract, Chat, Stats) |
| **AI Engine** | `backend/app/services/ai_service.py` | LangGraph StateGraph (Extract + Recommend) + Heuristic Fallback |
| **Doc Parser** | `backend/app/services/document_parser.py` | Multi-format parser (PDF, DOCX, TXT, XLSX, OCR) |
| **Database** | `backend/app/models.py` | SQLAlchemy ORM model with sequential `DEV-2026-XXXX` IDs |
