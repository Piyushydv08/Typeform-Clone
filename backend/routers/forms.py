from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter()
CREATOR_ID = 1

def get_form_or_404(db: Session, form_id: str):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

def get_form_out(db: Session, form: models.Form) -> schemas.FormOut:
    form_out = schemas.FormOut.model_validate(form)
    form_out.questions = sorted(form_out.questions, key=lambda q: q.order_index)
    form_out.response_count = db.query(models.Response).filter(models.Response.form_id == form.id).count()
    return form_out

@router.get("", response_model=List[schemas.FormOut])
def list_forms(db: Session = Depends(get_db)):
    forms = db.query(models.Form).filter(models.Form.creator_id == CREATOR_ID).all()
    return [get_form_out(db, f) for f in forms]

@router.post("", response_model=schemas.FormOut)
def create_form(form_in: schemas.FormCreate, db: Session = Depends(get_db)):
    new_form = models.Form(
        creator_id=CREATOR_ID,
        title=form_in.title,
        description=form_in.description,
        status=form_in.status,
        theme_config=form_in.theme_config,
        thank_you_message=form_in.thank_you_message
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    return get_form_out(db, new_form)

@router.get("/{id}", response_model=schemas.FormOut)
def get_form(id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    return get_form_out(db, form)

@router.put("/{id}", response_model=schemas.FormOut)
def update_form(id: str, form_in: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    if form_in.title is not None: form.title = form_in.title
    if form_in.description is not None: form.description = form_in.description
    if form_in.status is not None: form.status = form_in.status
    if form_in.theme_config is not None: form.theme_config = form_in.theme_config
    if form_in.thank_you_message is not None: form.thank_you_message = form_in.thank_you_message
    
    db.commit()
    db.refresh(form)
    return get_form_out(db, form)

@router.delete("/{id}")
def delete_form(id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    db.delete(form)
    db.commit()
    return {"detail": "Form deleted"}

@router.post("/{id}/duplicate", response_model=schemas.FormOut)
def duplicate_form(id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    new_form = models.Form(
        creator_id=CREATOR_ID,
        title=form.title + " (Copy)",
        description=form.description,
        status="draft",
        theme_config=form.theme_config,
        thank_you_message=form.thank_you_message
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    
    for q in form.questions:
        new_q = models.Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            order_index=q.order_index,
            options=q.options,
            validation_config=q.validation_config
        )
        db.add(new_q)
    db.commit()
    db.refresh(new_form)
    return get_form_out(db, new_form)

@router.post("/{id}/publish")
def publish_form(id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    form.status = "published" if form.status == "draft" else "draft"
    db.commit()
    db.refresh(form)
    return {"url": f"http://localhost:3000/f/{form.id}", "status": form.status}

# --- Question Endpoints mapped under /api/forms/{id}/questions ---

@router.post("/{id}/questions", response_model=schemas.QuestionOut)
def add_question(id: str, q_in: schemas.QuestionCreate, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    
    if q_in.type in ['multiple_choice', 'dropdown'] and not q_in.options:
        raise HTTPException(status_code=422, detail="Options are required for this question type")
        
    order_idx = q_in.order_index
    if order_idx is None:
        existing_indices = [q.order_index for q in form.questions]
        order_idx = max(existing_indices) + 1 if existing_indices else 0
        
    new_q = models.Question(
        form_id=form.id,
        type=q_in.type,
        title=q_in.title,
        description=q_in.description,
        required=q_in.required,
        order_index=order_idx,
        options=q_in.options,
        validation_config=q_in.validation_config
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.post("/{id}/questions/reorder")
def reorder_questions(id: str, req: schemas.ReorderRequest, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    
    # Validate all question_ids belong to this form
    form_question_ids = {q.id for q in form.questions}
    if not set(req.question_ids).issubset(form_question_ids):
        raise HTTPException(status_code=422, detail="Invalid question IDs provided")
        
    # Update order
    for idx, q_id in enumerate(req.question_ids):
        q = db.query(models.Question).filter(models.Question.id == q_id).first()
        if q:
            q.order_index = idx
            
    db.commit()
    return {"detail": "Questions reordered"}
