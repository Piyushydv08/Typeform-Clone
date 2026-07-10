# Typeform Clone

A full-stack application cloning the core functionality of Typeform, built with Next.js (App Router, TypeScript, Tailwind CSS) and FastAPI (Python, SQLAlchemy, SQLite).

## Tech Stack
- **Frontend**: Next.js 15 (React 19), TypeScript, Tailwind CSS, Framer Motion for animations, `@dnd-kit` for drag-and-drop interactions, Lucide React for iconography.
- **Backend**: FastAPI, SQLAlchemy ORM, SQLite database, Pydantic for robust schema validation.

## Architecture Overview
The application follows a standard decoupled architecture. The frontend is a purely static/client-driven React application that communicates with the backend via RESTful APIs. 
The Next.js App Router is used primarily for routing and layout management, while the state is managed entirely on the client side (React hooks) to provide a fluid, app-like experience (like the debounced editor and animated respondent flow).
The backend uses FastAPI mounted with a SQLite file-based database for simplicity, exposing standard CRUD endpoints and serving static file uploads.

### Folder Tree
```text
.
├── backend/
│   ├── main.py            # FastAPI entry point & routers
│   ├── database.py        # SQLAlchemy engine & session setup
│   ├── models.py          # ORM Models (Creator, Form, Question, Response, Answer)
│   ├── schemas.py         # Pydantic validation schemas
│   ├── seed.py            # Script to wipe and seed the database with mock data
│   ├── requirements.txt   # Python dependencies
│   ├── routers/           # Separated API route handlers
│   └── uploads/           # Directory where file_upload answers are stored locally
└── frontend/
    ├── app/               # Next.js App Router pages (Dashboard, Builder, Respondent Flow)
    ├── components/        # Reusable React components (UI, Builder, Respondent)
    ├── lib/               # Shared utilities (API wrappers, Theme setup, TypeScript definitions)
    ├── package.json       # Node dependencies
    └── tailwind.config.ts # Tailwind styling configuration
```

## Setup Instructions

### Backend
1. Open a terminal in the `backend/` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with mock data (this will create `app.db`):
   ```bash
   python seed.py
   ```
5. Start the development server:
   ```bash
   fastapi dev main.py
   ```

### Frontend
1. Open a new terminal in the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in `frontend/` (Optional, defaults to localhost:8000):
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Assumptions & Placeholders
To prioritize core features, the following functionalities have been mocked out (displaying a "Coming Soon" badge):
- **Authentication**: No real auth is implemented. We assume a single default creator and hardcode `creator_id = 1` on the backend.
- **Logic Tab**: Branching logic/conditional routing was deemed too complex for this phase.
- **Integrations Tab**: Third-party webhook/integration configurations are placeholder tabs.
- **Team Tab**: Collaboration features are mocked.
- **Payment Question Type**: Displayed as disabled in the question type dropdown since Stripe integration was not in scope.

## Database Schema (SQLite)
```sql
CREATE TABLE creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forms (
    id VARCHAR PRIMARY KEY, -- UUID
    creator_id INTEGER REFERENCES creators(id),
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'draft', -- 'draft' or 'published'
    theme_config JSON,
    thank_you_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_count INTEGER DEFAULT 0
);

CREATE TABLE questions (
    id VARCHAR PRIMARY KEY, -- UUID
    form_id VARCHAR REFERENCES forms(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    options JSON, -- Array of strings for choices
    validation_config JSON -- Min/max, regex, etc.
);

CREATE TABLE responses (
    id VARCHAR PRIMARY KEY, -- UUID
    form_id VARCHAR REFERENCES forms(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_complete BOOLEAN DEFAULT TRUE
);

CREATE TABLE answers (
    id VARCHAR PRIMARY KEY, -- UUID
    response_id VARCHAR REFERENCES responses(id) ON DELETE CASCADE,
    question_id VARCHAR REFERENCES questions(id),
    answer_value TEXT -- Can store stringified JSON or file paths
);
```

## API Endpoints
- **Forms**:
  - `GET /api/forms` - List creator's forms
  - `POST /api/forms` - Create a new form
  - `GET /api/forms/{id}` - Get full form with questions
  - `PUT /api/forms/{id}` - Update form properties
  - `DELETE /api/forms/{id}` - Cascade delete form
  - `POST /api/forms/{id}/duplicate` - Deep copy form
  - `POST /api/forms/{id}/publish` - Toggle draft/published status
- **Questions**:
  - `POST /api/forms/{id}/questions` - Add a question
  - `PUT /api/questions/{id}` - Update question
  - `DELETE /api/questions/{id}` - Delete question
  - `POST /api/forms/{id}/questions/reorder` - Bulk update `order_index`
- **Public & Submissions**:
  - `GET /api/public/forms/{id}` - Fetch published form (no auth)
  - `POST /api/public/forms/{id}/submit` - Submit answers (supports `multipart/form-data`)
- **Responses & Analytics**:
  - `GET /api/forms/{id}/responses` - List responses
  - `GET /api/responses/{id}` - Get full response detail
  - `GET /api/forms/{id}/stats` - Get aggregation stats
  - `GET /api/forms/{id}/export` - Stream CSV of responses

## Deployment Instructions

### Backend (Render/Railway)
1. **Database & Storage**: Since this project uses SQLite and local file uploads (`uploads/` directory), you **MUST** attach a persistent disk volume to your service in Render or Railway. Otherwise, your database and uploaded files will be wiped on every deploy/restart.
2. **Start Command**: 
   ```bash
   pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. **Environment**: Ensure Python 3.10+ is selected. No other environment variables are strictly required since SQLite is file-based.

### Frontend (Vercel)
1. Import the `frontend/` directory into Vercel as a Next.js project.
2. **Environment Variables**: Add `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com/api
   ```
3. **Build Command**: Uses the default `npm run build`.
