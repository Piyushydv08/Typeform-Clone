from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

import models
from database import engine
from routers import forms, questions, public, responses

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Typeform Clone API")

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://typeform-clone-ochre.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router, prefix="/api/forms", tags=["forms"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(responses.router, prefix="/api", tags=["responses"])
app.include_router(public.router, prefix="/api/public", tags=["public"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Typeform Clone API"}
