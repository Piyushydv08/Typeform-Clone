# Typeform Clone — AI Prompts & Development Process

**Piyush Yadav**
Netaji Subhash University of Technology, Delhi
📧 piyush.yadav.ug23@nsut.ac.in

**GitHub:** [Piyushydv08/Typeform-Clone](https://github.com/Piyushydv08/Typeform-Clone)
**Backend (live):** https://typeform-clone-backend.onrender.com/
**Frontend (live):** https://typeform-clone-ochre.vercel.app/forms

> ⚠️ Open the **backend link first** and wait for it to respond before opening the frontend — the Render free-tier instance needs ~30–60s to wake up from sleep. Opening the frontend directly will make the first few requests appear to hang or fail while the backend is still booting.

---

## Purpose of This Document

This file documents how AI tools were used throughout the build of this project, as permitted (and encouraged) by the assignment. It's meant to be a transparent, step-by-step log of the process — what was asked, why, and how the output was reviewed/modified — rather than a black-box "AI generated this" disclaimer.

---

## Step 1 — Understanding the Requirements

Before writing or generating any code, I read through the assignment brief in full to understand the scope: a Typeform clone with a drag-and-drop builder, a conversational one-question-at-a-time respondent flow, results/analytics, and a self-designed database schema — with several sections explicitly allowed to be "Coming Soon" placeholders (logic jumps, integrations, team collaboration, payments).

I made sure I understood:
- The two "hardest and most important" pieces called out in the brief: the **builder** and the **animated respondent flow**.
- Which features were core (must-have) vs. bonus (nice-to-have): custom themes, CSV export, partial-response tracking, file uploads, and dark mode.
- The evaluation criteria — particularly that I'd need to explain every line of code during the interview, so I treated AI output as a draft to review and understand, not something to blindly ship.

## Step 2 — Handing the Assignment to Claude

I uploaded the assignment PDF directly to Claude and explained my own understanding of the requirements in my own words first, then asked Claude to help me:
- Design a normalized database schema (Creator → Form → Question → Response → Answer) that could cleanly support 9 different question types without a rigid per-type column structure.
- Plan the REST API surface for both the creator-facing builder endpoints (`/api/forms`, `/api/questions`) and the public respondent-facing endpoints (`/api/public/...`), keeping a clear separation between what a creator can see (drafts, full config) and what an anonymous respondent can see (published forms only, stripped-down schema).
- Scaffold the FastAPI backend (SQLAlchemy models, Pydantic schemas, router structure) and the Next.js frontend project structure (App Router layout, `lib/api.ts`, `lib/types.ts`).

I iterated with Claude over several passes — reviewing the generated models/routers, asking for changes (e.g. adding `order_index` reordering logic, adding partial-response support, adding validation rules per question type on the public submit endpoint), and confirming I understood why each piece worked the way it did before moving on.

## Step 3 — UI Cloning: Stitch & Antigravity Prompts

Since the brief explicitly calls for the app to "totally resemble Typeform's design," I took screenshots of the actual Typeform builder, respondent flow, and dashboard UI first, studying the layout, spacing, color system, and interaction patterns (e.g. the left question list / center live preview / right settings panel layout in the builder, and the full-screen slide transitions in the respondent flow).

I then used **Stitch** and **Antigravity** prompts (built from those reference screenshots plus written descriptions of the interactions I wanted) to generate the initial React/Tailwind component structure for:
- The builder layout (`QuestionList`, `QuestionEditor`, `LivePreview`, `DesignToolbar`, `WorkflowCanvas`)
- The dashboard (`forms/page.tsx` — list/grid views, workspace sidebar, kebab menus)
- The respondent flow (`QuestionSlide`, `ProgressBar`, `ThankYouScreen`) with Framer Motion transitions
- Shared UI (`GlobalNavbar`, `ToastProvider`, `ThemeSwitcher`, `ComingSoon`)

I applied the generated components into the project, then went through each one to adapt it to the actual data model (wiring up `Form`/`Question` types, connecting to `lib/api.ts`, replacing placeholder data with real API calls).

## Step 4 — Bug Fixes with ChatGPT

Once the builder and respondent flow were wired end-to-end, I used ChatGPT to help debug a number of integration issues that came up while connecting the generated UI to the real backend — things like:
- CORS configuration between the Next.js dev server and FastAPI
- Mismatches between frontend TypeScript types and backend Pydantic schema field names
- Async state-sync bugs in the builder (e.g. the drag-and-drop reorder briefly showing stale order before the `useEffect` re-layout kicked in)
- Debounced autosave logic in `QuestionEditor` (avoiding a PUT request on every keystroke)

At this point the backend was running fully and all core CRUD + respondent-submission flows worked end-to-end locally.

## Step 5 — Matching the Original Typeform UI Pixel-by-Pixel

With the functional app working, the last major pass was purely visual: I took fresh screenshots of the real Typeform app (builder, theme picker, respondent slides) and used Antigravity again — this time prompting it to compare my existing component code against the reference screenshots and adjust spacing, colors, typography, icon choices, and micro-interactions (hover states, transitions, border radii) to bring the clone closer to Typeform's actual look and feel, rather than generating new components from scratch.

## Step 6 — Deployment

- Backend deployed to **Render**, with a persistent disk attached for the SQLite file and uploaded files.
- Frontend deployed to **Vercel**, pointed at the Render backend via `NEXT_PUBLIC_API_URL`.
- Verified the full flow against the live URLs: create a form → add questions → publish → fill it out on the public link → see it show up in Results.

---

## Summary of AI Tools Used

| Tool | Used For |
|---|---|
| **Claude** | Reading the assignment PDF, planning the database schema & API structure, scaffolding backend (FastAPI/SQLAlchemy) and frontend (Next.js) code, iterative refinement |
| **Stitch** | Initial UI component generation from Typeform reference screenshots |
| **Antigravity** | UI component generation and later a pixel-matching pass against real Typeform screenshots |
| **ChatGPT** | Debugging integration issues between frontend and backend (CORS, type mismatches, state-sync bugs) |

All generated code was reviewed, adapted to the actual data model, and tested manually against both the local dev environment and the deployed live links before submission. I can walk through and explain the implementation of any file in this repository during the evaluation interview.

---

## Appendix — Full Prompts Used (Verbatim)

Below is the complete set of prompts I actually wrote and ran, in the order I ran them. Stitch prompts were used first to generate UI shells/screens; the exported screens were then fed into Antigravity along with the build prompts, starting with a pinned "context" prompt so every later prompt had the schema/API/folder structure available.

### Part 1 — Stitch Prompts (UI generation)

Run one screen at a time — Stitch works best with a single prompt per screen rather than asking for the whole app at once.

**1. Dashboard / Forms List**
```
Design a clean SaaS dashboard screen for a form-builder tool, styled like Typeform.
Layout: left sidebar with logo, "My Forms" nav item highlighted, minimal icons.
Main area: a grid of form cards. Each card shows: form title, a status pill
("Draft" in grey, "Published" in green), response count, last-updated date,
and a kebab menu (Rename, Duplicate, Publish/Unpublish, Delete).
Top right: a prominent "+ Create Form" button (dark, pill-shaped, Typeform style).
Include an empty-state illustration for when there are zero forms.
Style: generous whitespace, rounded corners (12-16px), soft shadows, black/white
primary palette with one accent color (Typeform-style coral/orange #FF3D57 or similar),
large friendly sans-serif headings (Inter or similar), minimal borders.
Include a dark mode variant of this same screen.
```

**2. Form Builder (question list + editor)**
```
Design a form-builder screen, two-panel layout, styled like Typeform's editor.
Left panel: vertical scrollable list of question cards, each draggable (show a
drag-handle icon), showing question number, question type icon, and truncated
title. A "+ Add Question" button at the bottom of the list.
Right panel: question editor for the selected question — title input (large,
inline-editable style), description/help text input (smaller, greyed
placeholder), a "Required" toggle switch, and a question-type dropdown showing
icons for: short text, long text, multiple choice, dropdown, email, number,
yes/no, rating, file upload (with a small "Coming Soon" badge on file upload).
For multiple-choice/dropdown types show an editable list of options with
add/remove buttons.
Top bar: form title (inline editable), tabs for "Build / Logic / Integrations /
Team / Share" (Logic, Integrations, Team, Share show a small "soon" tag),
Preview button, and Publish button (accent color, pill-shaped).
Style: same as dashboard — black/white base, one coral accent, rounded 12-16px
cards, soft shadows, Inter font. Include a dark mode variant.
```

**3. Live Preview panel (inside builder)**
```
Design a live-preview panel/modal that sits inside the form builder, showing
exactly how the current question will render to a respondent. Full-bleed
single-question card, large bold question title, description text below it in
grey, an input matching the current question type (e.g. multiple choice shown
as a vertical list of selectable pill options with letter badges A/B/C), and a
"Next ->" button bottom-right. Thin progress bar at the very top of the panel.
Style: minimalist, huge whitespace, centered content, Typeform's
one-thing-at-a-time feel. Same color system as before.
```

**4. Respondent Flow — Full-Screen Question (the hardest/most important screen)**
```
Design the full-screen public respondent experience, Typeform style — this is
the most important screen. One question fills the entire viewport, vertically
and horizontally centered, generous padding.
Top: thin progress bar spanning the width of the screen.
Top-left: small back arrow (previous question). Top-right: form logo/name,
small and understated.
Center: large bold question title (up to 32-40px), grey description text
below it, then the input area sized appropriately per type:
 - short/long text: large underlined text input, cursor blinking, placeholder text
 - multiple choice: vertical list of options, each with a letter badge (A, B, C)
   in a rounded square, hover/selected state shown with accent-colored border
 - yes/no: two large side-by-side buttons
 - rating: a row of 5-10 circles/stars, larger on hover
Bottom-right: a dark pill-shaped "OK ✓" or "Next ->" button, with small grey
text near it reading "press Enter ↵".
Show a subtle background gradient or solid brand color a Typeform form might
use (soft pastel or dark navy), NOT plain white, to convey a "themed form"
feel.
Show a second version of this same screen as a "Thank You" screen: centered
checkmark icon, "Thanks for completing this form!" heading, small subtext,
and a subtle confetti/celebratory graphic.
Include a dark mode variant of the whole flow.
```

**5. Responses / Results View**
```
Design a results screen for a form-builder tool. Top tabs: "Summary" and
"Responses" (table view). 
Summary tab: one card per question, showing the question title and a small
bar chart or percentage breakdown for choice/yes-no/rating questions
(horizontal bars with option label + percentage), or just a response count for
open text/number questions.
Responses tab: a data table, one row per submission, columns per question
(truncated for long text), a timestamp column, and a "View" icon per row that
opens a full single-response detail modal (shows every Q&A pair for that
respondent in a clean list, plus a download link if a file was uploaded).
Top-right: "Export CSV" button (secondary/outline style) and total response
count badge.
Style consistent with the dashboard — same palette, rounded cards, Inter font.
Include a dark mode variant.
```

**6. Coming Soon placeholder**
```
Design a generic "Coming Soon" placeholder panel meant to sit inside a tab of
a SaaS dashboard. Center-aligned: a friendly line-art icon (a rocket, a
wrench, or a lock — pick one), a bold heading like "{{Feature}} — Coming
Soon", and one line of small grey supporting text ("We're working on
this — check back later"). Keep it minimal, no buttons, fits inside an
otherwise populated dashboard layout without feeling broken or unfinished.
Include a dark mode variant.
```

Each screen's exported code (or screenshots, where Stitch only produced static output) was carried into Antigravity before moving to Part 2.

### Part 2 — Antigravity Prompts (build + integration)

Prompt 0 (the context prompt) was pasted into a fresh Antigravity project first and kept pinned/available so every later prompt had the schema/API/folder structure in context. The numbered prompts were then run in order, each depending on the previous one already existing in the repo.

**Prompt 0 — Project context (pinned first)**
```
We are building a Typeform clone for an SDE Fullstack assignment. Stack:
Frontend: Next.js (TypeScript, App Router), Tailwind CSS, Framer Motion for
transitions, react-beautiful-dnd or dnd-kit for drag-and-drop.
Backend: FastAPI (Python), SQLAlchemy ORM, SQLite database.
No real authentication — assume a single default logged-in creator (seed one
row in a `creators` table, hardcode creator_id = 1 everywhere on the backend).

Repo structure:
backend/
  main.py, database.py, models.py, schemas.py, seed.py, requirements.txt
  routers/forms.py, routers/questions.py, routers/public.py, routers/responses.py
  uploads/ (local file storage for file-upload question type)
frontend/
  app/(builder)/forms/page.tsx
  app/(builder)/forms/[id]/edit/page.tsx
  app/(builder)/forms/[id]/responses/page.tsx
  app/f/[id]/page.tsx   <- PUBLIC respondent flow, no auth, must work standalone
  components/builder/, components/respondent/, components/ui/
  lib/api.ts, lib/types.ts, lib/theme.ts

Database schema (SQLite):
- creators(id, name, email)
- forms(id TEXT uuid PK, creator_id, title, description, status
  ['draft'|'published'], theme_config JSON, thank_you_message, created_at,
  updated_at)
- questions(id TEXT uuid PK, form_id FK, type, title, description, required
  BOOLEAN, order_index INT, options JSON, validation_config JSON)
  -- type is one of: short_text, long_text, multiple_choice, dropdown, email,
  -- number, yes_no, rating, file_upload
- responses(id TEXT uuid PK, form_id FK, submitted_at, is_complete BOOLEAN)
- answers(id TEXT uuid PK, response_id FK, question_id FK, answer_value TEXT)
  -- for file_upload questions, answer_value stores a relative path like
  -- uploads/{response_id}/{filename}

Mocked/placeholder features (render a reusable <ComingSoon feature="X" />
component, do NOT build real functionality): Logic/branching tab, Integrations
tab, Team/collaboration tab, Payment question type (show disabled with a
"Coming Soon" badge in the type picker).

Fully build: form builder CRUD + drag-reorder, publish/unpublish with
shareable link, public respondent full-screen one-question-at-a-time flow
with Framer Motion transitions + keyboard nav (Enter/arrows) + progress bar,
client+server validation, results table + single-response view + per-question
summary stats, CSV export, file-upload question type with local disk storage,
dark mode via CSS variables + Tailwind `dark:` classes + localStorage
persistence.

Keep code modular, typed (TypeScript strict on frontend, Pydantic schemas on
backend), and commented enough that I can explain every part in an evaluation
interview. Do not over-engineer — this is a 24-hour assignment, prioritize
working features over abstraction.

Acknowledge this context and wait for the next prompt before writing code.
```

**Prompt 1 — Backend scaffold + schema + seed**
```
Set up the FastAPI backend per the context above.
1. database.py: SQLite engine + session (file-based, e.g. app.db).
2. models.py: SQLAlchemy models for creators, forms, questions, responses,
   answers, exactly matching the schema in the context prompt. Use String
   UUIDs (generate with uuid4) as primary keys for forms/questions/
   responses/answers.
3. schemas.py: Pydantic models for all request/response bodies —
   FormCreate, FormUpdate, FormOut (with nested questions + response_count),
   QuestionCreate, QuestionUpdate, QuestionOut, ResponseOut, AnswerOut,
   ReorderRequest (list of question ids in new order).
4. main.py: FastAPI app, CORS middleware allowing the Next.js dev origin,
   mount /uploads as a static files directory, include all routers.
5. seed.py: a script that clears and reseeds the DB with:
   - 1 default creator
   - 2 published forms with mixed question types (include at least one
     multiple_choice, one rating, one file_upload, one email, one yes_no per
     form)
   - 8-10 sample responses spread across both forms with realistic answers
   Make it runnable standalone: `python seed.py`.
6. requirements.txt with fastapi, uvicorn, sqlalchemy, pydantic, python-multipart.

After generating, tell me the exact commands to run the server locally.
```

**Prompt 2 — Forms + Questions CRUD routers**
```
Build routers/forms.py and routers/questions.py per the API listed below.
Hardcode creator_id = 1 for all creator-scoped queries (no auth).

Forms:
GET    /api/forms                      -> list forms for creator, include
                                           response_count via a query/join
POST   /api/forms                      -> create form (title required,
                                           status defaults to 'draft')
GET    /api/forms/{id}                 -> full form + ordered questions
PUT    /api/forms/{id}                 -> update title/description/theme_config
DELETE /api/forms/{id}                 -> cascade delete questions/responses/answers
POST   /api/forms/{id}/duplicate       -> deep copy form + all its questions,
                                           new form status = 'draft'
POST   /api/forms/{id}/publish         -> toggle status between draft/published,
                                           return the shareable public URL
                                           (frontend base + /f/{id})

Questions:
POST   /api/forms/{id}/questions               -> add question, order_index =
                                                   max(existing)+1
PUT    /api/questions/{id}                     -> edit any field
DELETE /api/questions/{id}                     -> delete + re-index remaining
                                                   order_index values
POST   /api/forms/{id}/questions/reorder       -> body: list of question ids
                                                   in new order, update
                                                   order_index accordingly

Validate that options is required (non-empty list) when type is
multiple_choice or dropdown. Return proper 404s for missing forms/questions
and 422 for validation errors with clear messages.
```

**Prompt 3 — Public respondent endpoints + validation**
```
Build routers/public.py — no auth, only serves published forms.

GET  /api/public/forms/{id}
   -> 404 if form doesn't exist or status != 'published'
   -> return form title, description, theme_config, thank_you_message, and
      ordered questions (WITHOUT any creator-only metadata)

POST /api/public/forms/{id}/submit
   -> Accept multipart/form-data (to support optional file uploads) OR plain
      JSON if the form has no file_upload question — detect by content-type.
   -> Body: one answer per question, keyed by question_id.
   -> Server-side validation before saving anything:
        - required questions must have a non-empty answer
        - email type must match a basic email regex
        - number type must parse as a number
        - multiple_choice/dropdown answer must be one of the question's options
        - rating must be within the configured scale (default 1-5)
      On failure, return 422 with a dict of {question_id: error_message} so
      the frontend can highlight the exact failing question.
   -> On success: create a responses row (is_complete=True), create an
      answers row per question. For file_upload answers, save the uploaded
      file to uploads/{response_id}/{filename} and store that relative path
      as answer_value. Return the created response id + a success flag.

Also add a lightweight endpoint to save partial progress (bonus, keep
simple): POST /api/public/forms/{id}/partial -> upserts a response with
is_complete=False and whatever answers exist so far. Don't over-build this,
just enough to say partial-tracking exists.
```

**Prompt 4 — Responses, stats, CSV export**
```
Build routers/responses.py.

GET /api/forms/{id}/responses
   -> list of responses for a form: id, submitted_at, is_complete, and a
      short preview (first 2 answers concatenated)

GET /api/responses/{id}
   -> full response detail: every question title + the given answer_value,
      in question order. For file_upload answers, return a full URL to the
      stored file (via the /uploads static mount).

GET /api/forms/{id}/stats
   -> per-question summary:
        - multiple_choice/dropdown/yes_no: count + percentage per option
        - rating: average + distribution counts
        - short_text/long_text/email/number/file_upload: just total answered
          count (no aggregation needed)

GET /api/forms/{id}/export
   -> stream a CSV file: one row per response, one column per question
      (question title as header), file_upload cells contain the file URL.
      Set Content-Disposition so it downloads as `{form_title}_responses.csv`.
```

**Prompt 5 — Frontend scaffold + API client + theming**
```
Scaffold the Next.js frontend (TypeScript, App Router, Tailwind).
1. lib/types.ts: TypeScript interfaces mirroring the backend Pydantic
   schemas (Form, Question, QuestionType union type, ResponseDetail, Stats).
2. lib/api.ts: typed fetch wrappers for every backend endpoint listed in
   prompts 2-4 (base URL from an env var NEXT_PUBLIC_API_URL).
3. lib/theme.ts + a ThemeProvider: dark mode via a `dark` class toggled on
   <html>, persisted in localStorage, defaulting to system preference. Define
   CSS variables for --bg, --text, --card, --accent, --border in globals.css,
   with a coral/orange accent (#FF3D57) as default light theme and a
   Typeform-like dark navy for dark mode.
4. A toast/notification system (simple, e.g. a context + a stacked toast
   component) usable app-wide for success/error messages.
5. A reusable <ComingSoon feature="string" /> component matching the Stitch
   "Coming Soon" screen design.
6. Base layout with the sidebar nav (matching the Stitch dashboard design)
   used by all /forms routes, but NOT by the public /f/[id] respondent route
   (that route should have its own full-screen layout with no sidebar).

Use the Stitch screen designs I'll paste/describe next as the visual
reference for spacing, colors, and component shapes.
```

**Prompt 6 — Form builder UI**
```
Build app/(builder)/forms/page.tsx (dashboard) and
app/(builder)/forms/[id]/edit/page.tsx (builder), matching the Stitch
dashboard + builder screens I generated.

Dashboard: fetch forms list, render cards with status pill, response count,
kebab menu wired to duplicate/publish/delete (with confirm modal for delete),
"+ Create Form" button that POSTs a new blank form and redirects straight
into its builder.

Builder page, two-panel layout:
- components/builder/QuestionList.tsx: draggable list (use dnd-kit) of
  question cards, calls the reorder endpoint on drop, "+ Add Question"
  appends a new short_text question by default.
- components/builder/QuestionEditor.tsx: right panel bound to the selected
  question — title/description inputs, required toggle, type dropdown
  (file_upload enabled, "payment" type shown disabled with Coming Soon
  badge), options editor for multiple_choice/dropdown. Debounce saves (PUT)
  on change, show a small "Saved" indicator.
- components/builder/LivePreview.tsx: renders the currently selected question
  exactly as it will appear to a respondent (reuse the respondent question
  components from Part 7 rather than duplicating styles).
- Top bar tabs: Build (active), Logic / Integrations / Team all render
  <ComingSoon feature="..." />. Publish button calls the publish endpoint and
  shows the shareable link in a copyable modal/toast on success.
```

**Prompt 7 — Respondent flow (the hardest, most important screen)**
```
Build app/f/[id]/page.tsx — the public, no-auth, full-screen respondent
experience, matching the Stitch respondent-flow screen exactly in look and
feel. This is the most important part of the assignment, prioritize polish.

Requirements:
- Fetch GET /api/public/forms/{id} on load; 404/unpublished -> friendly
  "This form isn't available" screen.
- One question fully visible at a time, centered, full viewport.
- components/respondent/QuestionSlide.tsx: one component per question type
  (ShortText, LongText, MultipleChoice, Dropdown, Email, Number, YesNo,
  Rating, FileUpload) — switch on question.type. Multiple choice shows
  lettered options (A/B/C) with keyboard shortcut selection too.
- Animate transitions between questions with Framer Motion: current question
  slides/fades out upward, next slides/fades in from below (or Typeform's
  signature vertical slide) — smooth, ~300-400ms.
- Keyboard nav: Enter advances if the current question is valid, ArrowUp/Down
  moves between already-answered questions, Escape does nothing destructive.
- components/respondent/ProgressBar.tsx: thin bar at top,
  width = (answeredIndex+1)/total.
- Client-side validation per type (mirror the backend rules) — show inline
  error and block advancing if invalid; required questions can't be skipped,
  non-required can via a "skip" affordance if the design has one.
- Keep all answers in local component state until the very end; on the last
  question's submit, POST everything at once to
  /api/public/forms/{id}/submit as multipart/form-data (so file_upload
  works), show a loading state, then render
  components/respondent/ThankYouScreen.tsx using the form's thank_you_message.
- On server validation error (422), map field errors back to the
  corresponding question and let the user jump back to fix it.
- Respect the form's theme_config for background/accent color if present,
  else fall back to sensible defaults. Support dark mode toggle here too.
```

**Prompt 8 — Results / responses UI**
```
Build app/(builder)/forms/[id]/responses/page.tsx matching the Stitch
results screen.

- Tabs: "Summary" and "Responses".
- Summary tab: fetch GET /api/forms/{id}/stats, render one card per question
  — bar/percentage breakdown for choice/yes-no/rating types (simple CSS bars
  are fine, no chart library required unless you want Recharts), plain
  counts for open-ended/number/file types.
- Responses tab: fetch GET /api/forms/{id}/responses, render as a table
  (question columns truncated), each row has a "View" action opening a modal
  that fetches GET /api/responses/{id} and shows every Q&A pair, with a
  clickable download link for any file_upload answer.
- "Export CSV" button in the top bar calls GET /api/forms/{id}/export and
  triggers a browser download of the returned file.
- Empty state if a form has zero responses yet.
```

**Prompt 9 — Final polish, seed check, deploy prep**
```
Final pass before deployment:
1. Add toasts for every mutation across the app (create/edit/delete/publish/
   duplicate/submit success and error cases) using the toast system from
   Prompt 5.
2. Confirm dark mode works correctly across dashboard, builder, respondent
   flow, and results pages — fix any unstyled dark-mode gaps.
3. Verify backend seed.py produces a demo-ready state: run it and print the
   2 seeded form IDs and their /f/{id} public links so I can test manually.
4. Add a root README.md with: setup instructions (backend venv + pip
   install + uvicorn command, frontend npm install + npm run dev, env vars
   needed), tech stack summary, architecture overview (one paragraph +
   the folder tree), the full database schema (paste the SQL from the
   context prompt), API endpoint list, and an "Assumptions & Placeholders"
   section listing exactly what's mocked (Logic, Integrations, Team,
   Payment type) and why.
5. Give me the exact deployment steps for: backend on Render/Railway
   (Dockerfile or start command + persistent disk note for SQLite +
   uploads/), frontend on Vercel (env var for NEXT_PUBLIC_API_URL pointing
   at the deployed backend).
```

### Notes I kept in mind for the evaluation interview

Since AI tools are allowed but every line must be explainable, I made a point of actually reading the generated diff after each Antigravity prompt before moving to the next one. Two things I specifically rehearsed:

- **Why JSON columns for `options`/`validation_config`/`theme_config`** instead of separate tables — the same schema-flexibility tradeoff applies here as in past projects: it avoids a rigid, wide table or an over-normalized EAV structure for config that varies per question type.
- **Why "Coming Soon" over building fake branching logic** — the assignment explicitly lists Logic/Integrations/Team/Payment as optional or mockable, so scoping them out was a deliberate prioritization call to protect time for the two features called out as hardest and most important: the builder and the respondent flow.
