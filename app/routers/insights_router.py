from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.controllers.insights_controller import get_investigator_insights, mark_insight_as_read, mark_insight_as_read
from app.controllers.insights_controller import get_prophet_insights
from app.core.auth import get_current_user
from app.core.database import get_db


router = APIRouter()

@router.get("/insights", status_code=200)
def get_insights(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        insights_prophet = get_prophet_insights(current_user['user_id'], db)
        insights_investigator = get_investigator_insights(current_user['user_id'], db)
        return {
            "prophet": insights_prophet,
            "investigator": insights_investigator
        }
    except Exception as e:
        print(f"Error occurred while fetching insights: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post('/insights/is_read/{insight_id}', status_code=200)
def change_insight_as_read_status(insight_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = mark_insight_as_read(insight_id=insight_id, user_id=current_user['user_id'], db=db)
    if result.get("message") == "Insight marked as read":
        return {"message": "Insight marked as read"}
    else:
        raise HTTPException(status_code=500, detail="Failed to mark insight as read")