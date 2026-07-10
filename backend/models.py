from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
import uuid
import datetime
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    forms = relationship("Form", back_populates="creator")


class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft")  # 'draft' | 'published'
    theme_config = Column(JSON, default=dict)
    thank_you_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("Creator", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    form_id = Column(String, ForeignKey("forms.id"))
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False)
    order_index = Column(Integer, nullable=False)
    options = Column(JSON, default=list)
    validation_config = Column(JSON, default=dict)

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    form_id = Column(String, ForeignKey("forms.id"))
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_complete = Column(Boolean, default=True)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    response_id = Column(String, ForeignKey("responses.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    answer_value = Column(Text, nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
