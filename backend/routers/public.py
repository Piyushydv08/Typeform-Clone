import re
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

@router.get("/forms/{id}", response_model=schemas.PublicFormOut)
def get_public_form(id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == id, models.Form.status == 'published').first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or not published")
        
    # Sort questions by order_index
    form.questions.sort(key=lambda q: q.order_index)
    
    return form

@router.post("/forms/{id}/submit")
async def submit_form(id: str, request: Request, db: Session = Depends(get_db)):
    print(f"[submit] Received submission for form {id}")
    form = db.query(models.Form).filter(models.Form.id == id, models.Form.status == 'published').first()
    if not form:
        print(f"[submit] Form {id} not found or not published")
        raise HTTPException(status_code=404, detail="Form not found")
        
    content_type = request.headers.get("content-type", "")
    answers_dict = {}
    files_dict = {}
    
    if "multipart/form-data" in content_type:
        form_data = await request.form()
        for key, value in form_data.items():
            if isinstance(value, UploadFile):
                files_dict[key] = value
            else:
                answers_dict[key] = value
    else:
        try:
            answers_dict = await request.json()
        except:
            answers_dict = {}
            
    # Validations
    errors = {}
    for q in form.questions:
        ans = answers_dict.get(q.id)
        if q.type == 'file_upload':
            file_ans = files_dict.get(q.id)
            if q.required and not file_ans:
                errors[q.id] = "File upload is required."
        else:
            if q.required and (ans is None or str(ans).strip() == ""):
                errors[q.id] = "This field is required."
            elif ans is not None and str(ans).strip() != "":
                val = str(ans).strip()
                if q.type == "email":
                    if not re.match(r"[^@]+@[^@]+\.[^@]+", val):
                        errors[q.id] = "Invalid email format."
                elif q.type == "number":
                    try:
                        float(val)
                    except ValueError:
                        errors[q.id] = "Must be a valid number."
                elif q.type in ["multiple_choice", "dropdown"]:
                    if val not in q.options:
                        errors[q.id] = "Please select a valid option."
                elif q.type == "rating":
                    try:
                        v = int(val)
                        scale = q.validation_config.get("scale", 5) if q.validation_config else 5
                        if v < 1 or v > scale:
                            errors[q.id] = f"Rating must be between 1 and {scale}."
                    except ValueError:
                        errors[q.id] = "Rating must be an integer."

    if errors:
        raise HTTPException(status_code=422, detail=errors)
        
    # Check if a partial response already exists for this submission
    # (Client might send response_id if they started via /partial)
    response_id = answers_dict.get("response_id")
    response = None
    if response_id:
        response = db.query(models.Response).filter(models.Response.id == response_id, models.Response.form_id == id).first()
        
    if response:
        response.is_complete = True
        # We will rewrite the answers below
        db.query(models.Answer).filter(models.Answer.response_id == response.id).delete()
    else:
        response = models.Response(form_id=id, is_complete=True)
        db.add(response)
        db.commit()
        db.refresh(response)
    
    # Save answers
    for q in form.questions:
        if q.type == "file_upload":
            file_obj = files_dict.get(q.id)
            if file_obj:
                upload_dir = f"uploads/{response.id}"
                os.makedirs(upload_dir, exist_ok=True)
                file_path = f"{upload_dir}/{file_obj.filename}"
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file_obj.file, buffer)
                db.add(models.Answer(response_id=response.id, question_id=q.id, answer_value=file_path))
        else:
            ans = answers_dict.get(q.id)
            if ans is not None and str(ans).strip() != "" and q.id != "response_id":
                db.add(models.Answer(response_id=response.id, question_id=q.id, answer_value=str(ans)))
                
    db.commit()
    print(f"[submit] Saved response {response.id} for form {id} with answers for {len(form.questions)} questions")
    return {"success": True, "response_id": response.id}


@router.post("/forms/{id}/partial")
async def partial_submit(id: str, request: Request, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == id, models.Form.status == 'published').first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    content_type = request.headers.get("content-type", "")
    answers_dict = {}
    response_id = None
    
    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                response_id = body.get("response_id")
                answers_dict = body.get("answers", body)
                # If they passed everything flatly
                if "response_id" in answers_dict and "answers" not in body:
                    response_id = answers_dict.pop("response_id")
        except:
            pass
            
    # Find or create response
    response = None
    if response_id:
        response = db.query(models.Response).filter(models.Response.id == response_id, models.Response.form_id == id).first()
        
    if not response:
        response = models.Response(form_id=id, is_complete=False)
        db.add(response)
        db.commit()
        db.refresh(response)
        
    # Delete existing answers to overwrite
    db.query(models.Answer).filter(models.Answer.response_id == response.id).delete()
    
    for q_id, val in answers_dict.items():
        if val is not None and str(val).strip() != "" and q_id != "response_id":
            # Just store partials blindly, no deep validation required for partial saves
            db.add(models.Answer(response_id=response.id, question_id=q_id, answer_value=str(val)))
            
    db.commit()
    return {"success": True, "response_id": response.id}
