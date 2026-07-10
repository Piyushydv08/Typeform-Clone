import os
from database import SessionLocal, engine
from models import Base, Creator, Form, Question, Response, Answer

def seed_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding creator...")
        creator = Creator(id=1, name="Admin User", email="admin@example.com")
        db.add(creator)
        db.commit()

        print("Seeding forms...")
        form1 = Form(
            title="Customer Feedback Survey",
            description="We would love to hear your thoughts.",
            status="published",
            creator_id=1,
            thank_you_message="Thank you for your feedback!"
        )
        form2 = Form(
            title="Event Registration",
            description="Register for the upcoming tech conference.",
            status="published",
            creator_id=1,
            thank_you_message="See you at the event!"
        )
        db.add_all([form1, form2])
        db.commit()

        print("Seeding questions...")
        f1_q1 = Question(form_id=form1.id, type="short_text", title="What is your name?", order_index=0, required=True)
        f1_q2 = Question(form_id=form1.id, type="email", title="What is your email address?", order_index=1, required=True)
        f1_q3 = Question(form_id=form1.id, type="rating", title="How would you rate our service?", order_index=2, required=True)
        f1_q4 = Question(form_id=form1.id, type="multiple_choice", title="What did you like most?", order_index=3, options=["Speed", "Quality", "Price"], required=False)
        f1_q5 = Question(form_id=form1.id, type="yes_no", title="Would you recommend us?", order_index=4, required=True)
        f1_q6 = Question(form_id=form1.id, type="file_upload", title="Please upload a screenshot of the issue (if any)", order_index=5, required=False)
        
        f2_q1 = Question(form_id=form2.id, type="short_text", title="Full Name", order_index=0, required=True)
        f2_q2 = Question(form_id=form2.id, type="email", title="Email Address", order_index=1, required=True)
        f2_q3 = Question(form_id=form2.id, type="dropdown", title="Job Title", order_index=2, options=["Developer", "Designer", "Manager", "Other"], required=True)
        
        db.add_all([f1_q1, f1_q2, f1_q3, f1_q4, f1_q5, f1_q6, f2_q1, f2_q2, f2_q3])
        db.commit()

        print("Seeding responses...")
        for i in range(5):
            r = Response(form_id=form1.id)
            db.add(r)
            db.commit()
            db.add_all([
                Answer(response_id=r.id, question_id=f1_q1.id, answer_value=f"User {i}"),
                Answer(response_id=r.id, question_id=f1_q2.id, answer_value=f"user{i}@example.com"),
                Answer(response_id=r.id, question_id=f1_q3.id, answer_value=str(4 + (i%2))),
                Answer(response_id=r.id, question_id=f1_q4.id, answer_value="Quality"),
                Answer(response_id=r.id, question_id=f1_q5.id, answer_value="true"),
            ])
            db.commit()
            
        for i in range(4):
            r = Response(form_id=form2.id)
            db.add(r)
            db.commit()
            db.add_all([
                Answer(response_id=r.id, question_id=f2_q1.id, answer_value=f"Attendee {i}"),
                Answer(response_id=r.id, question_id=f2_q2.id, answer_value=f"attendee{i}@test.com"),
                Answer(response_id=r.id, question_id=f2_q3.id, answer_value="Developer" if i%2==0 else "Designer"),
            ])
            db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
