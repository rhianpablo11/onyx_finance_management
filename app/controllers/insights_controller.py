from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.ia_insights import Ia_insights


def get_prophet_insights(user_id: int, db: Session):
    
    try:
        stmt = (select(Ia_insights)
                .where(Ia_insights.user_id == user_id, Ia_insights.type_insight == 'prophet')
                .order_by(Ia_insights.created_at.desc()))
        insight = db.execute(stmt).scalars().first()
        return insight

    except Exception as e:
        print(f"Error occurred while fetching Prophet insights: {e}")
        return []


def get_investigator_insights(user_id: int, db: Session):
    
    try:
        stmt = (select(Ia_insights)
                .where(Ia_insights.user_id == user_id, Ia_insights.type_insight == 'investigator')
                .order_by(Ia_insights.created_at.desc()))
        insight = db.execute(stmt).scalars().first()
        return insight

    except Exception as e:
        print(f"Error occurred while fetching Investigator insights: {e}")
        return []


def add_new_insight_prophet(user_id: int, title: str, text_content: str, db: Session):
    try:
        new_insight = Ia_insights(
            user_id=user_id,
            type_insight='prophet',
            title=title,
            text_content=text_content
        )
        db.add(new_insight)
        db.commit()
        db.refresh(new_insight)
        return new_insight

    except Exception as e:
        print(f"Error occurred while adding new Prophet insight: {e}")
        db.rollback()
        return None
    

def add_new_insight_investigator(user_id: int, title: str, text_content: str, db: Session):
    try:
        new_insight = Ia_insights(
            user_id=user_id,
            type_insight='investigator',
            title=title,
            text_content=text_content
        )
        db.add(new_insight)
        db.commit()
        db.refresh(new_insight)
        return new_insight

    except Exception as e:
        print(f"Error occurred while adding new Investigator insight: {e}")
        db.rollback()
        return None


def mark_insight_as_read(insight_id: int, user_id: int, db: Session):
    try:
        insight = db.query(Ia_insights).filter(Ia_insights.id == insight_id, Ia_insights.user_id == user_id).first()
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        insight.is_read = True
        db.commit()
        return {"message": "Insight marked as read"}
    except Exception as e:
        print(f"Error occurred while marking insight as read: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")