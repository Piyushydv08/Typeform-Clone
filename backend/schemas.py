from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class QuestionBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    order_index: int = 0
    options: List[str] = []
    validation_config: Dict[str, Any] = {}

class QuestionCreate(QuestionBase):
    order_index: Optional[int] = None

class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    order_index: Optional[int] = None
    options: Optional[List[str]] = None
    validation_config: Optional[Dict[str, Any]] = None

class QuestionOut(QuestionBase):
    id: str
    form_id: str
    
    model_config = ConfigDict(from_attributes=True)

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "draft"
    theme_config: Dict[str, Any] = {}
    thank_you_message: Optional[str] = None

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    theme_config: Optional[Dict[str, Any]] = None
    thank_you_message: Optional[str] = None

class FormOut(FormBase):
    id: str
    creator_id: int
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionOut] = []
    response_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class AnswerBase(BaseModel):
    question_id: str
    answer_value: Optional[str] = None

class AnswerOut(AnswerBase):
    id: str
    response_id: str
    
    model_config = ConfigDict(from_attributes=True)

class ResponseOut(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    is_complete: bool
    answers: List[AnswerOut] = []
    
    model_config = ConfigDict(from_attributes=True)

class ReorderRequest(BaseModel):
    question_ids: List[str]

class PublicQuestionOut(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool
    options: List[str]
    validation_config: Dict[str, Any]
    
    model_config = ConfigDict(from_attributes=True)

class PublicFormOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    theme_config: Dict[str, Any]
    thank_you_message: Optional[str] = None
    questions: List[PublicQuestionOut] = []
    
    model_config = ConfigDict(from_attributes=True)
