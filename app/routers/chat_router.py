from fastapi import APIRouter, Depends, HTTPException, Request, Response
from requests import Session
from app.controllers.chat_logs_controller import get_chat_logs_by_user_id
from app.core.auth import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.get('/get-chat-history')
def get_chat_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db) ):
    try:
        chat_history = get_chat_logs_by_user_id(db=db, user_id=current_user['user_id'])
        return chat_history
    except Exception as e:
        print(f"Error occurred while fetching chat history: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching chat history.")