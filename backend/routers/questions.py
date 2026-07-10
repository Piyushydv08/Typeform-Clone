from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

def get_question_or_404(db: Session, question_id: str):
    # Ensure the question belongs to a form owned by creator_id = 1
    q = db.query(models.Question).join(models.Form).filter(
        models.Question.id == question_id,
        models.Form.creator_id == 1
    ).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@router.put("/{id}", response_model=schemas.QuestionOut)
def update_question(id: str, q_in: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    q = get_question_or_404(db, id)
    
    # Validation logic for options
    check_type = q_in.type if q_in.type is not None else q.type
    check_options = q_in.options if q_in.options is not None else q.options
    
    if check_type in ['multiple_choice', 'dropdown'] and not check_options:
        raise HTTPException(status_code=422, detail="Options are required for this question type")

    if q_in.type is not None: q.type = q_in.type
    if q_in.title is not None: q.title = q_in.title
    if q_in.description is not None: q.description = q_in.description
    if q_in.required is not None: q.required = q_in.required
    if q_in.order_index is not None: q.order_index = q_in.order_index
    if q_in.options is not None: q.options = q_in.options
    if q_in.validation_config is not None: q.validation_config = q_in.validation_config
    
    db.commit()
    db.refresh(q)
    return q

@router.delete("/{id}")
def delete_question(id: str, db: Session = Depends(get_db)):
    q = get_question_or_404(db, id)
    form_id = q.form_id
    
    db.delete(q)
    db.commit()
    
    # Re-index remaining questions
    remaining = db.query(models.Question).filter(models.Question.form_id == form_id).order_by(models.Question.order_index).all()
    for idx, rem_q in enumerate(remaining):
        rem_q.order_index = idx
        
    db.commit()
    return {"detail": "Question deleted"}
