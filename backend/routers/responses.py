import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import get_db
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter()

class ResponsePreviewOut(BaseModel):
    id: str
    submitted_at: datetime
    is_complete: bool
    preview: str

class AnswerDetailOut(BaseModel):
    question_title: str
    answer_value: Optional[str]
    type: str

class ResponseDetailOut(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    is_complete: bool
    answers: List[AnswerDetailOut]

def get_form_or_404(db: Session, form_id: str, creator_id: int = 1):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == creator_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@router.get("/forms/{id}/responses", response_model=List[ResponsePreviewOut])
def list_form_responses(id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    responses = db.query(models.Response).filter(models.Response.form_id == id).order_by(models.Response.submitted_at.desc()).all()
    print(f"[responses] Form {id}: found {len(responses)} responses")
    
    # Sort questions by order_index to get the first two
    questions = sorted(form.questions, key=lambda q: q.order_index)
    first_two_q_ids = [q.id for q in questions[:2]]
    
    result = []
    for r in responses:
        # Get answers for first two questions
        ans1 = next((a.answer_value for a in r.answers if a.question_id == (first_two_q_ids[0] if len(first_two_q_ids) > 0 else None)), "")
        ans2 = next((a.answer_value for a in r.answers if a.question_id == (first_two_q_ids[1] if len(first_two_q_ids) > 1 else None)), "")
        
        parts = [str(ans1) if ans1 else "", str(ans2) if ans2 else ""]
        preview = " | ".join([p for p in parts if p]).strip(" | ")
        if not preview:
            preview = "No answers yet"
            
        result.append(ResponsePreviewOut(
            id=r.id,
            submitted_at=r.submitted_at,
            is_complete=r.is_complete,
            preview=preview
        ))
    return result


@router.get("/responses/{id}", response_model=ResponseDetailOut)
def get_response_detail(id: str, request: Request, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
        
    form = db.query(models.Form).filter(models.Form.id == response.form_id, models.Form.creator_id == 1).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or unauthorized")
        
    questions = sorted(form.questions, key=lambda q: q.order_index)
    
    base_url = str(request.base_url).rstrip("/")
    
    answers_out = []
    for q in questions:
        ans = next((a for a in response.answers if a.question_id == q.id), None)
        ans_val = ans.answer_value if ans else None
        
        if q.type == "file_upload" and ans_val:
            ans_val = f"{base_url}/{ans_val}"
            
        answers_out.append(AnswerDetailOut(
            question_title=q.title,
            answer_value=ans_val,
            type=q.type
        ))
        
    return ResponseDetailOut(
        id=response.id,
        form_id=response.form_id,
        submitted_at=response.submitted_at,
        is_complete=response.is_complete,
        answers=answers_out
    )

@router.get("/forms/{id}/stats")
def get_form_stats(id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    
    stats = {}
    for q in form.questions:
        answers = [a for a in q.answers if a.response.is_complete]
        total = len(answers)
        
        if q.type in ["multiple_choice", "dropdown", "yes_no"]:
            counts = {}
            for a in answers:
                val = a.answer_value
                if val:
                    counts[val] = counts.get(val, 0) + 1
                    
            percentages = {k: round((v / total) * 100, 1) for k, v in counts.items()} if total > 0 else {}
            stats[q.id] = {
                "title": q.title,
                "type": q.type,
                "total_answered": total,
                "counts": counts,
                "percentages": percentages
            }
            
        elif q.type == "rating":
            counts = {}
            total_sum = 0
            for a in answers:
                val = a.answer_value
                if val and val.isdigit():
                    v = int(val)
                    counts[v] = counts.get(v, 0) + 1
                    total_sum += v
            
            average = round(total_sum / total, 2) if total > 0 else 0
            stats[q.id] = {
                "title": q.title,
                "type": q.type,
                "total_answered": total,
                "average": average,
                "counts": counts
            }
            
        else:
            stats[q.id] = {
                "title": q.title,
                "type": q.type,
                "total_answered": total
            }
            
    return stats

@router.get("/forms/{id}/export")
def export_responses_csv(id: str, request: Request, db: Session = Depends(get_db)):
    form = get_form_or_404(db, id)
    responses = db.query(models.Response).filter(models.Response.form_id == id, models.Response.is_complete == True).order_by(models.Response.submitted_at.desc()).all()
    questions = sorted(form.questions, key=lambda q: q.order_index)
    
    base_url = str(request.base_url).rstrip("/")
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    headers = ["Response ID", "Submitted At"] + [q.title for q in questions]
    writer.writerow(headers)
    
    # Rows
    for r in responses:
        row = [r.id, r.submitted_at.isoformat()]
        for q in questions:
            ans = next((a for a in r.answers if a.question_id == q.id), None)
            val = ans.answer_value if ans else ""
            if q.type == "file_upload" and val:
                val = f"{base_url}/{val}"
            row.append(val)
        writer.writerow(row)
        
    output.seek(0)
    
    filename = f"{form.title.replace(' ', '_').lower()}_responses.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
