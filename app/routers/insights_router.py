from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.controllers.insights_controller import get_anomalie_insights, get_balance_of_last_months, get_investigator_insights, get_main_categorys, mark_insight_as_read, mark_insight_as_read
from app.controllers.insights_controller import get_prophet_insights
from app.controllers.user_controller import get_subscriber_status
from app.core.auth import get_current_user
from app.core.database import get_db


router = APIRouter()

@router.get("/", status_code=200)
def get_insights(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        status_subscriber = get_subscriber_status(db, current_user['user_id'])
        
        if not status_subscriber:
            raise HTTPException(status_code=403, detail="Access denied. Subscription required.")
        
        insights_prophet = get_prophet_insights(current_user['user_id'], db)
        insights_investigator = get_investigator_insights(current_user['user_id'], db)
        categorys_of_expenses = get_main_categorys(current_user['user_id'], db)
        month_expenses_graphic = get_balance_of_last_months(current_user['user_id'], db)
        insights_anomalie = get_anomalie_insights(current_user['user_id'], db)
        return {
            "prophet": insights_prophet,
            "investigator": insights_investigator,
            "categorys_of_expenses": categorys_of_expenses,
            "month_expenses_graphic": month_expenses_graphic,
            "anomalie": insights_anomalie
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