# Typeform Clone

**By Piyush Yadav**
Netaji Subhash University of Technology, Delhi
📧 piyush.yadav.ug23@nsut.ac.in
🔗 GitHub: [Piyushydv08/Typeform-Clone](https://github.com/Piyushydv08/Typeform-Clone)

A full-stack clone of Typeform, built with Next.js (App Router, TypeScript, Tailwind CSS) on the frontend and FastAPI (Python, SQLAlchemy, SQLite) on the backend. It replicates the core Typeform experience — a drag-and-drop form builder, a polished one-question-at-a-time respondent flow, and a results/analytics dashboard.

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Backend (API)** | https://typeform-clone-backend.onrender.com/ |
| **Frontend (App)** | https://typeform-clone-ochre.vercel.app/forms |
| **AI Prompts / Process Log** | See [PROMPTS.md](./PROMPTS.md) in this repository |

> ⚠️ **Important — open the backend link first!**
> The backend is hosted on Render's free tier, which spins the server down after a period of inactivity. If you open the frontend link directly, the very first API call will time out or hang while the backend "wakes up" (this can take 30–60 seconds).
>
> **Recommended order:**
> 1. Open the backend link first → https://typeform-clone-backend.onrender.com/
> 2. Wait until you see the JSON response `{"message": "Welcome to the Typeform Clone API"}`
> 3. *Then* open the frontend link → https://typeform-clone-ochre.vercel.app/forms
>
> This ensures the Render instance is already awake by the time the frontend starts making requests, so forms, questions, and responses load instantly instead of appearing to fail.

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router, TypeScript)
- React 19
- Tailwind CSS 4
- Framer Motion — animated transitions (respondent flow, publish animation, toasts)
- `@dnd-kit` (core, sortable, utilities) — drag-and-drop question reordering
- `@xyflow/react` + `dagre` — the Workflow tab's node-based canvas view
- Lucide React — icon set

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite (file-based database, `app.db`)
- Pydantic — request/response schema validation
- `python-multipart` — file upload support (file_upload question type)

**Deployment**
- Frontend → Vercel
- Backend → Render (with a persistent disk for SQLite + uploaded files)

---

## 🏗️ Architecture Overview

The application follows a standard **decoupled client-server architecture**. The Next.js frontend is a purely client-driven React application (no server components doing data fetching) that talks to the FastAPI backend exclusively over REST APIs. The Next.js App Router is used only for routing/layout — all state (the form being edited, question list, live preview, respondent answers) lives in React hooks on the client.

### High-Level Request Flow

```
┌─────────────────────┐          REST (JSON / multipart)          ┌──────────────────────┐
│   Next.js Frontend   │ ───────────────────────────────────────▶ │   FastAPI Backend     │
│  (Vercel, port 3000) │ ◀─────────────────────────────────────── │ (Render, port 8000)   │
└─────────────────────┘                                          └──────────┬───────────┘
                                                                              │
                                                                    SQLAlchemy ORM
                                                                              │
                                                                              ▼
                                                                    ┌──────────────────┐
                                                                    │  SQLite (app.db) │
                                                                    └──────────────────┘
```

### 1. Creator (Builder) Flow
1. `/forms` (Dashboard) loads → calls `GET /api/forms` → lists all forms with `status` and `response_count`.
2. Creating a form → `POST /api/forms` → redirects straight into `/forms/{id}/edit`.
3. The Builder page (`edit/page.tsx`) fetches the full form (`GET /api/forms/{id}`) including its nested `questions[]`.
4. **Content tab**: `QuestionList` (left panel) ↔ `QuestionEditor` (right panel) ↔ `LivePreview` (center) all operate on the same in-memory `form` state object, kept in sync via the `onUpdate` callback passed down from the page.
   - Adding a question → `POST /api/forms/{id}/questions`
   - Editing a question → debounced (800 ms) `PUT /api/questions/{id}` call, so we don't spam the API on every keystroke
   - Reordering (drag-and-drop via `@dnd-kit`) → optimistic UI update, then `POST /api/forms/{id}/questions/reorder` persists the new `order_index` values
   - Deleting → `DELETE /api/questions/{id}`
5. **Thank You tab**: reads/writes into `form.theme_config` (a single JSON blob) via `PUT /api/forms/{id}`.
6. **Design toolbar**: same pattern — theme presets and uploaded background images are merged into `theme_config` and persisted with `PUT /api/forms/{id}`.
7. **Publish**: `POST /api/forms/{id}/publish` toggles `status` between `draft`/`published` and returns the shareable URL (`/f/{id}`).
8. **Results tab**: `GET /api/forms/{id}/responses` (list), `GET /api/forms/{id}/stats` (aggregated per-question stats), `GET /api/responses/{id}` (single response detail), `GET /api/forms/{id}/export` (CSV stream).

### 2. Respondent (Public Fill) Flow
1. Anyone opens `/f/{id}` — no auth required.
2. `GET /api/public/forms/{id}` returns a **stripped-down** version of the form (`PublicFormOut`/`PublicQuestionOut` schemas) — only what a respondent needs, never creator-only metadata.
3. The backend refuses this call unless `status == 'published'`, so drafts can never leak publicly.
4. `QuestionSlide` renders one question at a time with Framer Motion enter/exit transitions. Keyboard shortcuts (A/B/C for choices, Y/N, 1–5 for ratings, Enter to advance) are wired at the page level.
5. On every answer, client-side validation runs first (required check, email regex, etc.) before the slide is allowed to advance.
6. On the final question, `POST /api/public/forms/{id}/submit` sends all answers (as `multipart/form-data` if a file was uploaded, otherwise JSON). The backend re-validates everything server-side (never trusts the client) before persisting.
7. A successful submit shows the animated `ThankYouScreen`, using the custom thank-you title/description/redirect URL stored in `theme_config`.
8. **Partial responses**: `POST /api/public/forms/{id}/partial` can be pinged as a respondent navigates, creating/updating a `Response` row with `is_complete = False`, enabling completion-rate tracking even for drop-offs.

### 3. Data Flow Summary
```
Builder UI  ──CRUD──▶  /api/forms, /api/questions        ──▶  Form / Question tables
Public UI   ──read───▶  /api/public/forms/{id}            ──▶  Form / Question (published only)
Public UI   ──write──▶  /api/public/forms/{id}/submit      ──▶  Response / Answer tables
Results UI  ──read───▶  /api/forms/{id}/responses, /stats  ──▶  Response / Answer (aggregated)
```

All persistence goes through SQLAlchemy models defined once in `backend/models.py`; both the builder-side and public-side routers query the same tables, just through different Pydantic schemas (`schemas.py`) that expose different fields depending on trust level (creator vs. anonymous respondent).

---

## 🗄️ Database Schema

SQLite, defined via SQLAlchemy ORM in `backend/models.py`.

```sql
CREATE TABLE creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL
);

CREATE TABLE forms (
    id VARCHAR PRIMARY KEY,                  -- UUID
    creator_id INTEGER REFERENCES creators(id),
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'draft',          -- 'draft' | 'published'
    theme_config JSON,                       -- colors, bg image, thank-you screen config
    thank_you_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- response_count is NOT stored; it's computed at read-time via a COUNT query
);

CREATE TABLE questions (
    id VARCHAR PRIMARY KEY,                  -- UUID
    form_id VARCHAR REFERENCES forms(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,                   -- short_text, long_text, multiple_choice,
                                              -- dropdown, email, number, yes_no, rating,
                                              -- file_upload
    title VARCHAR NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    options JSON,                            -- array of strings, for choice/dropdown types
    validation_config JSON                   -- e.g. rating scale, multiple_selection,
                                              -- has_other, has_none
);

CREATE TABLE responses (
    id VARCHAR PRIMARY KEY,                  -- UUID
    form_id VARCHAR REFERENCES forms(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_complete BOOLEAN DEFAULT TRUE         -- FALSE while only a partial save exists
);

CREATE TABLE answers (
    id VARCHAR PRIMARY KEY,                  -- UUID
    response_id VARCHAR REFERENCES responses(id) ON DELETE CASCADE,
    question_id VARCHAR REFERENCES questions(id),
    answer_value TEXT                        -- stringified answer, or a file path for
                                              -- file_upload questions
);
```

**Relationships**
- `Creator 1 ── * Form` (a creator owns many forms; assignment assumes a single hardcoded creator, `id = 1`)
- `Form 1 ── * Question` (cascade delete — deleting a form deletes its questions)
- `Form 1 ── * Response` (cascade delete — deleting a form deletes its responses)
- `Response 1 ── * Answer` (cascade delete)
- `Question 1 ── * Answer` (an answer always references the question it's answering)

**Design notes**
- `options` and `validation_config` are stored as JSON columns rather than separate tables — this keeps question configuration flexible (each question type needs different config) without needing a dozen nullable columns or a rigid EAV schema.
- `answer_value` is always `TEXT`. Multi-select answers are stored as a stringified array; ratings/numbers are stored as strings and parsed on read. This keeps the `Answer` table type-agnostic across all 9 question types.
- `response_count` on a form is *derived*, not stored, to avoid a denormalized counter going out of sync.

---

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Seeds the database with 2 published forms, mixed question types, and sample responses
python seed.py

fastapi dev main.py
```
Backend runs at `http://127.0.0.1:8000`.

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local` (optional — defaults to `http://127.0.0.1:8000/api`):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

```bash
npm run dev
```
Open `http://localhost:3000`.

---

## 📦 Deployment

**Backend (Render)**
- Attach a **persistent disk** — SQLite (`app.db`) and uploaded files (`uploads/`) live on the filesystem and will be wiped on every redeploy without one.
- Start command:
  ```bash
  pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- Free-tier instances spin down after inactivity — see the "Live Demo" note above about waking it up first.

**Frontend (Vercel)**
- Import the `frontend/` directory as the project root.
- Set `NEXT_PUBLIC_API_URL` to the deployed backend's `/api` path.
- Build command: default (`npm run build`).

---

## 🤔 Assumptions & Placeholders

- **Authentication**: no real auth is implemented. A single default creator (`creator_id = 1`) is hardcoded on the backend, per the assignment's note that this may be simplified.
- **Logic Tab**: branching/conditional logic was scoped out as "Coming Soon" — deemed too complex for the given timeline.
- **Integrations Tab**: third-party webhook/integration configuration is a placeholder UI only.
- **Team Tab**: collaboration features are mocked (shown but non-functional).
- **Payment Question Type**: shown as disabled in the question type dropdown, since Stripe integration was out of scope.
- **File Uploads**: stored on local disk under `backend/uploads/{response_id}/`, served via FastAPI's `StaticFiles`. This is fine for a demo but would need object storage (S3, etc.) in a real production deployment.
- **Bonus features implemented**: custom themes, CSV export, partial-response tracking, file-upload question type, and dark mode were all built in as bonus scope beyond the core requirements.

---

## 📁 Repository Structure

```text
.
├── backend/
│   ├── main.py            # FastAPI entry point & router registration
│   ├── database.py         # SQLAlchemy engine & session setup
│   ├── models.py           # ORM models (Creator, Form, Question, Response, Answer)
│   ├── schemas.py          # Pydantic validation/serialization schemas
│   ├── seed.py              # Wipes + seeds the database with mock data
│   ├── requirements.txt
│   ├── routers/             # forms.py, questions.py, public.py, responses.py
│   └── uploads/             # Local storage for file_upload answers
└── frontend/
    ├── app/                 # Next.js App Router pages (Dashboard, Builder, Respondent)
    ├── components/          # builder/, respondent/, ui/
    ├── lib/                 # api.ts (API client), types.ts (shared TS types)
    └── package.json
```

---

## 📄 Additional Documentation

See [PROMPTS.md](./PROMPTS.md) for a full walkthrough of the AI-assisted development process for this project — including the initial requirements pass, UI cloning approach, and the specific prompts used with Claude, Stitch, Antigravity, and ChatGPT.
