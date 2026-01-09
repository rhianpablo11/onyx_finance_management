from sqlalchemy.orm import Session
from app.models.chat_logs import Chat_logs


def create_new_chat_log(text_typed: str, db: Session, user_id: int, ai_json_response: dict):
    new_chat_log = Chat_logs(
        user_id=user_id,
        message_user=text_typed,
        ai_response=ai_json_response
    )

    db.add(new_chat_log)
    db.commit()
    db.refresh(new_chat_log)